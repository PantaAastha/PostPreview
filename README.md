# PostPreview

A ChatGPT-native app for previewing social media posts before publishing.

## Features

- **Instagram Post Preview**: See how your post will look on Instagram
- **Image Dimension Validation**: Check if your images meet platform requirements
- **Content Generation Support**: Works with ChatGPT-generated captions

## Project Structure

```
PostPreview/
├── mcp-server/          # MCP Server (Node.js + TypeScript)
│   └── src/
│       ├── index.ts     # Server entry point
│       └── tools/       # MCP tool implementations
├── web-component/       # React Widget
│   └── src/
│       ├── components/  # UI components
│       └── hooks/       # Apps SDK integration
└── package.json         # Root workspace config
```

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm install
cd mcp-server && npm install
cd ../web-component && npm install
cd ..
```

### 2. Run in Development Mode

```bash
# Terminal 1: Start the React dev server
cd web-component && npm run dev

# Terminal 2: Start the MCP server
cd mcp-server && npm run dev
```

### 3. Test in ChatGPT

1. Expose MCP server via ngrok:
   ```bash
   ngrok http 3000
   ```

2. In ChatGPT (with Developer Mode enabled):
   - Go to Settings → Apps & Connectors → Connectors
   - Click "Create" and paste your ngrok URL + `/mcp`
   - Start a new chat and add your connector

3. Try prompts like:
   - "Write me an Instagram caption about launching a coffee shop"
   - "Preview this Instagram post: [your caption]"

## MCP Tools

| Tool | Description |
|------|-------------|
| `render_instagram_post` | Render a visual Instagram post preview |
| `validate_image` | Check image dimensions against IG requirements |

## Development

### Building for Production

```bash
npm run build
```

### Serving Built Assets

```bash
npm run serve
```

## License

MIT
