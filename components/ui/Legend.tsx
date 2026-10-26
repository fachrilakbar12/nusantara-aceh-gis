'use client';

import React from 'react';
import { audioEngine } from '@/lib/audio';
import { THEME_COLORS } from '@/lib/colors';
import { getRegionCentroid } from '@/lib/geo';
import { REGION_BY_ID, REGIONS_ACEH, TRADISI_LINTAS_ACEH } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

export default function Legend() {
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const isCreditsOpen = useAcehStore((s) => s.isCreditsOpen);
  const setCreditsOpen = useAcehStore((s) => s.setCreditsOpen);
  const selectRegion = useAcehStore((s) => s.selectRegion);
  const triggerRipple = useAcehStore((s) => s.triggerRipple);

  const activeRegion = activeRegionId ? REGION_BY_ID[activeRegionId] : null;
  const accentColor = activeRegion ? activeRegion.warna : THEME_COLORS.defaultAccent;

  const handleQuickSelect = (id: string, warna: string) => {
    selectRegion(id);
    const centroid = getRegionCentroid(id);
    if (centroid) {
      triggerRipple(centroid[0], centroid[1], warna);
    }
    audioEngine.playRegionClick(id);
  };

  return (
    <>
      {/* Modal Sumber & Kredit + Tradisi Lintas Aceh */}
      {isCreditsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="credits-modal-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b1220]/85 p-4"
        >
          <div
            className="max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 bg-[#121a2b] p-6"
            style={{ borderColor: accentColor }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="credits-modal-title"
                className="font-display text-xl font-bold text-[#f3efe6]"
              >
                Tradisi Lintas Aceh &amp; Sumber Data
              </h2>
              <button
                type="button"
                onClick={() => setCreditsOpen(false)}
                aria-label="Tutup jendela sumber dan kredit"
                className="rounded-lg border border-[#25324d] bg-[#0b1220] px-2.5 py-1 text-xs text-[#93a0ba] hover:text-[#f3efe6]"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#93a0ba]">
              Selain kekhasan tiap kabupaten/kota, masyarakat di seluruh Aceh berbagi tiga
              tradisi utama yang mengikat kebersamaan lintas wilayah:
            </p>

            <div className="mt-3 space-y-2.5">
              {TRADISI_LINTAS_ACEH.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#25324d] bg-[#0b1220] p-3"
                >
                  <h3
                    className="font-display text-sm font-semibold"
                    style={{ color: accentColor }}
                  >
                    {item.judul}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#93a0ba]">
                    {item.isi}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#25324d] bg-[#0b1220] p-3.5 text-xs text-[#93a0ba]">
              <h3 className="font-display text-xs font-semibold text-[#f3efe6]">
                Sumber &amp; Kredit
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                <li>
                  Peta batas administrasi 23 Kabupaten/Kota Provinsi Aceh (level ADM2: 18
                  kabupaten &amp; 5 kota termasuk Simeulue dan Sabang/Pulau Weh).
                </li>
                <li>
                  Pencatatan Warisan Budaya Takbenda Indonesia (Kemendikbudristek) &amp;
                  dokumentasi Balai Pelestarian Kebudayaan Wilayah I Aceh.
                </li>
                <li>
                  Sintesis instrumen daerah menggunakan Web Audio API murni (Rapa’i, Bambu
                  Gayo, Gong Alas, Petik Pesisir Barat, dan Rebana Tamiang).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer bawah: Mini-legend 23 warna wilayah + Catatan Verifikasi */}
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-20 hidden items-center justify-between gap-4 border-t border-[#25324d] bg-[#121a2b] px-5 py-2 md:flex">
        {/* Mini-legend warna 23 wilayah */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="mr-1 text-[11px] font-medium text-[#93a0ba]">
            Wilayah:
          </span>
          {REGIONS_ACEH.map((r) => {
            const isActive = r.id === activeRegionId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleQuickSelect(r.id, r.warna)}
                title={`${r.nama} (${r.jenis})`}
                aria-label={`Pilih ${r.nama}`}
                className="h-3.5 w-3.5 shrink-0 rounded-sm transition-transform duration-150 hover:scale-125"
                style={{
                  backgroundColor: r.warna,
                  outline: isActive ? '2px solid #f3efe6' : 'none',
                  outlineOffset: '1px'
                }}
              />
            );
          })}
        </div>

        {/* Catatan verifikasi wajib & pintasan keyboard */}
        <div className="pointer-events-auto flex items-center gap-3 text-[11px] text-[#93a0ba]">
          <span>
            Sebagian data perlu diverifikasi dengan Balai Pelestarian Kebudayaan Aceh dan
            data Warisan Budaya Takbenda Kemendikbudristek.
          </span>
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="shrink-0 underline hover:text-[#f3efe6]"
          >
            Sumber &amp; Kredit
          </button>
        </div>
      </footer>
    </>
  );
}

