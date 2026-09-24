/**
 * Google Apps Script - EventSnap Botez Direct Uploader
 * 
 * ID-ul Folderului Google Drive: 1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR
 * 
 * INSTRUCȚIUNI DE INSTALARE (Durează 1 minut):
 * 1. Accesați: https://script.google.com/home/start (asigurați-vă că sunteți logat cu contul Google care deține folderul).
 * 2. Apăsați butonul "Proiect nou" (New Project).
 * 3. Ștergeți tot codul existent și lipiți (Paste) întregul conținut al acestui fișier.
 * 4. Apăsați pe butonul "Implementare" (Deploy) din colțul din dreapta-sus -> "Implementare nouă" (New deployment).
 * 5. La "Selectați tipul" (rotiță), alegeți "Aplicație web" (Web app).
 * 6. Configurați:
 *    - Descriere: "EventSnap Botez Uploader"
 *    - Se execută ca (Execute as): "Eu" (Me - contul dvs.)
 *    - Cine are acces (Who has access): "Oricine" (Anyone) -> FOARTE IMPORTANT: Alegeți "Oricine", altfel invitații vor primi eroare de acces.
 * 7. Apăsați "Implementare" (Deploy), acordați permisiunile cerute de Google (Avanzat -> Accesați proiectul -> Permiteți).
 * 8. Copiați "Adresa URL a aplicației web" (Web App URL - se termină în /exec).
 * 9. Introduceți acel URL în aplicația EventSnap (la setări sau în fișierul config.js).
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

    // Numele fișierului
    const sender = data.sender ? cleanString(data.sender) : "Invitat";
    const originalName = data.fileName || "poza_botez.jpg";
    const timestamp = Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyyMMdd_HHmmss");
    const finalFileName = `${timestamp}_${sender}_${originalName}`;

    // Decodificare base64
    const base64Data = data.fileData.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
    const decodedBytes = Utilities.base64Decode(base64Data);
    const mimeType = data.mimeType || "image/jpeg";
    const blob = Utilities.newBlob(decodedBytes, mimeType, finalFileName);

    // Creare fișier în Google Drive
    const file = folder.createFile(blob);
    
    // Adăugare descriere cu detalii dacă există
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

function cleanString(str) {
  return str.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 30).replace(/\s+/g, '_');
}
