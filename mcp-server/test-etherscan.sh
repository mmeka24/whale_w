#!/bin/bash

# Test script for Etherscan API v2
# Usage: ./test-etherscan.sh YOUR_API_KEY [ADDRESS]

API_KEY="${1:-YourEtherscanApiKey}"
ADDRESS="${2:-0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045}"

echo "Testing Etherscan API v2..."
echo "Address: $ADDRESS"
echo ""

# Make the API call
curl -s "https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${ADDRESS}&tag=latest&apikey=${API_KEY}" | jq '.'

# If jq is not installed, use this instead:
# curl -s "https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${ADDRESS}&tag=latest&apikey=${API_KEY}"
