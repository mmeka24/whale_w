import { getWalletTransactions, getEthBalance } from "./services/blockchain.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const vitalik = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

  console.log("Testing blockchain service...\n");

  // Test balance
  const balance = await getEthBalance(vitalik);
  console.log(`✅ Balance: ${balance} ETH`);

  // Test transactions
  const txs = await getWalletTransactions(vitalik, 10);
  console.log(`✅ Fetched ${txs.length} transactions`);
  console.log(`   Latest: ${txs[0]?.value} ETH to ${txs[0]?.to}\n`);

  console.log("🎉 Blockchain service working!");
}

test().catch(console.error);
