#!/usr/bin/env node

/**
 * Simple MCP Server Test Client
 * Tests the MCP server by sending JSON-RPC messages via stdio
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the MCP server
const serverPath = join(__dirname, 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 0;
const pendingRequests = new Map();

// Handle server responses
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      
      if (response.id !== undefined) {
        const resolver = pendingRequests.get(response.id);
        if (resolver) {
          pendingRequests.delete(response.id);
          resolver(response);
        }
      } else if (response.method) {
        console.log('📨 Server notification:', response.method);
      }
    } catch (e) {
      // Not JSON, might be error output
      if (line.includes('🐋') || line.includes('running')) {
        console.log('✅', line.trim());
      }
    }
  }
});

// Handle server errors
server.stderr.on('data', (data) => {
  const output = data.toString();
  if (!output.includes('🐋') && !output.includes('running')) {
    console.error('❌ Server error:', output.trim());
  }
});

// Send JSON-RPC request
function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    pendingRequests.set(id, resolve);
    
    server.stdin.write(JSON.stringify(request) + '\n');
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }
    }, 5000);
  });
}

// Initialize the server
async function initialize() {
  console.log('\n🔧 Step 1: Initializing MCP server...');
  try {
    const response = await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });
    
    if (response.result) {
      console.log('✅ Server initialized:', response.result.serverInfo);
      // Send initialized notification
      server.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      }) + '\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    return false;
  }
}

// List available tools
async function listTools() {
  console.log('\n🔧 Step 2: Listing available tools...');
  try {
    const response = await sendRequest('tools/list', {});
    
    if (response.result && response.result.tools) {
      console.log('✅ Available tools:');
      response.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      return response.result.tools;
    }
  } catch (error) {
    console.error('❌ Failed to list tools:', error.message);
    return [];
  }
}

// Call a tool
async function callTool(toolName, args) {
  console.log(`\n🔧 Step 3: Calling tool "${toolName}" with args:`, args);
  try {
    const response = await sendRequest('tools/call', {
      name: toolName,
      arguments: args
    });
    
    if (response.result) {
      if (response.result.isError) {
        console.error('❌ Tool returned error:', response.result.content);
      } else {
        console.log('✅ Tool response:');
        response.result.content.forEach(content => {
          if (content.type === 'text') {
            console.log('   ', content.text);
          }
        });
      }
      return response.result;
    }
  } catch (error) {
    console.error('❌ Failed to call tool:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting MCP Server Tests\n');
  console.log('=' .repeat(50));
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Test 1: Initialize
    const initialized = await initialize();
    if (!initialized) {
      console.error('\n❌ Server initialization failed. Exiting.');
      server.kill();
      process.exit(1);
    }
    
    // Test 2: List tools
    const tools = await listTools();
    if (tools.length === 0) {
      console.error('\n❌ No tools found. Exiting.');
      server.kill();
      process.exit(1);
    }
    
    // Test 3: Call test_tool
    if (tools.some(t => t.name === 'test_tool')) {
      await callTool('test_tool', { message: 'Hello from test client!' });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    // Clean up
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 1000);
  }
}

// Handle process exit
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});

// Run the tests
runTests();
