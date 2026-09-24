# 👶 EventSnap - Amintiri de la Botez

Aplicație web modernă, elegantă și extrem de simplu de folosit, creată special pentru evenimente de botez. Invitații (inclusiv persoane de peste 40 de ani) pot scana un **Cod QR** de pe masă și pot încărca fotografii și videoclipuri direct în folderul comun **Google Drive**, fără să aibă nevoie de cont, autentificare sau instalare de aplicații!

---

## 🌟 Caracteristici Principale

1. **Design prietenos pentru orice vârstă (40+ ani)**:
   - Buton uriaș și evident: *„📸 Alege Poze din Telefon”* cu deschidere automată a camerei sau galeriei.
   - Text mare, fonturi cursive elegante și contrast ridicat.
   - Instrucțiuni clare în 3 pași pe pagina principală.
2. **Optimizare automată a fotografiilor pe telefon**:
   - Telefoanele moderne fac poze de 15MB - 30MB. Aplicația le redimensionează instant în browser la calitate Full HD (2048px), reducând dimensiunea la ~1MB.
   - Încărcarea se face în doar 1-2 secunde chiar și pe date mobile 4G în sala de restaurant.
3. **Cartonașe QR pentru Mese gata de printat**:
   - Buton dedicat *„Cod QR Mese”* care generează codul QR cu link-ul direct către site.
   - Funcție de printare directă (`Ctrl+P` / buton „Printează”) cu format special pentru cartonașe de masă (tent cards).
4. **Încărcare directă în Google Drive prin Google Apps Script**:
   - Folder țintă: [Google Drive Botez](https://drive.google.com/drive/folders/1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR?usp=drive_link)
   - Zero costuri de găzduire backend (100% serverless Google Cloud).
5. **Găzduire Gratuită & Automată pe GitHub Pages**:
   - Workflow inclus în `.github/workflows/deploy.yml` pentru publicare automată la fiecare push.

---

## 🚀 Cum activezi încărcarea în Google Drive (Durează 1 minut)

Pentru ca invitații să poată încărca fișiere în Google Drive fără să se autentifice, se folosește un script Google gratuit:

1. Deschideți în browser: **[Google Apps Script](https://script.google.com/home/start)** (asigurați-vă că sunteți conectat cu contul Google care deține folderul).
2. Apăsați pe butonul **„Proiect nou”** (*New project*).
3. Ștergeți codul afișat și copiați conținutul din fișierul `google_apps_script.js` din acest repository.
4. Apăsați în dreapta-sus pe butonul albastru **„Implementare” (Deploy)** &rarr; **„Implementare nouă” (New deployment)**.
5. La rotița de setări din stânga (*Select type*), alegeți **„Aplicație web” (Web app)**.
6. Completați:
   - **Descriere**: *EventSnap Uploader*
   - **Se execută ca (Execute as)**: *Eu (Me)*
   - **Cine are acces (Who has access)**: **„Oricine” (Anyone)** &larr; *esențial pentru a permite invitaților să încarce fără cont!*
7. Apăsați **„Implementare” (Deploy)** &rarr; Acordați permisiunile cerute de Google (*Avanzat &rarr; Accesați proiectul &rarr; Permiteți*).
8. Copiați **Adresa URL a aplicației web** (*se termină în `/exec`*).
9. Deschideți site-ul EventSnap, apăsați pe rotița de setări (⚙️) din dreapta-sus, lipiți URL-ul și apăsați **„Salvează Setările”**.

---

## 📦 Publicare pe GitHub Pages (Fără host / Fără server)

Aplicația este pregătită pentru publicare automată:

### Pasul 1: Crearea repository-ului pe GitHub
Rulați în terminal comenzile:
```powershell
git add .
git commit -m "Initial commit: EventSnap Botez application"
```

Dacă aveți GitHub CLI instalat:
```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login
& "C:\Program Files\GitHub CLI\gh.exe" repo create eventsnap --public --source=. --remote=origin --push
```
*Sau creați manual un repo gol numit `eventsnap` pe https://github.com/new și rulați:*
```powershell
git remote add origin https://github.com/sebiseba2022/eventsnap.git
git push -u origin main
```

### Pasul 2: Activare GitHub Pages
1. Pe GitHub, mergeți la **Settings** &rarr; **Pages**.
2. La **Build and deployment** / **Source**, selectați **GitHub Actions** (sau ramura `main` / root).
3. Site-ul va fi live imediat la adresa:  
   `https://sebiseba2022.github.io/eventsnap/`

---

## 🖨️ Cum printezi Codul QR pentru mese

1. Deschideți site-ul live în browser.
2. Apăsați pe butonul **„📱 Cod QR Mese”** din bara de sus.
3. Se va deschide cartonașul elegant cu mesajul de bun venit și codul QR generat automat pentru linkul paginii.
4. Apăsați pe **„🖨️ Printează Cartonașul de Masă”** și alegeți numărul de copii dorit pentru mesele din restaurant!
