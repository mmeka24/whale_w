// Transaction from blockchain
export interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string // ETH amount as string
  asset: string // "ETH" or token symbol
  category: string // "external", "erc20", etc.
  blockNumber: number
  timestamp?: number // Unix timestamp in milliseconds
}

// Detected behavioral pattern
export interface Pattern {
  type: "timing" | "sequence" | "value" | "protocol"
  description: string
  confidence: number // 0 to 1
  occurrences: number // How many times we've seen it
  details: {
    avgTimeGap?: string // "2.3 days"
    avgValue?: string // "10.5 ETH"
    actions?: string[] // ["Buy", "Wait", "Sell"]
  }
}

// Whale's strategic profile
export interface WhaleProfile {
  address: string
  totalTransactions: number
  totalValueMoved: string // In ETH
  avgTransactionSize: string
  tradingStyle: "conservative" | "moderate" | "aggressive" | "bot"
  patterns: Pattern[]
  lastAnalyzed: number // Timestamp
}

// Prediction result
export interface Prediction {
  confidence: number // 0 to 1
  prediction: string // Natural language prediction
  reasoning: string // Why we think this
  basedOnPattern?: Pattern
  timeframe?: string // "next 6-48 hours"
}
