/**
 * Instagram image dimension requirements
 */
export const INSTAGRAM_DIMENSIONS = {
    square: {
        name: 'Square',
        aspectRatio: '1:1',
        width: 1080,
        height: 1080,
        tolerance: 0.02, // 2% tolerance
    },
    portrait: {
        name: 'Portrait',
        aspectRatio: '4:5',
        width: 1080,
        height: 1350,
        tolerance: 0.02,
    },
    landscape: {
        name: 'Landscape',
        aspectRatio: '1.91:1',
        width: 1080,
        height: 566,
        tolerance: 0.02,
    },
} as const;

export type InstagramFormat = keyof typeof INSTAGRAM_DIMENSIONS;

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ValidationResult {
    isValid: boolean;
    detectedFormat: InstagramFormat | null;
    actualAspectRatio: number;
    recommendations: string[];
    suggestedCrop?: {
        format: InstagramFormat;
        targetWidth: number;
        targetHeight: number;
    };
}

/**
 * Detect the closest Instagram format based on aspect ratio
 */
export function detectFormat(dimensions: ImageDimensions): InstagramFormat | null {
    const aspectRatio = dimensions.width / dimensions.height;

    // Check each format
    for (const [format, spec] of Object.entries(INSTAGRAM_DIMENSIONS)) {
        const targetRatio = spec.width / spec.height;
        const diff = Math.abs(aspectRatio - targetRatio) / targetRatio;

        if (diff <= spec.tolerance) {
            return format as InstagramFormat;
        }
    }

    return null;
}

/**
 * Validate image dimensions for Instagram
 */
export function validateImageDimensions(dimensions: ImageDimensions): ValidationResult {
    const aspectRatio = dimensions.width / dimensions.height;
    const detectedFormat = detectFormat(dimensions);

    const recommendations: string[] = [];
    let suggestedCrop: ValidationResult['suggestedCrop'];

    if (detectedFormat) {
        const spec = INSTAGRAM_DIMENSIONS[detectedFormat];

        // Check resolution
        if (dimensions.width < spec.width) {
            recommendations.push(
                `Image width (${dimensions.width}px) is below recommended ${spec.width}px. Consider using a higher resolution image.`
            );
        }

        return {
            isValid: true,
            detectedFormat,
            actualAspectRatio: aspectRatio,
            recommendations,
        };
    }

    // Image doesn't match any format - suggest the closest one
    let closestFormat: InstagramFormat = 'square';
    let smallestDiff = Infinity;

    for (const [format, spec] of Object.entries(INSTAGRAM_DIMENSIONS)) {
        const targetRatio = spec.width / spec.height;
        const diff = Math.abs(aspectRatio - targetRatio);

        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestFormat = format as InstagramFormat;
        }
    }

    const closestSpec = INSTAGRAM_DIMENSIONS[closestFormat];

    recommendations.push(
        `Image aspect ratio (${aspectRatio.toFixed(2)}) doesn't match Instagram's supported formats.`
    );
    recommendations.push(
        `Closest format: ${closestSpec.name} (${closestSpec.aspectRatio}). Consider cropping to ${closestSpec.width}x${closestSpec.height}px.`
    );

    suggestedCrop = {
        format: closestFormat,
        targetWidth: closestSpec.width,
        targetHeight: closestSpec.height,
    };

    return {
        isValid: false,
        detectedFormat: null,
        actualAspectRatio: aspectRatio,
        recommendations,
        suggestedCrop,
    };
}
