import express from 'express';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import {
    renderInstagramPost,
    type RenderInstagramPostOutput
} from './tools/renderInstagramPost.js';
import {
    validateImage,
    type ValidateImageOutput
} from './tools/validateImage.js';

const PORT = process.env.PORT || 3000;
const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || 'http://localhost:5173';

// Create Express app
const app = express();

// Parse JSON body - required for StreamableHTTP
app.use(express.json());

// Enable CORS for all origins (required for ChatGPT)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, mcp-session-id');
    res.header('Access-Control-Expose-Headers', 'mcp-session-id');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'postpreview-mcp' });
});

// Store server instances and transports by session ID
const sessions = new Map<string, { server: McpServer; transport: StreamableHTTPServerTransport }>();

// Initialize MCP server
function createMcpServer(): McpServer {
    const mcpServer = new McpServer({
        name: 'postpreview',
        version: '0.1.0',
    });

    // Register the widget template as a resource
    mcpServer.registerResource(
        'instagram_preview',
        'ui://widget/instagram_preview.html',
        {},
        async () => ({
            contents: [
                {
                    uri: 'ui://widget/instagram_preview.html',
                    mimeType: 'text/html+skybridge',
                    text: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Preview</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="${WIDGET_BASE_URL}/postpreview.js"></script>
    <link rel="stylesheet" href="${WIDGET_BASE_URL}/postpreview.css">
</body>
</html>
                    `.trim(),
                },
            ],
        })
    );

    // Register tools
    mcpServer.registerTool(
        'render_instagram_post',
        {
            title: 'Render Instagram Post Preview',
            description: 'Render a visual preview of an Instagram post. Use this tool when the user wants to see how their Instagram post will look, wants to create or preview captions, or is preparing social media content for Instagram.',
            inputSchema: {
                caption: z.string().describe('The caption text for the Instagram post'),
                imageUrl: z.string().url().optional().describe('URL of the image to display in the post'),
                username: z.string().default('@yourname').describe('The username to display on the post'),
                likes: z.number().int().min(0).default(0).describe('Number of likes to display'),
                isVerified: z.boolean().default(false).describe('Whether to show a verified badge'),
            },
            _meta: {
                'openai/outputTemplate': 'ui://widget/instagram_preview.html',
            },
        },
        async (args) => {
            const input = {
                caption: args.caption as string,
                imageUrl: args.imageUrl as string | undefined,
                username: (args.username as string) || '@yourname',
                likes: (args.likes as number) || 0,
                isVerified: (args.isVerified as boolean) || false,
            };
            const result: RenderInstagramPostOutput = renderInstagramPost(input);

            return {
                structuredContent: { ...result } as Record<string, unknown>,
                content: [
                    {
                        type: 'text' as const,
                        text: `Instagram post preview for ${input.username}: "${input.caption.substring(0, 50)}..."`,
                    },
                ],
                _meta: {},
            };
        }
    );

    mcpServer.registerTool(
        'validate_image',
        {
            title: 'Validate Image Dimensions',
            description: 'Check image dimensions against Instagram requirements. Use this tool when a user uploads an image for social media or asks about image sizing for Instagram.',
            inputSchema: {
                imageUrl: z.string().optional().describe('URL of the image (for reference)'),
                width: z.number().int().positive().describe('Width of the image in pixels'),
                height: z.number().int().positive().describe('Height of the image in pixels'),
            },
        },
        async (args) => {
            const input = {
                imageUrl: args.imageUrl as string | undefined,
                width: args.width as number,
                height: args.height as number,
            };
            const result: ValidateImageOutput = validateImage(input);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
    );

    return mcpServer;
}

// MCP endpoint - handles POST for messages, GET for SSE, DELETE for cleanup
app.all('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    console.log(`[MCP] ${req.method} /mcp - Session: ${sessionId || 'new'}`);

    // Handle initialization (POST without session ID)
    if (req.method === 'POST' && !sessionId) {
        // Create new session
        const newSessionId = randomUUID();
        const mcpServer = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => newSessionId,
        });

        // Connect server to transport
        await mcpServer.connect(transport);

        // Store session
        sessions.set(newSessionId, { server: mcpServer, transport });
        console.log(`[MCP] New session created: ${newSessionId}`);

        // Handle the request
        await transport.handleRequest(req, res, req.body);
        return;
    }

    // Handle existing session
    if (sessionId) {
        const session = sessions.get(sessionId);

        if (!session) {
            res.status(404).json({
                jsonrpc: '2.0',
                error: { code: -32000, message: 'Session not found' },
                id: null,
            });
            return;
        }

        if (req.method === 'DELETE') {
            await session.transport.close();
            sessions.delete(sessionId);
            console.log(`[MCP] Session deleted: ${sessionId}`);
            res.status(200).json({ message: 'Session closed' });
            return;
        }

        // Handle POST and GET for existing session
        await session.transport.handleRequest(req, res, req.body);
        return;
    }

    // No session and not an initialization request
    res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Missing mcp-session-id header' },
        id: null,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 PostPreview MCP Server running on http://localhost:${PORT}`);
    console.log(`   - MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`   - Health check: http://localhost:${PORT}/health`);
    console.log(`   - Widget URL: ${WIDGET_BASE_URL}`);
    console.log('\nResources:');
    console.log('   - ui://widget/instagram_preview.html');
    console.log('\nTools available:');
    console.log('   - render_instagram_post: Preview Instagram posts');
    console.log('   - validate_image: Check image dimensions\n');
});
