# Heartmate AI — Virtual Girlfriend Chatbot

Aplikasi web chatbot pasangan virtual dengan karakter perempuan dewasa yang bisa dipersonalisasi. Dirancang untuk percakapan yang lebih natural, santai, hangat, dan konsisten.

## Fitur
- Nama dan karakter pasangan virtual bisa diatur.
- Nama panggilan pengguna, gaya bahasa, kepribadian, dan status hubungan virtual.
- Konteks percakapan dikirim sebagai riwayat agar balasan tetap nyambung.
- Streaming jawaban.
- Riwayat tersimpan di browser lokal.
- Responsive untuk desktop dan HP.
- API key hanya disimpan di backend, bukan di browser.

## Prasyarat
- Python 3.10 atau lebih baru.
- OpenAI API key dengan akses API dan billing/credits aktif.

## Instalasi Windows
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```
Edit `.env`, isi `OPENAI_API_KEY`, lalu jalankan:
```powershell
uvicorn app.main:app --reload
```
Buka `http://127.0.0.1:8000`.

## Instalasi macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `.env`, isi API key, lalu:
```bash
uvicorn app.main:app --reload
```
Buka `http://127.0.0.1:8000`.

## Konfigurasi
- `OPENAI_API_KEY`: API key akun OpenAI API.
- `OPENAI_MODEL`: model API yang tersedia di project API Anda. Default `gpt-5.5`; ubah jika model tersebut tidak tersedia pada akun Anda.
- `MAX_HISTORY_MESSAGES`: jumlah maksimum pesan riwayat yang dikirim ke model.

## Catatan privasi dan batasan versi
Riwayat dan preferensi disimpan di localStorage browser pada perangkat yang digunakan. Server tidak menyimpan database chat. Isi pesan dikirim ke penyedia AI untuk menghasilkan balasan. Jangan masukkan password, data keuangan, atau informasi sangat sensitif. Karakter ini adalah AI virtual, bukan manusia sungguhan. Versi ini belum memiliki login, sinkronisasi antarperangkat, voice call, atau notifikasi proaktif.
