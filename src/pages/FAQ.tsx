import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqItems: FAQItem[] = [
    {
      question: "Bagaimana cara menambahkan kode anggaran baru?",
      answer: "Untuk menambahkan kode anggaran baru, klik menu 'Program' di sidebar, lalu klik tombol 'Tambah Program' di pojok kanan atas. Isi formulir dengan informasi yang diperlukan seperti kode RO, judul RO, kode komponen, dan judul komponen."
    },
    {
      question: "Bagaimana cara menambahkan kegiatan pada kode anggaran?",
      answer: "Untuk menambahkan kegiatan, pertama buka menu 'Kode Anggaran', lalu klik ikon dokumen pada kode anggaran yang ingin ditambahkan kegiatannya. Kemudian klik tombol 'Tambah Kegiatan' dan isi detail kegiatan seperti kode kegiatan, volume, dan nilai anggaran."
    },
    {
      question: "Mengapa total nilai kegiatan berbeda dengan yang saya input?",
      answer: "Sistem secara otomatis melakukan pembulatan pada 3 angka terakhir dari hasil perkalian volume dan nilai. Jika hasil perkalian memiliki 3 angka terakhir ≥ 500, maka dibulatkan ke atas. Jika < 500, maka dibulatkan ke bawah."
    },
    {
      question: "Bagaimana cara mengatur rencana penarikan dana per triwulan?",
      answer: "Di menu 'Kode Anggaran', Anda akan melihat kolom 'Rencana Penarikan'. Klik tombol 'Edit Penarikan' dan masukkan nilai untuk setiap triwulan. Total penarikan harus sama dengan total anggaran setelah revisi."
    },
    {
      question: "Apakah saya bisa menyalin kegiatan yang sudah ada?",
      answer: "Ya, Anda bisa menyalin kegiatan dengan mengklik ikon 'Salin' (Copy) pada kegiatan yang ingin disalin. Kemudian klik tombol 'Tempel Kegiatan' untuk menambahkan salinan kegiatan tersebut."
    },
    {
      question: "Bagaimana cara melihat riwayat perubahan?",
      answer: "Semua perubahan (penambahan, perubahan, dan penghapusan) tercatat dalam sistem dan dapat dilihat melalui notifikasi di pojok kanan atas (ikon lonceng)."
    },
    {
      question: "Mengapa saya tidak bisa menghapus kode anggaran tertentu?",
      answer: "Anda hanya dapat menghapus kode anggaran yang Anda buat sendiri. Jika Anda tidak memiliki akses untuk menghapus, hubungi administrator (PPK)."
    },
    {
      question: "Bagaimana cara memfilter data kode anggaran?",
      answer: "Di menu 'Kode Anggaran', Anda dapat menggunakan filter yang tersedia seperti pencarian, filter program (Dukman/PPIS), filter seksi, dan filter kode RO untuk menemukan data yang Anda cari."
    },
    {
      question: "Apa yang harus dilakukan jika lupa password?",
      answer: "Jika Anda lupa password, silakan hubungi administrator sistem (PPK) untuk melakukan reset password akun Anda."
    },
    {
      question: "Berapa lama sesi login akan bertahan?",
      answer: "Sesi login akan berakhir secara otomatis setelah 5 menit tidak ada aktivitas. Pastikan untuk selalu menyimpan perubahan yang Anda buat."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions (FAQ)</h1>
      
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div 
            key={index}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
              onClick={() => toggleItem(index)}
            >
              <span className="text-lg font-medium text-gray-900">{item.question}</span>
              {openItems.includes(index) ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {openItems.includes(index) && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;