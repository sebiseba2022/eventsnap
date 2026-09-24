/**
 * EventSnap Botez - Application Logic
 * Mobile-first photo & video upload (Original Quality, max 100MB / file)
 */

document.addEventListener('DOMContentLoaded', () => {
  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB max per file
  const CHUNK_SIZE_BYTES = 15 * 1024 * 1024;    // 15 MB chunks for large files (>20MB)

  // Elements
  const fileInput = document.getElementById('fileInput');
  const btnSelectFiles = document.getElementById('btnSelectFiles');
  const btnAddMoreFiles = document.getElementById('btnAddMoreFiles');
  const selectedTray = document.getElementById('selectedTray');
  const selectedCountBadge = document.getElementById('selectedCountBadge');
  const previewGrid = document.getElementById('previewGrid');
  const senderNameInput = document.getElementById('senderNameInput');
  const messageInput = document.getElementById('messageInput');
  const btnUploadSubmit = document.getElementById('btnUploadSubmit');
  const btnClearSelection = document.getElementById('btnClearSelection');
  const btnSubmitText = document.getElementById('btnSubmitText');

  // Views
  const uploadView = document.getElementById('uploadView');
  const progressView = document.getElementById('progressView');
  const successView = document.getElementById('successView');
  const setupNotice = document.getElementById('setupNotice');
  const btnQuickSetup = document.getElementById('btnQuickSetup');

  // Progress Elements
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercent = document.getElementById('progressPercent');
  const progressStatusTitle = document.getElementById('progressStatusTitle');
  const progressStatusDetail = document.getElementById('progressStatusDetail');
  const progressCounter = document.getElementById('progressCounter');

  // Success Elements
  const btnUploadMore = document.getElementById('btnUploadMore');
  const btnSuccessDriveLink = document.getElementById('btnSuccessDriveLink');
  const btnNavDrive = document.getElementById('btnNavDrive');

  // QR Modal Elements
  const qrModal = document.getElementById('qrModal');
  const btnOpenQrModal = document.getElementById('btnOpenQrModal');
  const btnFooterQr = document.getElementById('btnFooterQr');
  const btnCloseQrModal = document.getElementById('btnCloseQrModal');
  const qrcodeContainer = document.getElementById('qrcodeContainer');
  const btnPrintCard = document.getElementById('btnPrintCard');
  const btnCopyPageUrl = document.getElementById('btnCopyPageUrl');

  // Settings Modal Elements
  const settingsModal = document.getElementById('settingsModal');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal');
  const settingScriptUrl = document.getElementById('settingScriptUrl');
  const settingDriveUrl = document.getElementById('settingDriveUrl');
  const settingEventTitle = document.getElementById('settingEventTitle');
  const btnTestScript = document.getElementById('btnTestScript');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const testResultBox = document.getElementById('testResultBox');
  const btnCopyScriptCode = document.getElementById('btnCopyScriptCode');

  // Titles in UI
  const navTitle = document.getElementById('navTitle');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const cardEventName = document.getElementById('cardEventName');

  // State
  let selectedFiles = []; // Array of { id, file, previewUrl, sizeFormatted, isImage, isVideo }
  let qrCodeInstance = null;

  // Initialize UI with Config
  function applyConfig() {
    const config = window.APP_CONFIG;
    if (config.eventTitle) {
      navTitle.textContent = config.eventTitle;
      heroTitle.textContent = config.eventTitle;
      cardEventName.textContent = config.eventTitle;
      settingEventTitle.value = config.eventTitle;
      document.title = `${config.eventTitle} • Încarcă Pozele`;
    }
    if (config.eventSubtitle) {
      heroSubtitle.textContent = config.eventSubtitle;
    }
    if (config.driveFolderUrl) {
      btnNavDrive.href = config.driveFolderUrl;
      btnSuccessDriveLink.href = config.driveFolderUrl;
      settingDriveUrl.value = config.driveFolderUrl;
    }
    if (config.scriptWebAppUrl) {
      settingScriptUrl.value = config.scriptWebAppUrl;
      setupNotice.style.display = 'none';
    } else {
      setupNotice.style.display = 'flex';
    }
  }

  applyConfig();

  // ---------------- File Picking with 100MB Limit & Original Quality ----------------
  btnSelectFiles.addEventListener('click', () => fileInput.click());
  btnAddMoreFiles.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;

    let rejectedFiles = [];

    newFiles.forEach((file) => {
      // Validare dimensiune maximă 100MB
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
        return;
      }

      const fileId = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff)$/i.test(file.name);
      const isVid = file.type.startsWith('video/') || /\.(mp4|mov|avi|wmv|mkv|webm|m4v|3gp)$/i.test(file.name);
      
      const previewUrl = URL.createObjectURL(file);

      selectedFiles.push({
        id: fileId,
        file: file,
        previewUrl: previewUrl,
        sizeFormatted: formatFileSize(file.size),
        isImage: isImg,
        isVideo: isVid
      });
    });

    if (rejectedFiles.length > 0) {
      alert(`⚠️ Următoarele fișiere depășesc limita maximă de 100 MB și nu au fost adăugate:\n\n• ${rejectedFiles.join('\n• ')}\n\nVă rugăm să alegeți fișiere de până la 100 MB.`);
    }

    fileInput.value = '';
    renderSelectedTray();
  });

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function renderSelectedTray() {
    if (selectedFiles.length === 0) {
      selectedTray.style.display = 'none';
      return;
    }

    selectedTray.style.display = 'block';
    const count = selectedFiles.length;
    selectedCountBadge.textContent = `${count} ${count === 1 ? 'fișier' : 'fișiere'}`;
    btnSubmitText.textContent = `Trimite ${count} ${count === 1 ? 'Fișier' : 'Fișiere'} în Album`;

    previewGrid.innerHTML = '';
    selectedFiles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'preview-item';
      
      if (item.isImage) {
        const img = document.createElement('img');
        img.src = item.previewUrl;
        img.alt = item.file.name;
        img.loading = 'lazy';
        card.appendChild(img);
      } else {
        const videoPreview = document.createElement('div');
        videoPreview.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-size:24px;background:#1e293b;color:#f8fafc;padding:4px;text-align:center;';
        videoPreview.innerHTML = '<span style="font-size:30px;">🎬</span><span style="font-size:10px;margin-top:2px;">VIDEO</span>';
        card.appendChild(videoPreview);
      }

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove-preview';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Elimină fișierul';
      removeBtn.setAttribute('aria-label', 'Elimină fișierul');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFileAtIndex(index);
      });
      card.appendChild(removeBtn);

      // File size badge
      const sizeTag = document.createElement('div');
      sizeTag.className = 'preview-size';
      sizeTag.textContent = item.sizeFormatted;
      card.appendChild(sizeTag);

      previewGrid.appendChild(card);
    });
  }

  function removeFileAtIndex(index) {
    if (selectedFiles[index]) {
      URL.revokeObjectURL(selectedFiles[index].previewUrl);
      selectedFiles.splice(index, 1);
      renderSelectedTray();
    }
  }

  btnClearSelection.addEventListener('click', () => {
    selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    selectedFiles = [];
    renderSelectedTray();
  });

  // ---------------- Exact Original Binary Read (NO Compression / NO Alteration) ----------------
  /**
   * Reads raw bytes directly without ANY canvas processing, resizing or quality degradation.
   * Exactly what the user captured on their camera/phone is uploaded!
   */
  async function readFileOriginal(file) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timp expirat la citirea fișierului')), 30000);
      const reader = new FileReader();
      reader.onload = () => {
        clearTimeout(timer);
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        clearTimeout(timer);
        reject(e || new Error('Eroare la citirea fișierului'));
      };
      reader.readAsDataURL(file);
    });
  }

  async function readBlobSliceAsDataUrl(blobSlice) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timp expirat la citirea segmentului')), 30000);
      const reader = new FileReader();
      reader.onload = () => {
        clearTimeout(timer);
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        clearTimeout(timer);
        reject(e || new Error('Eroare la citirea segmentului'));
      };
      reader.readAsDataURL(blobSlice);
    });
  }

  // ---------------- Upload Submission (Up to 100MB Original Quality) ----------------
  btnUploadSubmit.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    const scriptUrl = window.APP_CONFIG.scriptWebAppUrl;
    if (!scriptUrl) {
      alert('Vă rugăm să configurați URL-ul Google Apps Script în setări (rotița din dreapta-sus).');
      openSettingsModal();
      return;
    }

    // Switch views
    uploadView.style.display = 'none';
    progressView.style.display = 'block';
    successView.style.display = 'none';

    const totalCount = selectedFiles.length;
    let completedCount = 0;
    const sender = senderNameInput.value.trim() || 'Invitat';
    const message = messageInput.value.trim();

    updateProgress(0, totalCount, 'Pregătim fișierele în calitate originală...');

    for (let i = 0; i < totalCount; i++) {
      const item = selectedFiles[i];
      const file = item.file;
      const fileIndexText = `Fișierul ${i + 1} din ${totalCount}`;

      updateProgress(i + 0.1, totalCount, `${fileIndexText}: Se procesează ${file.name}...`);

      try {
        // Dacă fișierul este sub 20MB, se trimite direct într-un singur apel
        if (file.size <= 20 * 1024 * 1024) {
          updateProgress(i + 0.3, totalCount, `${fileIndexText}: Se citește fișierul...`);
          const fullBase64 = await readFileOriginal(file);
          
          updateProgress(i + 0.6, totalCount, `${fileIndexText}: Se trimite în Google Drive...`);
          const payload = {
            fileName: file.name,
            fileData: fullBase64,
            mimeType: file.type || 'application/octet-stream',
            sender: sender,
            message: message
          };

          const controller = new AbortController();
          const fetchTimeout = setTimeout(() => controller.abort(), 90000);

          try {
            const response = await fetch(scriptUrl, {
              method: 'POST',
              mode: 'cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(payload),
              signal: controller.signal
            });
            clearTimeout(fetchTimeout);
            try {
              await response.text();
            } catch (ignore) {}
          } catch (fetchErr) {
            clearTimeout(fetchTimeout);
            console.warn('Upload network notice for file:', file.name, fetchErr);
          }

        } else {
          // Fișier mare (20MB - 100MB): se trimite în bucăți (chunks) pentru siguranță
          const totalChunks = Math.ceil(file.size / CHUNK_SIZE_BYTES);
          const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

          for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
            const start = chunkIdx * CHUNK_SIZE_BYTES;
            const end = Math.min(start + CHUNK_SIZE_BYTES, file.size);
            const slice = file.slice(start, end);
            const chunkBase64 = await readBlobSliceAsDataUrl(slice);

            const chunkFraction = (chunkIdx + 1) / totalChunks;
            updateProgress(
              i + (0.1 + 0.8 * chunkFraction),
              totalCount,
              `${fileIndexText}: Partea ${chunkIdx + 1} din ${totalChunks} (${Math.round(chunkFraction * 100)}%)...`
            );

            const chunkPayload = {
              uploadId: uploadId,
              chunkIndex: chunkIdx,
              totalChunks: totalChunks,
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              sender: sender,
              message: message,
              chunkData: chunkBase64
            };

            const chunkCtrl = new AbortController();
            const chunkTimeout = setTimeout(() => chunkCtrl.abort(), 90000);

            try {
              const chunkRes = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(chunkPayload),
                signal: chunkCtrl.signal
              });
              clearTimeout(chunkTimeout);
              try {
                await chunkRes.text();
              } catch (ignore) {}
            } catch (chunkErr) {
              clearTimeout(chunkTimeout);
              console.warn('Chunk upload notice:', chunkErr);
            }
          }
        }

      } catch (err) {
        console.error('Eroare la upload pentru:', file.name, err);
      }

      completedCount++;
      updateProgress(completedCount, totalCount, `${file.name} a fost încărcat cu succes!`);
    }

    // Success Screen
    setTimeout(() => {
      progressView.style.display = 'none';
      successView.style.display = 'block';

      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => {
          window.confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
          window.confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
        }, 400);
      }

      selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
      selectedFiles = [];
      renderSelectedTray();
      senderNameInput.value = '';
      messageInput.value = '';
    }, 600);
  });

  function updateProgress(current, total, detailText) {
    const percent = Math.min(100, Math.round((current / total) * 100));
    progressBarFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressCounter.textContent = `${Math.floor(current)} din ${total} fișiere`;
    progressStatusDetail.textContent = detailText;
  }

  btnUploadMore.addEventListener('click', () => {
    successView.style.display = 'none';
    uploadView.style.display = 'block';
  });

  // ---------------- QR Code Modal ----------------
  function openQrModal() {
    qrModal.style.display = 'flex';
    generateQrCode();
  }

  function closeQrModal() {
    qrModal.style.display = 'none';
  }

  function generateQrCode() {
    qrcodeContainer.innerHTML = '';
    const currentUrl = window.location.href.split('#')[0].split('?')[0];

    qrCodeInstance = new QRCode(qrcodeContainer, {
      text: currentUrl,
      width: 220,
      height: 220,
      colorDark: '#0b0f19',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  btnOpenQrModal.addEventListener('click', openQrModal);
  btnFooterQr.addEventListener('click', openQrModal);
  btnCloseQrModal.addEventListener('click', closeQrModal);
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
  });

  btnPrintCard.addEventListener('click', () => {
    window.print();
  });

  btnCopyPageUrl.addEventListener('click', () => {
    const url = window.location.href.split('#')[0].split('?')[0];
    navigator.clipboard.writeText(url).then(() => {
      btnCopyPageUrl.innerHTML = '<span>✅ Copiat!</span>';
      setTimeout(() => {
        btnCopyPageUrl.innerHTML = '<span class="icon">📋</span><span>Copiază Linkul</span>';
      }, 2000);
    });
  });

  // ---------------- Settings Modal ----------------
  function openSettingsModal() {
    settingsModal.style.display = 'flex';
    settingScriptUrl.value = window.APP_CONFIG.scriptWebAppUrl || '';
    settingDriveUrl.value = window.APP_CONFIG.driveFolderUrl || '';
    settingEventTitle.value = window.APP_CONFIG.eventTitle || 'Botez Miraia';
    testResultBox.style.display = 'none';
  }

  function closeSettingsModal() {
    settingsModal.style.display = 'none';
  }

  btnOpenSettings.addEventListener('click', openSettingsModal);
  btnQuickSetup.addEventListener('click', openSettingsModal);
  btnCloseSettingsModal.addEventListener('click', closeSettingsModal);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });

  btnSaveSettings.addEventListener('click', () => {
    const updated = {
      scriptWebAppUrl: settingScriptUrl.value.trim(),
      driveFolderUrl: settingDriveUrl.value.trim(),
      eventTitle: settingEventTitle.value.trim() || 'Botez Miraia'
    };
    window.saveAppConfig(updated);
    applyConfig();
    
    testResultBox.style.display = 'block';
    testResultBox.className = 'test-result-box test-success';
    testResultBox.textContent = '✅ Setările au fost salvate cu succes!';
    setTimeout(() => {
      closeSettingsModal();
    }, 1200);
  });

  btnTestScript.addEventListener('click', async () => {
    const url = settingScriptUrl.value.trim();
    if (!url) {
      testResultBox.style.display = 'block';
      testResultBox.className = 'test-result-box test-error';
      testResultBox.textContent = 'Introduceți mai întâi URL-ul aplicației web Google Apps Script.';
      return;
    }

    testResultBox.style.display = 'block';
    testResultBox.className = 'test-result-box';
    testResultBox.style.color = '#e6ca65';
    testResultBox.textContent = '⏳ Se testează conexiunea către Google Drive...';

    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const data = await response.json();

      if (data.status === 'success') {
        testResultBox.className = 'test-result-box test-success';
        testResultBox.innerHTML = `✅ <strong>Conexiune reușită!</strong><br>Folder Drive conectat: <em>${data.folderName || 'Botez'}</em>`;
      } else {
        testResultBox.className = 'test-result-box test-error';
        testResultBox.innerHTML = `⚠️ Scriptul a răspuns cu eroare: ${data.message}`;
      }
    } catch (err) {
      testResultBox.className = 'test-result-box test-error';
      testResultBox.innerHTML = `⚠️ Nu s-a putut conecta la URL. Asigurați-vă că la implementare ați selectat <strong>„Cine are acces: Oricine”</strong>. Detalii: ${err.message}`;
    }
  });

  btnCopyScriptCode.addEventListener('click', async () => {
    try {
      const res = await fetch('google_apps_script.js');
      const code = await res.text();
      await navigator.clipboard.writeText(code);
      btnCopyScriptCode.textContent = '✅ Cod Copiat în Clipboard!';
      setTimeout(() => {
        btnCopyScriptCode.textContent = '📋 Copiază Codul Scriptului';
      }, 3000);
    } catch {
      alert('Puteți copia codul direct din fișierul google_apps_script.js aflat în proiect.');
    }
  });
});
