import { Transaction, Pattern } from "../types.js";
import { analyzeWithAI } from "./ai.js";

interface TransactionSession {
  startTime: number;
  endTime: number;
  transactions: Transaction[];
  totalValue: number;
}

export class PatternAnalyzer {
  /**
   * Group transactions into sessions (within 24h)
   */
  private groupIntoSessions(transactions: Transaction[]): TransactionSession[] {
    const sessions: TransactionSession[] = [];
    const SESSION_GAP = 24 * 60 * 60 * 1000; // 24 hours

    let currentSession: TransactionSession | null = null;

    for (const tx of transactions) {
      if (!tx.timestamp) continue;

      if (!currentSession) {
        currentSession = {
          startTime: tx.timestamp,
          endTime: tx.timestamp,
          transactions: [tx],
          totalValue: parseFloat(tx.value),
        };
      } else {
        const timeDiff = currentSession.endTime - tx.timestamp;

        if (timeDiff <= SESSION_GAP) {
          currentSession.transactions.push(tx);
          currentSession.startTime = tx.timestamp;
          currentSession.totalValue += parseFloat(tx.value);
        } else {
          sessions.push(currentSession);
          currentSession = {
            startTime: tx.timestamp,
            endTime: tx.timestamp,
            transactions: [tx],
            totalValue: parseFloat(tx.value),
          };
        }
      }
    }

    if (currentSession) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  /**
   * Analyze with AI
   */
  async analyzeWithAIMethod(
    transactions: Transaction[],
    sessions: TransactionSession[]
  ): Promise<Pattern[]> {
    const prompt = `Analyze this whale wallet's behavior and find patterns.

Transaction count: ${transactions.length}
Active sessions: ${sessions.length}

Recent activity (last 10 transactions):
${transactions
  .slice(0, 10)
  .map(
    (tx, i) =>
      `${i + 1}. ${tx.value} ETH - ${new Date(tx.timestamp || 0).toISOString()}`
  )
  .join("\n")}

Session analysis:
${sessions
  .slice(0, 5)
  .map(
    (s, i) =>
      `Session ${i + 1}: ${s.transactions.length} txs, ${s.totalValue.toFixed(
        2
      )} ETH total`
  )
  .join("\n")}

Find predictive patterns like:
1. Trading times (e.g., "usually active 2-4 PM EST")
2. Value patterns (e.g., "often moves 10+ ETH at once")
3. Behavioral patterns (e.g., "accumulates then dumps")

Return ONLY a JSON array with this structure:
[{
  "type": "timing",
  "description": "string describing the pattern",
  "actions": ["action1", "action2"],
  "confidence": 0.75,
  "occurrences": 5
}]`;

    try {
      const response = await analyzeWithAI(prompt);

      // Extract JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      if (response.trim().startsWith("[")) {
        return JSON.parse(response);
      }

      return [];
    } catch (error) {
      console.error("Pattern analysis error:", error);
      return [];
    }
  }

  /**
   * Main analysis function
   */
  async analyze(transactions: Transaction[]): Promise<Pattern[]> {
    if (transactions.length < 5) {
      return [
        {
          type: "timing",
          description: "Insufficient data for pattern analysis",
          actions: [],
          confidence: 0,
          occurrences: 0,
        },
      ];
    }

    const sessions = this.groupIntoSessions(transactions);
    const patterns = await this.analyzeWithAIMethod(transactions, sessions);

    return patterns;
  }

  /**
   * Check if current behavior matches patterns
   */
  checkCurrentPattern(
    recentTxs: Transaction[],
    knownPatterns: Pattern[]
  ): { matched: boolean; pattern?: Pattern; confidence: number } {
    if (recentTxs.length === 0 || knownPatterns.length === 0) {
      return { matched: false, confidence: 0 };
    }

    // Simple check: large recent transaction?
    const recentLargeTx = recentTxs.some((tx) => parseFloat(tx.value) > 10);

    if (recentLargeTx) {
      return {
        matched: true,
        pattern: knownPatterns[0],
        confidence: 0.7,
      };
    }

    return { matched: false, confidence: 0 };
  }
}

export const patternAnalyzer = new PatternAnalyzer();