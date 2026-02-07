#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { getWalletTransactions, getEthBalance } from "./blockchain.js";
import { patternAnalyzer } from "./patternAnalyzer.js";
import { Pattern } from "./types.js";

dotenv.config();

const server = new Server(
  {
    name: "shadow-trader",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Store learned patterns
const learnedPatterns = new Map<string, Pattern[]>();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "learn_whale_patterns",
        description:
          "Analyze a whale wallet's transaction history and learn behavioral patterns. Returns patterns with confidence scores. Use this when asked to 'analyze' or 'learn patterns' from a wallet.",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Ethereum address (0x...)",
              pattern: "^0x[a-fA-F0-9]{40}$",
            },
            limit: {
              type: "number",
              description: "Number of transactions to analyze (default: 50)",
              default: 50,
            },
          },
          required: ["address"],
        },
      },
      {
        name: "check_whale_activity",
        description:
          "Check a whale's current activity against learned patterns. Use this to see if whale is doing something unusual or matching a known pattern.",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Ethereum address",
              pattern: "^0x[a-fA-F0-9]{40}$",
            },
          },
          required: ["address"],
        },
      },
      {
        name: "get_whale_summary",
        description:
          "Get quick summary of a whale wallet including ETH balance and recent activity count.",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Ethereum address",
              pattern: "^0x[a-fA-F0-9]{40}$",
            },
          },
          required: ["address"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Validate args exists and is an object
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return {
      content: [{ type: "text", text: "Error: Invalid arguments provided" }],
      isError: true,
    };
  }

  try {
    if (name === "learn_whale_patterns") {
      // Validate address is a string
      if (typeof args.address !== 'string') {
        return {
          content: [{ type: "text", text: "Error: address must be a string" }],
          isError: true,
        };
      }
      const address = args.address.toLowerCase();
      const limit = typeof args.limit === 'number' ? args.limit : 50;

      console.error(`🔍 Learning patterns for ${address}...`);

      const transactions = await getWalletTransactions(address, limit);
      const patterns = await patternAnalyzer.analyze(transactions);

      learnedPatterns.set(address, patterns);

      const result = {
        address,
        transactionsAnalyzed: transactions.length,
        patternsFound: patterns.length,
        patterns: patterns.map((p) => ({
          type: p.type,
          description: p.description,
          confidence: `${(p.confidence * 100).toFixed(0)}%`,
          occurrences: p.occurrences,
        })),
        summary: `Analyzed ${transactions.length} transactions and found ${patterns.length} behavioral patterns.`,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    if (name === "check_whale_activity") {
      // Validate address is a string
      if (typeof args.address !== 'string') {
        return {
          content: [{ type: "text", text: "Error: address must be a string" }],
          isError: true,
        };
      }
      const address = args.address.toLowerCase();

      console.error(`👀 Checking activity for ${address}...`);

      const recentTxs = await getWalletTransactions(address, 10);
      const patterns = learnedPatterns.get(address) || [];

      if (patterns.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "No patterns learned yet",
                message: `Use learn_whale_patterns first to analyze ${address}`,
                recentActivity: `${recentTxs.length} transactions in last period`,
              }),
            },
          ],
        };
      }

      const match = patternAnalyzer.checkCurrentPattern(recentTxs, patterns);

      const result = {
        address,
        status: match.matched ? "🚨 PATTERN DETECTED" : "✅ Normal activity",
        recentTransactions: recentTxs.length,
        lastActivity: recentTxs[0]?.timestamp
          ? new Date(recentTxs[0].timestamp).toISOString()
          : "Unknown",
        patternMatch: match.matched
          ? {
              description: match.pattern?.description,
              confidence: `${(match.confidence * 100).toFixed(0)}%`,
            }
          : null,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    if (name === "get_whale_summary") {
      // Validate address is a string
      if (typeof args.address !== 'string') {
        return {
          content: [{ type: "text", text: "Error: address must be a string" }],
          isError: true,
        };
      }
      const address = args.address.toLowerCase();

      console.error(`📊 Getting summary for ${address}...`);

      const [balance, recentTxs] = await Promise.all([
        getEthBalance(address),
        getWalletTransactions(address, 20),
      ]);

      const result = {
        address,
        ethBalance: `${parseFloat(balance).toFixed(4)} ETH`,
        recentTransactions: recentTxs.length,
        lastActive: recentTxs[0]?.timestamp
          ? new Date(recentTxs[0].timestamp).toISOString()
          : "No recent activity",
        totalValueMoved: recentTxs
          .reduce((sum, tx) => sum + parseFloat(tx.value), 0)
          .toFixed(4),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    console.error("❌ Tool error:", error);
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🐋 Shadow Trader MCP Server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});