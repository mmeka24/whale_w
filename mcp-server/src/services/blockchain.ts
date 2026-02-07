import axios from "axios";
import { createPublicClient, http, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { Transaction } from "../types.js";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ETHERSCAN_API = "https://api.etherscan.io/api";

// Free public RPC for balance checks
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

/**
 * Get transaction history for an address
 */
export async function getWalletTransactions(
  address: string,
  limit: number = 100
): Promise<Transaction[]> {
  try {
    console.error(`📡 Fetching ${limit} transactions for ${address}...`);

    const response = await axios.get(ETHERSCAN_API, {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: limit,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status !== "1") {
      throw new Error(response.data.message || "Etherscan API error");
    }

    const txs = response.data.result || [];

    return txs.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from.toLowerCase(),
      to: tx.to?.toLowerCase() || null,
      value: formatUnits(BigInt(tx.value || "0"), 18),
      asset: "ETH",
      category: "external",
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
    }));
  } catch (error: any) {
    console.error("❌ Blockchain fetch error:", error.message);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
}

/**
 * Get current ETH balance
 */
export async function getEthBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    return formatUnits(balance, 18);
  } catch (error: any) {
    console.error("❌ Balance fetch error:", error.message);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

/**
 * Get basic wallet stats
 */
export async function getWalletStats(address: string, transactions: Transaction[]) {
  const balance = await getEthBalance(address);
  
  const totalValueMoved = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.value),
    0
  );

  const avgTransactionSize = transactions.length > 0
    ? totalValueMoved / transactions.length
    : 0;

  return {
    balance,
    totalTransactions: transactions.length,
    totalValueMoved: totalValueMoved.toFixed(4),
    avgTransactionSize: avgTransactionSize.toFixed(4),
  };
}
