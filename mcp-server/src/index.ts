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

// X Thread input schema
const renderXThreadInputSchema = {
    content: z.string().describe('The long-form content to split into a Twitter/X thread'),
    username: z.string().optional().describe('The username to display on the tweets (e.g., @username)'),
    displayName: z.string().optional().describe('Display name shown on tweets'),
};

// Multiplatform input schema (both Instagram + X thread)
const renderMultiplatformInputSchema = {
    caption: z.string().describe('The caption text for the Instagram post'),
    imageUrl: z.string().url().optional().describe('URL of the image to display'),
    image: fileParamSchema.optional().describe('Uploaded image file from ChatGPT'),
    threadContent: z.string().optional().describe('Long-form content for X thread (if different from caption). If not provided, caption will be used.'),
    username: z.string().optional().describe('Username to display on both platforms'),
    displayName: z.string().optional().describe('Display name shown on posts'),
};

// Create the MCP server (following OpenAI quickstart pattern)
function createPostPreviewServer(): McpServer {
    const server = new McpServer({
        name: 'postpreview',
        version: '0.1.0',
    });

    // Register the widget as a resource
    server.registerResource(
        'postpreview-widget',
        'ui://widget/postpreview.html',
        {},
        async () => ({
            contents: [
                {
                    uri: 'ui://widget/postpreview.html',
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
                'openai/outputTemplate': 'ui://widget/postpreview.html',
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
                // Image file received from ChatGPT
            }

            const result: RenderInstagramPostOutput = renderInstagramPost(input);

            return {
                content: [{ type: 'text' as const, text: 'Rendered Instagram post preview!' }],
                structuredContent: { ...result } as Record<string, unknown>,
            };
        }
    );

    // Register render_x_thread tool
    server.registerTool(
        'render_x_thread',
        {
            title: 'Render X/Twitter Thread Preview',
            description: 'Split long-form content into a Twitter/X thread and show a visual preview. Use this tool when the user wants to create a Twitter thread, split a blog post or article into tweets, or preview how their content will look as a thread on X.',
            inputSchema: renderXThreadInputSchema,
            _meta: {
                'openai/outputTemplate': 'ui://widget/postpreview.html',
                'openai/toolInvocation/invoking': 'Creating thread preview...',
                'openai/toolInvocation/invoked': 'Thread preview ready!',
                'openai/widgetAccessible': true,
            },
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: false,
            },
        },
        async (args) => {
            const input = {
                content: args.content as string,
                username: (args.username as string) || '@username',
                displayName: (args.displayName as string) || 'Thread Author',
            };

            // Return structured content for the widget
            return {
                content: [{ type: 'text' as const, text: `Thread preview with ${input.content.length} characters of content` }],
                structuredContent: {
                    platform: 'x',
                    thread: {
                        content: input.content,
                        username: input.username,
                        displayName: input.displayName,
                    },
                } as Record<string, unknown>,
            };
        }
    );

    // Register render_multiplatform_post tool (combined Instagram + X thread)
    server.registerTool(
        'render_multiplatform_post',
        {
            title: 'Render Both Instagram Post and X Thread Preview',
            description: 'Create BOTH an Instagram post AND a Twitter/X thread from content and show them in a single widget with tabs. Use this tool when the user wants previews for MULTIPLE platforms at once (e.g., "create an Instagram post and Twitter thread").',
            inputSchema: renderMultiplatformInputSchema,
            _meta: {
                'openai/outputTemplate': 'ui://widget/postpreview.html',
                'openai/toolInvocation/invoking': 'Creating multi-platform preview...',
                'openai/toolInvocation/invoked': 'Multi-platform preview ready!',
                'openai/widgetAccessible': true,
                'openai/fileParams': ['image'],
            },
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: false,
            },
        },
        async (args) => {
            const imageArg = args.image as { download_url: string; file_id: string } | undefined;
            const resolvedImageUrl = imageArg?.download_url || (args.imageUrl as string | undefined);

            const caption = args.caption as string;
            const threadContent = (args.threadContent as string) || caption;
            const username = (args.username as string) || '@username';
            const displayName = (args.displayName as string) || 'Preview';

            return {
                content: [{ type: 'text' as const, text: 'Multi-platform preview created!' }],
                structuredContent: {
                    platform: 'both',
                    post: {
                        caption: caption,
                        imageUrl: resolvedImageUrl,
                        username: username,
                        likes: 0,
                        isVerified: false,
                    },
                    thread: {
                        content: threadContent,
                        username: username,
                        displayName: displayName,
                    },
                } as Record<string, unknown>,
            };
        }
    );

    // Register prompts for user guidance when app is selected
    server.registerPrompt(
        'instagram_preview',
        {
            title: 'Create Instagram Post',
            description: 'Generate an Instagram caption with preview',
            argsSchema: {
                content: z.string().describe('Describe your photo or topic for the Instagram post'),
            },
        },
        async (args) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Create an Instagram caption for: ${args.content}`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        'x_thread',
        {
            title: 'Create Twitter Thread',
            description: 'Turn content into a Twitter/X thread with preview',
            argsSchema: {
                content: z.string().describe('The content to turn into a thread'),
            },
        },
        async (args) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Turn this into a Twitter thread: ${args.content}`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        'multiplatform',
        {
            title: 'Create for Both Platforms',
            description: 'Create Instagram post AND Twitter thread together',
            argsSchema: {
                content: z.string().describe('Content for both platforms'),
            },
        },
        async (args) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Create both an Instagram post AND Twitter thread for: ${args.content}`,
                    },
                },
            ],
        })
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
    console.log('   - ui://widget/postpreview.html');
    console.log('\nTools:');
    console.log('   - render_instagram_post: Preview Instagram posts');
    console.log('   - render_x_thread: Split content into X/Twitter threads');
    console.log('   - render_multiplatform_post: Preview both Instagram + X thread');
    console.log('\nPrompts:');
    console.log('   - instagram_preview: Create Instagram Post');
    console.log('   - x_thread: Create Twitter Thread');
    console.log('   - multiplatform: Create for Both Platforms\n');
});
