import { NextResponse } from "next/server";

// Contract addresses for each audited protocol
const PROTOCOL_CONTRACTS: Record<string, string[]> = {
  lido: [
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH (Lido)
  ],
  // Solo staking tidak punya smart contract — native ETH staking
};

// Cek apakah smart contract ter-verified via Sourcify (tanpa API key)
async function checkContractVerification(address: string): Promise<{
  verified: boolean;
  status: string;
}> {
  try {
    // Sourcify: free, no API key needed
    const url = `https://sourcify.dev/server/check-all-by-addresses?addresses=${address}&chainIds=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache 1 jam
    if (!res.ok) throw new Error("Sourcify API error");
    
    const data = await res.json();
    // Response: [{ address, chainIds: [{ chainId, status: "perfect"|"partial"|"false" }] }]
    if (Array.isArray(data) && data.length > 0) {
      const chainResult = data[0]?.chainIds?.[0];
      if (chainResult) {
        const status = chainResult.status;
        // "perfect" = full match, "partial" = partial match — both are verified
        const verified = status === "perfect" || status === "partial";
        return { verified, status };
      }
    }
    return { verified: false, status: "unknown" };
  } catch {
    return { verified: false, status: "error" };
  }
}

// Ambil data client diversity dari Blockprint API (sama seperti /api/client-diversity)
async function getClientDiversity(): Promise<{
  topClientName: string;
  topClientPercentage: number;
  totalClients: number;
  fallback: boolean;
}> {
  try {
    const genesisTime = 1606824023;
    const nowEpoch = Math.floor((Date.now() / 1000 - genesisTime) / 384);

    const ranges = [
      { start: nowEpoch - 225, end: nowEpoch },
      { start: nowEpoch - 450, end: nowEpoch - 225 },
      { start: 340000, end: 340225 },
    ];

    for (const range of ranges) {
      try {
        const res = await fetch(
          `https://api.blockprint.sigp.io/blocks_per_client/${range.start}/${range.end}`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) continue;

        const data = await res.json();
        const entries = Object.entries(data as Record<string, number>)
          .filter(([name]) => name !== "Uncertain" && name !== "Other");
        
        const totalBlocks = entries.reduce((sum, [, count]) => sum + count, 0);
        if (totalBlocks === 0) continue;

        const sorted = entries.sort(([, a], [, b]) => b - a);
        const [topName, topCount] = sorted[0];
        
        return {
          topClientName: topName,
          topClientPercentage: parseFloat(((topCount / totalBlocks) * 100).toFixed(1)),
          totalClients: entries.length,
          fallback: false,
        };
      } catch {
        continue;
      }
    }
    throw new Error("No Blockprint data");
  } catch {
    // Fallback data
    return {
      topClientName: "Lighthouse",
      topClientPercentage: 33.2,
      totalClients: 6,
      fallback: true,
    };
  }
}

// Hitung skor Client Diversity berdasarkan dominasi client
function calculateClientDiversityScore(topPercentage: number, isSoloStaker: boolean): {
  score: number;
  description: string;
} {
  // Solo staker bisa memilih minority client sendiri
  if (isSoloStaker) {
    if (topPercentage < 33) return { score: 1, description: `Aman · Minoritas (<33%)` };
    if (topPercentage < 66) return { score: 1, description: `Aman · User pilih sendiri` };
    return { score: 2, description: `Waspada · Jaringan terdominasi` };
  }
  
  // Liquid staking (delegated) — tergantung operator
  if (topPercentage < 33) return { score: 1, description: `Safe (<33% dominasi)` };
  if (topPercentage < 66) return { score: 2, description: `Warning (${topPercentage}% dominasi)` };
  return { score: 3, description: `Danger (${topPercentage}% dominasi)` };
}

// Hitung skor SC Security berdasarkan status verifikasi Sourcify
function calculateSCSecurityScore(
  protocolId: string, 
  contractsVerified: boolean[]
): {
  score: number;
  description: string;
} {
  // Solo staking tidak bergantung pada smart contract
  if (protocolId === "solo") {
    return { score: 1, description: "Native ETH · No SC Risk" };
  }

  // Jika semua contract terverifikasi di Sourcify
  if (contractsVerified.length > 0 && contractsVerified.every(v => v)) {
    return { score: 1, description: "Verified on Sourcify ✓" };
  }

  // Ada contract yang belum terverifikasi
  return { score: 2, description: "Unverified / No Audit" };
}

export async function GET() {
  try {
    // Fetch data secara paralel
    const [clientDiversity, lidoVerification] = await Promise.all([
      getClientDiversity(),
      Promise.all(
        (PROTOCOL_CONTRACTS.lido || []).map(addr => checkContractVerification(addr))
      ),
    ]);

    // Hitung skor per protokol
    const scores: Record<string, {
      clientDiversity: { score: number; description: string };
      scSecurity: { score: number; description: string };
    }> = {
      solo: {
        clientDiversity: calculateClientDiversityScore(clientDiversity.topClientPercentage, true),
        scSecurity: calculateSCSecurityScore("solo", []),
      },
      lido: {
        clientDiversity: calculateClientDiversityScore(clientDiversity.topClientPercentage, false),
        scSecurity: calculateSCSecurityScore("lido", lidoVerification.map(v => v.verified)),
      },
    };

    return NextResponse.json({
      scores,
      meta: {
        clientDiversity: {
          topClient: clientDiversity.topClientName,
          topPercentage: clientDiversity.topClientPercentage,
          totalClients: clientDiversity.totalClients,
          fallback: clientDiversity.fallback,
        },
        scSecurity: {
          lido: lidoVerification.map(v => ({
            verified: v.verified,
            status: v.status,
          })),
        },
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Risk scoring API error:", error);
    
    // Fallback — return default scores
    return NextResponse.json({
      scores: {
        solo: {
          clientDiversity: { score: 1, description: "Minoritas (<33%)" },
          scSecurity: { score: 1, description: "Native ETH · No SC Risk" },
        },
        lido: {
          clientDiversity: { score: 2, description: "Client mayoritas" },
          scSecurity: { score: 1, description: "Audited by Top Firms" },
        },
      },
      meta: {
        updatedAt: new Date().toISOString(),
        fallback: true,
      },
    });
  }
}
