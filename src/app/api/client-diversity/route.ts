import { NextResponse } from "next/server";

// Endpoint: GET /api/client-diversity
// Mengambil data consensus client diversity dari Blockprint API (Sigma Prime)
export async function GET() {
  try {
    // Coba ambil data dari epoch terbaru yang tersedia
    // Strategi: Coba beberapa range, mulai dari yang terbaru
    const genesisTime = 1606824023;
    const nowEpoch = Math.floor((Date.now() / 1000 - genesisTime) / 384);
    
    // Coba beberapa range epoch, dari terbaru ke lama
    const ranges = [
      { start: nowEpoch - 225, end: nowEpoch },     // Hari ini
      { start: nowEpoch - 450, end: nowEpoch - 225 }, // Kemarin
      { start: 340000, end: 340225 },                 // Fallback ke epoch yang diketahui memiliki data
    ];

    let responseData: Record<string, number> | null = null;
    let usedRange = ranges[0];

    for (const range of ranges) {
      try {
        const res = await fetch(
          `https://api.blockprint.sigp.io/blocks_per_client/${range.start}/${range.end}`,
          { next: { revalidate: 3600 } }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const totalBlocks = Object.values(data as Record<string, number>).reduce(
          (sum: number, count) => sum + (count as number),
          0
        );

        // Jika ada data blok, gunakan range ini
        if (totalBlocks > 0) {
          responseData = data;
          usedRange = range;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!responseData) {
      throw new Error("No data available from any epoch range");
    }

    // Hitung total blok
    const totalBlocks = Object.values(responseData).reduce(
      (sum: number, count) => sum + (count as number),
      0
    );

    // Konversi ke format frontend
    const consensus = Object.entries(responseData)
      .filter(([name]) => name !== "Uncertain" && name !== "Other")
      .map(([name, count]) => ({
        name,
        percentage: totalBlocks > 0 ? parseFloat(((count as number / totalBlocks) * 100).toFixed(1)) : 0,
        blocks: count,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      consensus,
      totalBlocks,
      epochRange: usedRange,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Client diversity fetch error:", error);

    // Fallback data jika semua API call gagal
    return NextResponse.json({
      consensus: [
        { name: "Lighthouse", percentage: 33.2, blocks: 0 },
        { name: "Prysm", percentage: 30.8, blocks: 0 },
        { name: "Teku", percentage: 24.5, blocks: 0 },
        { name: "Nimbus", percentage: 7.1, blocks: 0 },
        { name: "Lodestar", percentage: 2.5, blocks: 0 },
        { name: "Grandine", percentage: 1.9, blocks: 0 },
      ],
      totalBlocks: 0,
      epochRange: { start: 0, end: 0 },
      updatedAt: new Date().toISOString(),
      fallback: true,
    });
  }
}
