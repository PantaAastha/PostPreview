import { z } from 'zod';
import { validateImageDimensions, INSTAGRAM_DIMENSIONS } from '../utils/imageDimensions.js';

/**
 * Tool: validate_image
 * 
 * Check image dimensions against Instagram requirements.
 * Use when a user uploads an image for social media and wants to
 * verify it meets platform specifications.
 */

export const validateImageSchema = z.object({
    imageUrl: z.string().optional().describe('URL of the image (for reference)'),
    width: z.number().int().positive().describe('Width of the image in pixels'),
    height: z.number().int().positive().describe('Height of the image in pixels'),
});

export type ValidateImageInput = z.infer<typeof validateImageSchema>;

export interface ValidateImageOutput {
    success: boolean;
    validation: {
        isValid: boolean;
        detectedFormat: string | null;
        actualAspectRatio: string;
        dimensions: {
            width: number;
            height: number;
        };
    };
    recommendations: string[];
    suggestedCrop?: {
        format: string;
        targetWidth: number;
        targetHeight: number;
    };
    platformRequirements: {
        square: { aspectRatio: string; recommended: string };
        portrait: { aspectRatio: string; recommended: string };
        landscape: { aspectRatio: string; recommended: string };
    };
}

export function validateImage(input: ValidateImageInput): ValidateImageOutput {
    const { width, height } = input;

    const result = validateImageDimensions({ width, height });

    return {
        success: true,
        validation: {
            isValid: result.isValid,
            detectedFormat: result.detectedFormat,
            actualAspectRatio: result.actualAspectRatio.toFixed(2),
            dimensions: { width, height },
        },
        recommendations: result.recommendations,
        suggestedCrop: result.suggestedCrop,
        platformRequirements: {
            square: {
                aspectRatio: INSTAGRAM_DIMENSIONS.square.aspectRatio,
                recommended: `${INSTAGRAM_DIMENSIONS.square.width}x${INSTAGRAM_DIMENSIONS.square.height}px`,
            },
            portrait: {
                aspectRatio: INSTAGRAM_DIMENSIONS.portrait.aspectRatio,
                recommended: `${INSTAGRAM_DIMENSIONS.portrait.width}x${INSTAGRAM_DIMENSIONS.portrait.height}px`,
            },
            landscape: {
                aspectRatio: INSTAGRAM_DIMENSIONS.landscape.aspectRatio,
                recommended: `${INSTAGRAM_DIMENSIONS.landscape.width}x${INSTAGRAM_DIMENSIONS.landscape.height}px`,
            },
        },
    };
}

export const validateImageToolDefinition = {
    name: 'validate_image',
    description: 'Check image dimensions against Instagram requirements. Use this tool when a user uploads an image for social media or asks about image sizing for Instagram. Returns whether the image dimensions are valid and provides recommendations for cropping if needed.',
    inputSchema: {
        type: 'object' as const,
        properties: {
            imageUrl: {
                type: 'string',
                description: 'URL of the image (for reference)',
            },
            width: {
                type: 'number',
                description: 'Width of the image in pixels',
            },
            height: {
                type: 'number',
                description: 'Height of the image in pixels',
            },
        },
        required: ['width', 'height'],
    },
};
