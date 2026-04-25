"use client";

import React from "react";
import { ShieldCheck, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="neo-btn neo-btn-white p-3">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-black uppercase italic tracking-tight">Syarat & Ketentuan (Wakalah bil Istithmar)</h2>
      </div>

      <div className="neo-card p-8 bg-white space-y-6">
        <section className="space-y-3">
          <h3 className="text-lg font-black uppercase flex items-center gap-2 text-[#10b981]">
            <ShieldCheck size={20} /> 1. Dasar Akad
          </h3>
          <p className="text-sm font-bold leading-relaxed text-black/70">
            Layanan Staking ini menggunakan akad **Wakalah bil Istithmar** (Delegasi Investasi). 
            Pengguna (Muwakkil) memberikan kuasa kepada Protokol (Wakil) untuk mengelola aset ETH 
            ke dalam jaringan validator Ethereum sesuai dengan prinsip Syariah.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black uppercase flex items-center gap-2 text-[#10b981]">
            <FileText size={20} /> 2. Hak dan Kewajiban Muwakkil (Pengguna)
          </h3>
          <ul className="list-disc pl-5 text-sm font-bold space-y-2 text-black/70">
            <li>Muwakkil berhak menerima imbal hasil (rewards) dari hasil staking setelah dikurangi biaya operasional.</li>
            <li>Muwakkil memahami bahwa imbal hasil bersifat variabel dan bergantung pada performa jaringan Ethereum.</li>
            <li>Muwakkil menjamin bahwa sumber dana yang digunakan adalah halal dan tidak melanggar hukum.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black uppercase flex items-center gap-2 text-[#10b981]">
            <FileText size={20} /> 3. Hak dan Kewajiban Wakil (Protokol)
          </h3>
          <ul className="list-disc pl-5 text-sm font-bold space-y-2 text-black/70">
            <li>Wakil wajib mengelola infrastruktur validator dengan prinsip kehati-hatian (*Hifzul Mal*).</li>
            <li>Wakil berhak menerima biaya jasa (Ujrah) sebesar 5% dari total imbal hasil yang diperoleh.</li>
            <li>Wakil wajib memberikan transparansi mengenai risiko operasional dan status validator.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black uppercase flex items-center gap-2 text-[#EF4444]">
            <FileText size={20} /> 4. Risiko dan Mitigasi
          </h3>
          <p className="text-sm font-bold leading-relaxed text-black/70">
            Staking melibatkan risiko teknis seperti *Slashing* atau *Uptime penalty*. Protokol melakukan 
            mitigasi melalui sistem pemantauan risiko MSIM untuk meminimalkan potensi kerugian dana Muwakkil.
          </p>
        </section>

        <div className="pt-6 border-t-2 border-black border-dashed">
          <p className="text-[10px] font-black uppercase text-center text-black/40">
            Dokumen ini dihasilkan secara otomatis untuk keperluan Skripsi Staking Syariah v2.4
          </p>
        </div>
      </div>
    </div>
  );
}
