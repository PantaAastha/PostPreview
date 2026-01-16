import { z } from 'zod';

/**
 * Tool: render_instagram_post
 * 
 * Renders a visual preview of an Instagram post.
 * Use when the user wants to see how their Instagram post will look,
 * create captions, or preview social media content for Instagram.
 */

export const renderInstagramPostSchema = z.object({
    caption: z.string().describe('The caption text for the Instagram post'),
    imageUrl: z.string().url().optional().describe('URL of the image to display in the post. If not provided, a placeholder will be shown.'),
    username: z.string().default('@yourname').describe('The username to display on the post'),
    likes: z.number().int().min(0).default(0).describe('Number of likes to display'),
    isVerified: z.boolean().default(false).describe('Whether to show a verified badge'),
});

export type RenderInstagramPostInput = z.infer<typeof renderInstagramPostSchema>;

export interface RenderInstagramPostOutput {
    success: boolean;
    post: {
        caption: string;
        imageUrl: string | null;
        username: string;
        likes: number;
        isVerified: boolean;
        timestamp: string;
    };
    message: string;
}

export function renderInstagramPost(input: RenderInstagramPostInput): RenderInstagramPostOutput {
    const { caption, imageUrl, username, likes, isVerified } = input;

    return {
        success: true,
        post: {
            caption,
            imageUrl: imageUrl || null,
            username: username.startsWith('@') ? username : `@${username}`,
            likes,
            isVerified,
            timestamp: 'Just now',
        },
        message: `Instagram post preview ready for ${username}`,
    };
}

export const renderInstagramPostToolDefinition = {
    name: 'render_instagram_post',
    description: 'Render a visual preview of an Instagram post. Use this tool when the user wants to see how their Instagram post will look, wants to create or preview captions, or is preparing social media content for Instagram. This displays a realistic Instagram-style preview within ChatGPT.',
    inputSchema: {
        type: 'object' as const,
        properties: {
            caption: {
                type: 'string',
                description: 'The caption text for the Instagram post',
            },
            imageUrl: {
                type: 'string',
                description: 'URL of the image to display in the post. If not provided, a placeholder will be shown.',
            },
            username: {
                type: 'string',
                description: 'The username to display on the post. Defaults to @yourname',
                default: '@yourname',
            },
            likes: {
                type: 'number',
                description: 'Number of likes to display',
                default: 0,
            },
            isVerified: {
                type: 'boolean',
                description: 'Whether to show a verified badge',
                default: false,
            },
        },
        required: ['caption'],
    },
};
