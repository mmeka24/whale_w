export interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  asset: string
  category: string
  blockNumber: number
  timestamp?: number
}

export interface Pattern {
  type: "sequence" | "timing" | "protocol_switch" | "market_correlation"
  description: string
  actions: string[]
  confidence: number
  occurrences: number
  avgTimeGap?: string
  lastSeen?: number
}

export interface WhaleAnalysis {
  address: string
  patterns: Pattern[]
  currentBehavior: {
    status: "normal" | "pattern_detected" | "unusual"
    message: string
    confidence?: number
  }
  stats: {
    totalTransactions: number
    avgDailyActivity: number
    favoriteProtocols: string[]
    riskProfile: "conservative" | "moderate" | "aggressive"
  }
}
