/**
 * Instagram validation constants and utilities
 */

import type { InstagramValidation, ValidationStatus, CaptionEngagement } from '../types/openai';

// Instagram platform limits
export const INSTAGRAM_LIMITS = {
    CAPTION_MAX_CHARS: 2200,
    CAPTION_OPTIMAL_MIN: 125,
    CAPTION_OPTIMAL_MAX: 150,
    HASHTAG_OPTIMAL: 5,
    HASHTAG_MAX: 30,
} as const;

// Twitter/X platform limits
export const X_LIMITS = {
    TWEET_MAX_CHARS: 280,
    THREAD_WARNING_LENGTH: 10,
    NUMBERING_RESERVE: 6, // " 1/10" = 5 chars + space
} as const;

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u0080-\uFFFF]+/g);
    return matches || [];
}

/**
 * Extract @mentions from text
 */
export function extractMentions(text: string): string[] {
    const matches = text.match(/@[\w]+/g);
    return matches || [];
}

/**
 * Get validation status based on value and thresholds
 */
export function getStatus(
    value: number,
    warningThreshold: number,
    errorThreshold: number,
    isUpperLimit: boolean = true
): ValidationStatus {
    if (isUpperLimit) {
        if (value > errorThreshold) return 'error';
        if (value > warningThreshold) return 'warning';
        return 'valid';
    } else {
        if (value < errorThreshold) return 'error';
        if (value < warningThreshold) return 'warning';
        return 'valid';
    }
}

/**
 * Get caption engagement analysis based on length
 * Research shows 125-150 chars get the best engagement
 */
export function getCaptionEngagement(charCount: number): CaptionEngagement {
    if (charCount <= INSTAGRAM_LIMITS.CAPTION_OPTIMAL_MAX) {
        return {
            level: 'optimal',
            label: 'Optimal length',
            tip: 'Short captions (under 150 chars) get the best engagement',
        };
    } else if (charCount <= 300) {
        return {
            level: 'good',
            label: 'Good length',
            tip: 'Your caption is a good length for engagement',
        };
    } else {
        return {
            level: 'long',
            label: 'Long caption',
            tip: 'Consider shortening for better engagement, or use line breaks',
        };
    }
}

/**
 * Validate an Instagram caption
 */
export function validateInstagramCaption(caption: string): InstagramValidation {
    const charCount = caption.length;
    const hashtags = extractHashtags(caption);
    const mentions = extractMentions(caption);

    // Caption validation
    const captionStatus = getStatus(
        charCount,
        INSTAGRAM_LIMITS.CAPTION_MAX_CHARS * 0.9, // Warning at 90%
        INSTAGRAM_LIMITS.CAPTION_MAX_CHARS,
        true
    );

    // Caption engagement
    const engagement = getCaptionEngagement(charCount);

    // Hashtag validation
    let hashtagStatus: ValidationStatus = 'valid';
    if (hashtags.length > INSTAGRAM_LIMITS.HASHTAG_MAX) {
        hashtagStatus = 'error';
    } else if (hashtags.length > INSTAGRAM_LIMITS.HASHTAG_OPTIMAL) {
        hashtagStatus = 'warning';
    }

    // Overall status (worst of all)
    const statuses = [captionStatus, hashtagStatus];
    let overallStatus: ValidationStatus = 'valid';
    if (statuses.includes('error')) {
        overallStatus = 'error';
    } else if (statuses.includes('warning')) {
        overallStatus = 'warning';
    }

    return {
        caption: {
            charCount,
            maxChars: INSTAGRAM_LIMITS.CAPTION_MAX_CHARS,
            isValid: charCount <= INSTAGRAM_LIMITS.CAPTION_MAX_CHARS,
            status: captionStatus,
            engagement,
        },
        hashtags: {
            count: hashtags.length,
            optimal: INSTAGRAM_LIMITS.HASHTAG_OPTIMAL,
            status: hashtagStatus,
            tags: hashtags,
        },
        mentions,
        overallStatus,
    };
}

/**
 * Validate a single tweet
 */
export function validateTweet(text: string): {
    charCount: number;
    maxChars: number;
    isValid: boolean;
    remaining: number;
} {
    const charCount = text.length;
    return {
        charCount,
        maxChars: X_LIMITS.TWEET_MAX_CHARS,
        isValid: charCount <= X_LIMITS.TWEET_MAX_CHARS,
        remaining: X_LIMITS.TWEET_MAX_CHARS - charCount,
    };
}

/**
 * Get the status icon for a validation status
 */
export function getStatusIcon(status: ValidationStatus): string {
    switch (status) {
        case 'valid':
            return '✅';
        case 'warning':
            return '⚠️';
        case 'error':
            return '❌';
    }
}

/**
 * Format character count display
 */
export function formatCharCount(current: number, max: number): string {
    return `${current.toLocaleString()}/${max.toLocaleString()}`;
}
