#!/bin/bash

# Test script for Anthropic API
# Usage: ./test-anthropic.sh YOUR_API_KEY

API_KEY="${1:-$ANTHROPIC_API_KEY}"

if [ -z "$API_KEY" ]; then
  echo "❌ Error: API key not provided"
  echo "Usage: ./test-anthropic.sh YOUR_API_KEY"
  echo "Or set ANTHROPIC_API_KEY environment variable"
  exit 1
fi

echo "Testing Anthropic API connection..."
echo ""

# Test with a simple message
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: ${API_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [
      {"role": "user", "content": "Say hello"}
    ]
  }' | jq '.'

# If jq is not installed, remove the | jq '.' part
