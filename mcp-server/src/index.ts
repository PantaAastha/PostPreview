import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { URL, fileURLToPath } from 'node:url';

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

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const MCP_PATH = '/mcp';

// Load the built widget HTML
function loadWidgetHtml(): string {
    const webDistPath = join(__dirname, '../../web-component/dist');
    const jsPath = join(webDistPath, 'postpreview.js');
    const cssPath = join(webDistPath, 'postpreview.css');

    if (existsSync(jsPath) && existsSync(cssPath)) {
        const js = readFileSync(jsPath, 'utf-8');
        const css = readFileSync(cssPath, 'utf-8');
        console.log('[Widget] Loading inlined assets from dist/');
        return `
<div id="root"></div>
<style>${css}</style>
<script type="module">${js}</script>
        `.trim();
    }

    throw new Error(
        `Widget assets not found. Run "npm run build" in web-component/ first.`
    );
}

const widgetHtml = loadWidgetHtml();

// File param schema for uploaded images (per OpenAI Apps SDK)
const fileParamSchema = z.object({
    download_url: z.string().url(),
    file_id: z.string(),
});

// Input schemas using Zod (as per OpenAI quickstart)
const renderInstagramPostInputSchema = {
    caption: z.string().describe('The caption text for the Instagram post'),
    imageUrl: z.string().url().optional().describe('URL of the image to display in the post'),
    image: fileParamSchema.optional().describe('Uploaded image file from ChatGPT'),
    username: z.string().optional().describe('The username to display on the post'),
    likes: z.number().optional().describe('Number of likes to display'),
    isVerified: z.boolean().optional().describe('Whether to show a verified badge'),
};

const validateImageInputSchema = {
    width: z.number().describe('Width of the image in pixels'),
    height: z.number().describe('Height of the image in pixels'),
    imageUrl: z.string().optional().describe('URL of the image (for reference)'),
};

// Create the MCP server (following OpenAI quickstart pattern)
function createPostPreviewServer(): McpServer {
    const server = new McpServer({
        name: 'postpreview',
        version: '0.1.0',
    });

    // Register the widget as a resource
    server.registerResource(
        'instagram-preview',
        'ui://widget/instagram_preview.html',
        {},
        async () => ({
            contents: [
                {
                    uri: 'ui://widget/instagram_preview.html',
                    mimeType: 'text/html+skybridge',
                    text: widgetHtml,
                    _meta: {
                        'openai/widgetPrefersBorder': true,
                        // CSP to allow loading images from OpenAI's file storage
                        // ChatGPT uses various CDN/storage domains for uploaded files
                        'openai/widgetCSP': {
                            resource_domains: [
                                'https://persistent.oaistatic.com',
                                'https://oaiusercontent.com',
                                'https://c.oaiusercontent.com',
                                'https://*.oaiusercontent.com',
                                'https://*.blob.core.windows.net', // Azure blob storage
                                'https://openaiusercontent.com',
                            ],
                        },
                    },
                },
            ],
        })
    );

    // Register render_instagram_post tool
    server.registerTool(
        'render_instagram_post',
        {
            title: 'Render Instagram Post Preview',
            description: 'Render a visual preview of an Instagram post. Use this tool when the user wants to see how their Instagram post will look, wants to create or preview captions, or is preparing social media content for Instagram.',
            inputSchema: renderInstagramPostInputSchema,
            _meta: {
                'openai/outputTemplate': 'ui://widget/instagram_preview.html',
                'openai/toolInvocation/invoking': 'Creating Instagram preview...',
                'openai/toolInvocation/invoked': 'Preview ready!',
                'openai/widgetAccessible': true,
                // Declare which params are file uploads
                'openai/fileParams': ['image'],
            },
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: false,
            },
        },
        async (args) => {
            // Handle both imageUrl (string) and image (file object with download_url)
            const imageArg = args.image as { download_url: string; file_id: string } | undefined;
            const resolvedImageUrl = imageArg?.download_url || (args.imageUrl as string | undefined);

            const input = {
                caption: args.caption as string,
                imageUrl: resolvedImageUrl,
                username: (args.username as string) || '@yourname',
                likes: (args.likes as number) || 0,
                isVerified: (args.isVerified as boolean) || false,
            };

            if (imageArg) {
                console.log('[Tool] Image file received:', imageArg.file_id);
            }

            console.log('[Tool] render_instagram_post called with:', JSON.stringify(input, null, 2));
            const result: RenderInstagramPostOutput = renderInstagramPost(input);
            console.log('[Tool] Returning structuredContent:', JSON.stringify(result, null, 2));

            return {
                content: [{ type: 'text' as const, text: 'Rendered Instagram post preview!' }],
                structuredContent: { ...result } as Record<string, unknown>,
            };
        }
    );

    // Register validate_image tool
    server.registerTool(
        'validate_image',
        {
            title: 'Validate Image Dimensions',
            description: 'Check image dimensions against Instagram requirements. Use this tool when a user uploads an image for social media or asks about image sizing for Instagram.',
            inputSchema: validateImageInputSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: false,
            },
        },
        async (args) => {
            const input = {
                width: args.width as number,
                height: args.height as number,
                imageUrl: args.imageUrl as string | undefined,
            };

            const result: ValidateImageOutput = validateImage(input);

            return {
                content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    return server;
}

// Create HTTP server (following OpenAI quickstart pattern exactly)
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
        res.writeHead(400).end('Missing URL');
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

    // CORS preflight for /mcp
    if (req.method === 'OPTIONS' && url.pathname === MCP_PATH) {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'content-type, mcp-session-id',
            'Access-Control-Expose-Headers': 'Mcp-Session-Id',
        });
        res.end();
        return;
    }

    // Health check
    if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' }).end('PostPreview MCP server');
        return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', server: 'postpreview-mcp' }));
        return;
    }

    // MCP endpoint - POST, GET, DELETE (following official quickstart)
    const MCP_METHODS = new Set(['POST', 'GET', 'DELETE']);
    if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

        console.log(`\n[MCP] ${req.method} ${MCP_PATH}`);

        // Create a new server instance for each request (stateless mode)
        const server = createPostPreviewServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // stateless mode
            enableJsonResponse: true,
        });

        res.on('close', () => {
            transport.close();
            server.close();
        });

        try {
            await server.connect(transport);
            await transport.handleRequest(req, res);
        } catch (error) {
            console.error('[MCP] Error handling request:', error);
            if (!res.headersSent) {
                res.writeHead(500).end('Internal server error');
            }
        }
        return;
    }

    res.writeHead(404).end('Not Found');
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`\n🚀 PostPreview MCP Server listening on http://localhost:${PORT}`);
    console.log(`   MCP endpoint: http://localhost:${PORT}${MCP_PATH}`);
    console.log(`   Health check: GET http://localhost:${PORT}/health`);
    console.log('\nResources:');
    console.log('   - ui://widget/instagram_preview.html');
    console.log('\nTools:');
    console.log('   - render_instagram_post: Preview Instagram posts');
    console.log('   - validate_image: Check image dimensions\n');
});
