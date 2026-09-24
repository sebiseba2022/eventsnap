/**
 * EventSnap Botez - Application Logic
 * Mobile-first photo upload & QR card generator
 */

document.addEventListener('DOMContentLoaded', () => {
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
  let selectedFiles = []; // Array of { id, file, previewUrl, sizeFormatted }
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

  // ---------------- File Picking ----------------
  btnSelectFiles.addEventListener('click', () => fileInput.click());
  btnAddMoreFiles.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;

    newFiles.forEach((file) => {
      const fileId = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      selectedFiles.push({
        id: fileId,
        file: file,
        previewUrl: previewUrl,
        sizeFormatted: formatFileSize(file.size),
        isImage: file.type.startsWith('image/'),
        isVideo: file.type.startsWith('video/')
      });
    });

    // Reset input value so same files can be re-selected if removed
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
    selectedCountBadge.textContent = `${selectedFiles.length} ${selectedFiles.length === 1 ? 'poză' : 'poze'}`;
    btnSubmitText.textContent = `Trimite ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Poză' : 'Poze'} în Album`;

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
        const videoIcon = document.createElement('div');
        videoIcon.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;font-size:28px;background:#1e293b;';
        videoIcon.textContent = '🎥';
        card.appendChild(videoIcon);
      }

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove-preview';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Elimină poza';
      removeBtn.setAttribute('aria-label', 'Elimină poza');
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

  // ---------------- Image Optimization & Compression ----------------
  /**
   * Resizes large smartphone camera photos to max 2048px and compresses as JPEG.
   * This reduces 15MB-30MB files down to ~800KB-1.2MB with near-zero visible loss,
   * guaranteeing instantaneous uploads even on mobile 4G at wedding/event venues.
   */
  async function optimizeFileForUpload(file) {
    if (!file.type.startsWith('image/')) {
      // For video or other files, read directly
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          base64: reader.result,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = window.APP_CONFIG.maxImageDimension || 2048;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const quality = window.APP_CONFIG.imageQuality || 0.84;
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Change extension to .jpg if needed
          let cleanName = file.name;
          if (!cleanName.toLowerCase().endsWith('.jpg') && !cleanName.toLowerCase().endsWith('.jpeg')) {
            cleanName = cleanName.replace(/\.[^/.]+$/, '') + '.jpg';
          }

          resolve({
            base64: compressedDataUrl,
            mimeType: 'image/jpeg',
            fileName: cleanName
          });
        };
        img.onerror = () => {
          // Fallback to raw base64 if canvas decode fails
          resolve({
            base64: e.target.result,
            mimeType: file.type,
            fileName: file.name
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------------- Upload Submission ----------------
  btnUploadSubmit.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    const scriptUrl = window.APP_CONFIG.scriptWebAppUrl;
    if (!scriptUrl) {
      alert('Vă rugăm să configurați URL-ul Google Apps Script în setări (rotița din dreapta-sus) pentru a trimite pozele direct în Google Drive.\n\nÎntre timp, puteți folosi link-ul Google Drive pentru upload manual.');
      openSettingsModal();
      return;
    }

    // Switch views to progress
    uploadView.style.display = 'none';
    progressView.style.display = 'block';
    successView.style.display = 'none';

    const totalCount = selectedFiles.length;
    let completedCount = 0;
    const sender = senderNameInput.value.trim() || 'Invitat';
    const message = messageInput.value.trim();

    updateProgress(0, totalCount, 'Se pregătesc fișierele...');

    for (let i = 0; i < totalCount; i++) {
      const current = selectedFiles[i];
      updateProgress(i, totalCount, `Se optimizează poza ${i + 1} din ${totalCount}...`);

      try {
        const optimized = await optimizeFileForUpload(current.file);
        updateProgress(i + 0.5, totalCount, `Se trimite în Google Drive (${i + 1}/${totalCount})...`);

        // Send payload to Google Apps Script Web App
        const payload = {
          fileName: optimized.fileName,
          fileData: optimized.base64,
          mimeType: optimized.mimeType,
          sender: sender,
          message: message
        };

        const response = await fetch(scriptUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8' // avoids preflight CORS restrictions on GAS
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status !== 'success') {
          console.warn('Upload warning for file:', current.file.name, result);
        }

      } catch (err) {
        console.error('Eroare la uploadul fișierului:', current.file.name, err);
        // Continue with the remaining files even if one encounters a hiccup
      }

      completedCount++;
      updateProgress(completedCount, totalCount, `Poza ${completedCount} din ${totalCount} a fost încărcată!`);
    }

    // Finished!
    setTimeout(() => {
      progressView.style.display = 'none';
      successView.style.display = 'block';

      // Confetti burst!
      if (window.confetti) {
        window.confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          window.confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          window.confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 400);
      }

      // Cleanup
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
    progressCounter.textContent = `${Math.floor(current)} din ${total} poze`;
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
    settingEventTitle.value = window.APP_CONFIG.eventTitle || 'Botezul Nostru';
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
      eventTitle: settingEventTitle.value.trim() || 'Botezul Nostru'
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
      testResultBox.innerHTML = `⚠️ Nu s-a putut conecta la URL. Asigurați-vă că la implementare ați selectat <strong>„Cine are acces: Oricine”</strong> (Who has access: Anyone). Detalii: ${err.message}`;
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
