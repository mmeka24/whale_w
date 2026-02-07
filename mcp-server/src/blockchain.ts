import axios from "axios";
import { createPublicClient, http, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { Transaction } from "../types.js";

// Free public RPC
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YourApiKeyToken";
const ETHERSCAN_API = "https://api.etherscan.io/api";

/**
 * Get transaction history using Etherscan (free!)
 */
export async function getWalletTransactions(
  address: string,
  limit: number = 100
): Promise<Transaction[]> {
  try {
    // Get normal transactions
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

    // Format transactions
    return txs.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: formatUnits(BigInt(tx.value || "0"), 18),
      asset: "ETH",
      category: "external",
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp) * 1000,
    }));
  } catch (error: any) {
    console.error("Blockchain error:", error.message);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
}

/**
 * Get ETH balance
 */
export async function getEthBalance(address: string): Promise<string> {
  const balance = await publicClient.getBalance({
    address: address as `0x${string}`,
  });
  return formatUnits(balance, 18);
}