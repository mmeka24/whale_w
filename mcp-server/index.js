import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Create MCP server instance
const server = new Server(
  {
    name: 'whale-w-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'example_tool',
        description: 'An example tool for the MCP server',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'A message to process',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'etherscan_get_balance',
        description: 'Get Ethereum account balance using Etherscan API v2',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Ethereum address to check balance for',
            },
            tag: {
              type: 'string',
              description: 'Block tag (latest, earliest, pending)',
              default: 'latest',
            },
          },
          required: ['address'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'example_tool':
      return {
        content: [
          {
            type: 'text',
            text: `Processed message: ${args.message}`,
          },
        ],
      };

    case 'etherscan_get_balance': {
      const apiKey = process.env.ETHERSCAN_API_KEY;
      if (!apiKey) {
        throw new Error('ETHERSCAN_API_KEY not set in environment variables');
      }

      const address = args.address;
      const tag = args.tag || 'latest';

      try {
        // Use Etherscan API v2 endpoint
        const response = await axios.get('https://api.etherscan.io/v2/api', {
          params: {
            chainid: 1, // 1 for Ethereum mainnet
            module: 'account',
            action: 'balance',
            address: address,
            tag: tag,
            apikey: apiKey,
          },
        });

        if (response.data.status === '1') {
          // Convert wei to ether (1 ether = 10^18 wei)
          const balanceWei = response.data.result;
          const balanceEther = (BigInt(balanceWei) / BigInt(10 ** 18)).toString();
          const balanceRemainder = (BigInt(balanceWei) % BigInt(10 ** 18)).toString();

          return {
            content: [
              {
                type: 'text',
                text: `Address: ${address}\nBalance: ${balanceEther}.${balanceRemainder.padStart(18, '0')} ETH\nBalance (Wei): ${balanceWei}`,
              },
            ],
          };
        } else {
          throw new Error(`Etherscan API error: ${response.data.message}`);
        }
      } catch (error) {
        if (error.response) {
          throw new Error(`Etherscan API error: ${error.response.data.message || error.message}`);
        }
        throw new Error(`Failed to fetch balance: ${error.message}`);
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available resources
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'example://resource',
        name: 'Example Resource',
        description: 'An example resource',
        mimeType: 'text/plain',
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'example://resource') {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: 'This is an example resource',
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// List available prompts
server.setRequestHandler('prompts/list', async () => {
  return {
    prompts: [
      {
        name: 'example_prompt',
        description: 'An example prompt',
        arguments: [
          {
            name: 'topic',
            description: 'The topic for the prompt',
            required: true,
          },
        ],
      },
    ],
  };
});

// Handle prompt execution
server.setRequestHandler('prompts/get', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'example_prompt') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Tell me about ${args.topic}`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
