# QuQuiz Notification

## About
Ini adalah notification service untuk QuQuiz. Di sini service akan berperan sebagai consumer RabbitMQ. Ada dua queue yang dikonsum:
1. Queue yang menyimpan message upcoming quiz
2. Queue yang menyimpan message quiz result 

## Tentang Publishers
Publisher pada folder `publishers` ini untuk testing only.<br>
Sebelum menjalankan publisher, run dahulu `main.js` untuk menyalakan consumer-nya.

Jalankan publisher dengan perintah:
```
  node publishers/<namaPublisher>.js
```