# Testing Your MCP Server

## Quick Test

Run the automated test script:

```bash
cd mcp-server
npm run build  # Make sure it's built first
node test-mcp.js
```

This will:
1. ✅ Initialize the MCP server
2. ✅ List available tools
3. ✅ Call the `test_tool` with a sample message

## Manual Testing

### Option 1: Using the Test Script

The test script (`test-mcp.js`) automatically tests:
- Server initialization
- Tool listing
- Tool execution

### Option 2: Manual JSON-RPC Testing

You can manually send JSON-RPC messages to test:

```bash
# Start the server
npm start

# In another terminal, send initialization (via stdin)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node build/index.js
```

### Option 3: Using an MCP Client

If you have an MCP client configured (like in Claude Desktop or another MCP-compatible app):

1. **Configure the client** to point to your server:
   ```json
   {
     "mcpServers": {
       "shadow-trader": {
         "command": "node",
         "args": ["/path/to/whale_w/mcp-server/build/index.js"]
       }
     }
   }
   ```

2. **Test through the client** - The client will handle initialization and you can call tools through its interface.

## What to Test

### ✅ Basic Functionality
- [ ] Server starts without errors
- [ ] Server responds to initialization
- [ ] Tools are listed correctly
- [ ] Tools can be called successfully

### ✅ Your `test_tool`
- [ ] Tool appears in tools list
- [ ] Tool accepts `message` parameter
- [ ] Tool returns expected response

## Troubleshooting

### Server won't start
- Check that `npm run build` completed successfully
- Verify `build/index.js` exists
- Check for TypeScript compilation errors

### No response from server
- MCP servers use stdio (stdin/stdout) for communication
- Make sure you're sending valid JSON-RPC 2.0 messages
- Check that the server process is running

### Tools not appearing
- Verify `ListToolsRequestSchema` handler is set up correctly
- Check that tools array is returned in the correct format
- Ensure server capabilities include `tools: {}`

## Expected Output

When running `node test-mcp.js`, you should see:

```
🚀 Starting MCP Server Tests
==================================================
✅ 🐋 Shadow Trader MCP Server running

🔧 Step 1: Initializing MCP server...
✅ Server initialized: { name: 'shadow-trader', version: '1.0.0' }

🔧 Step 2: Listing available tools...
✅ Available tools:
   - test_tool: A simple test tool to verify the server works

🔧 Step 3: Calling tool "test_tool" with args: { message: 'Hello from test client!' }
✅ Tool response:
    Test successful! You said: Hello from test client!

==================================================
✅ All tests completed successfully!
```
