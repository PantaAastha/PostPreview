/**
 * Instagram Image Validation Utility
 * Checks aspect ratio, resolution, and provides recommendations
 */

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ImageValidationResult {
    isLoading: boolean;
    error: string | null;
    dimensions: ImageDimensions | null;
    aspectRatio: {
        status: 'valid' | 'warning';
        ratio: string;
        message: string;
    } | null;
    resolution: {
        status: 'valid' | 'warning' | 'error';
        message: string;
    } | null;
}

// Instagram recommended aspect ratios
const VALID_ASPECT_RATIOS = [
    { name: '1:1', min: 0.95, max: 1.05 },      // Square
    { name: '4:5', min: 0.75, max: 0.85 },      // Portrait
    { name: '1.91:1', min: 1.85, max: 2.0 },    // Landscape
];

// Instagram minimum recommended resolution
const MIN_RESOLUTION = 1080;
const OPTIMAL_RESOLUTION = 1080;

/**
 * Get the closest valid aspect ratio name for a given ratio
 */
function getAspectRatioName(ratio: number): { name: string; isValid: boolean } {
    for (const validRatio of VALID_ASPECT_RATIOS) {
        if (ratio >= validRatio.min && ratio <= validRatio.max) {
            return { name: validRatio.name, isValid: true };
        }
    }

    // Return approximate ratio
    if (ratio > 1) {
        return { name: `${ratio.toFixed(2)}:1`, isValid: false };
    } else {
        return { name: `1:${(1 / ratio).toFixed(2)}`, isValid: false };
    }
}

/**
 * Load image and get dimensions
 */
export function loadImageDimensions(url: string): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Validate image dimensions against Instagram requirements
 */
export function validateImageDimensions(dimensions: ImageDimensions): ImageValidationResult {
    const { width, height } = dimensions;
    const ratio = width / height;

    // Check aspect ratio
    const aspectInfo = getAspectRatioName(ratio);
    const aspectRatio = {
        status: aspectInfo.isValid ? 'valid' as const : 'warning' as const,
        ratio: aspectInfo.name,
        message: aspectInfo.isValid
            ? `Aspect ratio ${aspectInfo.name} is optimal for Instagram`
            : `Aspect ratio ${aspectInfo.name} may be cropped. Use 1:1, 4:5, or 1.91:1`,
    };

    // Check resolution
    const minDimension = Math.min(width, height);
    let resolution: ImageValidationResult['resolution'];

    if (minDimension >= OPTIMAL_RESOLUTION) {
        resolution = {
            status: 'valid',
            message: `${width}×${height} — High quality`,
        };
    } else if (minDimension >= 600) {
        resolution = {
            status: 'warning',
            message: `${width}×${height} — Consider ${MIN_RESOLUTION}×${MIN_RESOLUTION} for best quality`,
        };
    } else {
        resolution = {
            status: 'error',
            message: `${width}×${height} — Too small, may appear pixelated`,
        };
    }

    return {
        isLoading: false,
        error: null,
        dimensions,
        aspectRatio,
        resolution,
    };
}

/**
 * Initial loading state
 */
export function getLoadingState(): ImageValidationResult {
    return {
        isLoading: true,
        error: null,
        dimensions: null,
        aspectRatio: null,
        resolution: null,
    };
}

/**
 * Error state
 */
export function getErrorState(message: string): ImageValidationResult {
    return {
        isLoading: false,
        error: message,
        dimensions: null,
        aspectRatio: null,
        resolution: null,
    };
}
