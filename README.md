# RISALAH KAMI — TETRALOGI FIKRAH AL-IMAM HASAN AL-BANNA
### (رسائلنا — مجموعة رسائل الإمام الشهيد حسن البنا)

Aplikasi Web Progresif (PWA) Rujukan Ilmiah Interaktif yang menggabungkan empat risalah asas paling agung dalam pembinaan fikrah haraki dan manhaj taghyir karya **Al-Imam Asy-Syahid Hasan al-Banna** (*rahimahullah*).

---

## 📚 KANDUNGAN TETRALOGI RISALAH

1. 📗 **Risalah 1: Da‘watunā (دعوتنا)**
   - *Seruan Dakwah Kami:* Asas keikhlasan, 4 tipologi sikap manusia terhadap dakwah, batas kefahaman *Waṭaniyyah* (5 wajah) & *Qawmiyyah*, adab berlapang dada dalam khilaf fekah mazhab, dan diagnosis 6 penyakit kronik ummah.

2. 📘 **Risalah 2: Ilā Ayyi Syai’in Nad‘un-Nās? (إلى أي شيء ندعو الناس؟)**
   - *Kepada Apakah Kita Menyeru Manusia:* Neraca mutlak Kitabullah, hakikat kewalian dan kepimpinan dunia (*ustādhiyyatul-‘ālam*), 4 rukun kekuatan jiwa pejuang, 5 agenda islah negara, dan Sunnah kebangkitan peradaban melalui model Nabi Musa AS.

3. 📙 **Risalah 3: Hal Naḥnu Qawmun ‘Amaliyyūn? (هل نحن قوم عمليون؟)**
   - *Adakah Kita Golongan yang Praktikal:* Menepis skeptisisme retorik, bukti institusi dan projek nyata di lapangan, hakikat pembinaan rijal (*I‘dād ar-Rijāl*), model pengurusan zakat Birinbal al-Qadimah, 7 tingkatan amali jihad, dan mengembalikan 3 hak Al-Quran.

4. 📕 **Risalah 4: Muhimmatunā (مهمتنا)**
   - *Misi dan Tugas Kami:* Pelan tindakan sistemik (*blue-print*) 8 sistem kenegaraan berasaskan Al-Quran (Pemerintahan, Hubungan Antarabangsa, Kehakiman, Pertahanan/Ketenteraan, Ekonomi Mandiri, Pendidikan Rabbani, Rumahtangga Muslim, dan Sahsiah Individu), rantaian 6 peringkat pembinaan ummah, dan kelengkapan senjata rohani Salafussoleh.

---

## ✨ CIRI-CIRI UTAMA PWA

- **100% Sokongan Luar Talian (Offline-First):** Dilengkapi Service Worker (`sw.js`) dan Cache API untuk pembacaan lancar tanpa sambungan internet.
- **Reka Bentuk Responsif & Glassmorphism:** Palet warna Emerald Haraki (`#0F5132`), aksen Emas (`#F59E0B`), dan tipografi dwi-aksara (Arab *Amiri* & Rumi *Plus Jakarta Sans* / *Merriweather*).
- **Tiga Mod Pembacaan:**
  - 📖 **Teks Penuh Ilmiah:** 74 fasal lengkap dengan kotak nas Al-Quran, hadis Nabawi berbingkai, dan navigasi bab.
  - 🌟 **Ringkasan Eksekutif:** Kad ringkasan fasal pantas 3-5 minit mesra generasi muda.
  - 💎 **Mutiara Hikmah:** Kad mutiara kata emas yang boleh disalin (*copy quote*) atau dikongsi (*Web Share API*).
- **Carian Universal Pantas:** Carian kata kunci masa nyata merentas kesemua 74 seksyen daripada 4 risalah serentak.
- **Penyelarasan Saiz Fon & Mod Tema:** Pilihan mod gelap (*dark mode*) dan mod terang (*light mode*) serta pelaras saiz teks (A+ / A-).
- **Muat Turun Dokumen Asal:** Pautan pantas memuat turun dokumen Microsoft Word (.docx) dan Markdown (.md) bagi setiap risalah.

---

## 🛠️ STRUKTUR DIREKTORI

```
Risalah-Kami/
├── index.html              # Antara muka utama (Single Page Application)
├── manifest.json           # Konfigurasi PWA (Web App Manifest)
├── sw.js                   # Service Worker Offline Cache
├── README.md               # Dokumentasi projek
├── css/
│   └── style.css           # Penggayaan visual & tema
├── js/
│   └── app.js              # Logik interaktif aplikasi
├── data/
│   ├── risalah_data.js     # Data berstruktur teks 4 risalah (JS format)
│   └── risalah_data.json   # Data berstruktur teks 4 risalah (JSON format)
├── icons/
│   ├── favicon.png
│   ├── icon-192.png
│   └── icon-512.png
└── docs/                   # Salinan fail .docx dan .md boleh dimuat turun
    ├── 01_Risalah_Dawatuna.docx
    ├── 01_Risalah_Dawatuna.md
    ├── 02_Risalah_Ila_Ayyi_Syai_Nadun_Nas.docx
    ├── 02_Risalah_Ila_Ayyi_Syai_Nadun_Nas.md
    ├── 03_Risalah_Hal_Nahnu_Qaumun_Amaliyyun.docx
    ├── 03_Risalah_Hal_Nahnu_Qaumun_Amaliyyun.md
    ├── 04_Risalah_Muhimmatuna.docx
    └── 04_Risalah_Muhimmatuna.md
```

---

*Semoga usaha pendokumentasian dan aplikasi PWA ini menjadi amal jariah yang berpanjangan dalam menyebarkan fikrah dakwah Islamiah yang jernih dan berwibawa.*
