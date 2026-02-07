# Etherscan API v2 Usage

## Migration from v1 to v2

Etherscan API v1 is deprecated. Use v2 endpoints instead.

## Correct API v2 Endpoint Format

### Get Account Balance

**v1 (Deprecated):**
```bash
curl "https://api.etherscan.io/api?module=account&action=balance&address=0x...&tag=latest&apikey=YOUR_KEY"
```

**v2 (Current):**
```bash
curl "https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=0x...&tag=latest&apikey=YOUR_KEY"
```

### Key Changes:
- Base URL changed from `https://api.etherscan.io/api` to `https://api.etherscan.io/v2/api`
- **Required parameter**: `chainid=1` (1 for Ethereum mainnet)
- **Required parameter**: `module=account` (specifies the API module)
- **Required parameter**: `address=0x...` (the Ethereum address to query)
- All other parameters remain the same

## Required Parameters

- `chainid` - Chain ID (1 for Ethereum mainnet, 5 for Goerli, etc.)
- `module` - API module (e.g., "account")
- `action` - Action to perform (e.g., "balance")
- `address` - Ethereum address (0x...)
- `apikey` - Your Etherscan API key

## Example Request

```bash
curl "https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&tag=latest&apikey=YOUR_API_KEY"
```

**Note**: Make sure to replace `YOUR_API_KEY` with your actual Etherscan API key!

## Response Format

```json
{
  "status": "1",
  "message": "OK",
  "result": "1000000000000000000"
}
```

- `status`: "1" for success, "0" for error
- `message`: Status message
- `result`: Balance in Wei (1 ETH = 10^18 Wei)

## Using the MCP Server Tool

The MCP server includes an `etherscan_get_balance` tool that handles the v2 API:

1. Set your API key in `.env`:
   ```
   ETHERSCAN_API_KEY=your_api_key_here
   ```

2. Use the tool through MCP client with:
   - `address`: Ethereum address (required)
   - `tag`: Block tag - "latest", "earliest", or "pending" (optional, defaults to "latest")

## Get Your API Key

1. Visit https://etherscan.io/
2. Sign up for a free account
3. Go to API-KEYs section
4. Create a new API key
5. Add it to your `.env` file
