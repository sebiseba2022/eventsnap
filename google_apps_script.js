/**
 * Google Apps Script - EventSnap Botez Direct Uploader
 * 
 * ID-ul Folderului Google Drive: 1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR
 * Suportă încărcare fișiere FĂRĂ modificări de calitate (poze și videoclipuri până la 100MB).
 */

const FOLDER_ID = "1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR";

function doGet(e) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Serverul de încărcare funcționează corect!",
      folderName: folder.getName(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Nu s-au primit date în cerere.");
    }

    const data = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(FOLDER_ID);

    // Suport pentru fișiere mari transmise în bucăți (chunked)
    if (data.totalChunks && data.totalChunks > 1) {
      return handleChunkedUpload(data, folder);
    }

    // Încărcare directă (calitate 100% originală - poza/video este salvat exact cum a fost trimis)
    const sender = data.sender ? cleanString(data.sender) : "Invitat";
    const originalName = data.fileName || "amintire_botez";
    const timestamp = Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyyMMdd_HHmmss");
    const finalFileName = `${timestamp}_${sender}_${originalName}`;

    // Decodificare base64 exactă, fără re-compresie
    const base64Data = data.fileData.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
    const decodedBytes = Utilities.base64Decode(base64Data);
    const mimeType = data.mimeType || "application/octet-stream";
    const blob = Utilities.newBlob(decodedBytes, mimeType, finalFileName);

    // Salvare în Google Drive
    const file = folder.createFile(blob);
    
    // Adăugare detalii
    if (data.sender || data.message) {
      file.setDescription(`Trimis de: ${data.sender || 'Anonim'}\nMesaj: ${data.message || 'Fără mesaj'}\nData: ${new Date().toLocaleString('ro-RO')}`);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: file.getId(),
      fileName: finalFileName,
      viewUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleChunkedUpload(data, folder) {
  const uploadId = cleanString(data.uploadId || "upload_" + Date.now());
  const tempFolderName = `_temp_${uploadId}`;
  
  let tempFolder;
  const folders = folder.getFoldersByName(tempFolderName);
  if (folders.hasNext()) {
    tempFolder = folders.next();
  } else {
    tempFolder = folder.createFolder(tempFolderName);
  }

  // Salvare bucată
  const base64Data = data.chunkData.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
  const decodedBytes = Utilities.base64Decode(base64Data);
  const chunkFileName = `part_${String(data.chunkIndex).padStart(4, '0')}`;
  tempFolder.createFile(chunkFileName, decodedBytes);

  // Când a sosit ultima bucată, asamblăm fișierul
  if (data.chunkIndex === data.totalChunks - 1) {
    const sender = data.sender ? cleanString(data.sender) : "Invitat";
    const originalName = data.fileName || "video_botez";
    const timestamp = Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyyMMdd_HHmmss");
    const finalFileName = `${timestamp}_${sender}_${originalName}`;

    let allBytes = [];
    for (let i = 0; i < data.totalChunks; i++) {
      const partName = `part_${String(i).padStart(4, '0')}`;
      const partFiles = tempFolder.getFilesByName(partName);
      if (partFiles.hasNext()) {
        const partFile = partFiles.next();
        const partBlob = partFile.getBlob();
        allBytes = allBytes.concat(partBlob.getBytes());
      }
    }

    const finalBlob = Utilities.newBlob(allBytes, data.mimeType || "application/octet-stream", finalFileName);
    const finalFile = folder.createFile(finalBlob);

    if (data.sender || data.message) {
      finalFile.setDescription(`Trimis de: ${data.sender || 'Anonim'}\nMesaj: ${data.message || 'Fără mesaj'}\nData: ${new Date().toLocaleString('ro-RO')}`);
    }

    // Ștergem fișierele temporare
    tempFolder.setTrashed(true);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: finalFile.getId(),
      fileName: finalFileName,
      viewUrl: finalFile.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "chunk_saved",
    chunkIndex: data.chunkIndex,
    totalChunks: data.totalChunks
  })).setMimeType(ContentService.MimeType.JSON);
}

function cleanString(str) {
  return str.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 30).replace(/\s+/g, '_');
}
