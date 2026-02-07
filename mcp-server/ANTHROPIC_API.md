# Anthropic API Setup

## Authentication Error: "invalid x-api-key"

If you're getting this error, it means your Anthropic API key is either:
1. Not set correctly
2. Invalid or expired
3. Missing the required header format

## Quick Test

Test your API key with:

```bash
cd mcp-server
./test-anthropic.sh YOUR_API_KEY
```

Or if you have it in your `.env` file:
```bash
source .env
./test-anthropic.sh
```

## Setting Up Your API Key

1. **Get your API key from Anthropic:**
   - Visit https://console.anthropic.com/
   - Sign in or create an account
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `sk-ant-...`)

2. **Add to your `.env` file:**
   ```bash
   cd mcp-server
   # Edit .env file
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

3. **Verify the key is loaded:**
   ```bash
   # Check if the key is in your .env
   grep ANTHROPIC_API_KEY .env
   ```

## Correct API Request Format

The Anthropic API requires:
- Header: `x-api-key: YOUR_API_KEY`
- Header: `anthropic-version: 2023-06-01` (or latest version)
- Header: `content-type: application/json`

Example curl command:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Common Issues

1. **Key format**: Make sure your key starts with `sk-ant-`
2. **Whitespace**: No spaces around the `=` in `.env` file
3. **Quotes**: Don't wrap the key in quotes in `.env` file
4. **Environment loading**: Make sure `dotenv.config()` is called before using the key

## Verify Your Setup

Run the test script:
```bash
./test-anthropic.sh YOUR_API_KEY
```

Expected success response:
```json
{
  "id": "msg_...",
  "type": "message",
  "role": "assistant",
  "content": [...]
}
```

Expected error (if key is invalid):
```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "invalid x-api-key"
  }
}
```
