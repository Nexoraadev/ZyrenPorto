# Dokumentasi Integrasi AI & Komunikasi Otomatis

Website portfolio ini bukan hanya *frontend* biasa, melainkan dilengkapi *tools* AI dan sistem notifikasi otomatis berbasis API yang kompleks, dikendalikan dari dalam `/api`.

## 1. Integrasi AI Chatbot (n8n & OpenAI)

Asisten Virtual interaktif ditangani oleh API Route Next.js yang meneruskan permintaan ke Webhook n8n.
- **Data Source (`zhiyy-knowledge.txt`)**: Memuat identitas (Reva/Lia), background RPL dari SMKN 12 Malang, layanan, dan FAQ harga. AI wajib patuh pada dokumen ini dan tidak boleh mengarang data.
- **Alur Data**:
  1. User mengetik pesan.
  2. UI memanggil `/api/chat`.
  3. API memanggil webhook n8n dengan payload pesan.
  4. n8n menyuntikkan *System Prompt* dan isi dari `zhiyy-knowledge.txt` lalu memanggil OpenAI.
  5. Hasil dikembalikan ke UI.

## 2. API Menghapus Background (AI Media)

Terdapat fitur `/api/remove-bg` di dalam sistem.
- Digunakan (mungkin oleh admin di `/zhaorukou`) untuk menghapus latar belakang gambar secara otomatis sebelum di-upload ke *Storage*.
- Sangat berguna saat mempersiapkan gambar thumbnail (*hero image* atau aset proyek).

## 3. Integrasi WhatsApp (Fonnte)

Sistem ini memiliki CRM (*Customer Relationship Management*) internal untuk WhatsApp.
- **Webhook Masuk (`/api/wa-webhook`)**: Fonnte melempar *request* setiap kali ada pesan WA masuk ke nomor sistem. Data akan masuk secara otomatis ke tabel `messages_wa`.
- **API Balas (`/api/wa-reply`)**: Admin dapat membuka dashboard `/zhaorukou`, membaca pesan WA dari tabel `messages_wa`, lalu mengetik balasan. Sistem akan memanggil Fonnte API untuk mengirimkan WA balasan ke klien secara *real-time*.

## 4. Integrasi Email Responder (Resend)

Demikian pula untuk email konvensional dari *Contact Form*:
- **API Balas Email (`/api/email-reply`)**: Memanfaatkan pustaka dan layanan **Resend**. Admin tak perlu membuka Gmail; balasan diketik di dashboard dan dikirim melalui infrastruktur Resend secara profesional.

> [!CAUTION]
> Ketiga integrasi ini (n8n, Fonnte, dan Resend) sangat bergantung pada kunci rahasia (API Keys) dan URL Webhook.
> Selalu pastikan variabel `.env.local` dan *environment variables* di Vercel diperbarui jika terdapat regenerasi kunci dari layanan terkait.
