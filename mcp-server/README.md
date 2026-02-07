# MCP Server

Model Context Protocol (MCP) server for the whale_w project.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and fill in your actual configuration values.

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables can be configured in `.env`:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `LOG_LEVEL` - Logging level (info/debug/error)
- `API_KEY` - General API key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `DATABASE_URL` - Database connection string
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `CORS_ORIGIN` - CORS allowed origin

## Features

- **Tools**: Extendable tool system for MCP operations
- **Resources**: Resource management and access
- **Prompts**: Prompt templates and management

## Development

The server uses stdio transport for communication with MCP clients. Make sure your MCP client is configured to connect to this server.

## License

ISC
