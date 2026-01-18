/**
 * Thread Splitter - Intelligently splits long text into tweet-sized chunks
 * 
 * Split priority:
 * 1. Paragraph breaks (double newline)
 * 2. Sentence boundaries (. ! ?)
 * 3. Clause boundaries (, ; :)
 * 4. Word boundaries (space)
 * 5. Hard split (if no other option)
 */

import { X_LIMITS } from './validation';

export interface Tweet {
    text: string;
    number: number;
    totalTweets: number;
    charCount: number;
    isValid: boolean;
}

export interface ThreadSplitResult {
    tweets: Tweet[];
    totalTweets: number;
    originalLength: number;
    warnings: string[];
}

// Regex to match URLs
const URL_REGEX = /https?:\/\/[^\s]+/g;

// Twitter counts URLs as 23 characters
const TWITTER_URL_LENGTH = 23;

/**
 * Calculate the effective character count for Twitter
 * URLs count as 23 characters regardless of actual length
 */
function getTwitterCharCount(text: string): number {
    const urls = text.match(URL_REGEX) || [];
    let count = text.length;

    for (const url of urls) {
        // Subtract actual URL length, add Twitter's 23-char count
        count = count - url.length + TWITTER_URL_LENGTH;
    }

    return count;
}

/**
 * Get the maximum text length for a tweet, accounting for numbering
 */
function getMaxTextLength(totalTweets: number): number {
    if (totalTweets <= 1) {
        return X_LIMITS.TWEET_MAX_CHARS;
    }

    // Reserve space for " 1/N" format
    const numberingLength = ` ${totalTweets}/${totalTweets}`.length;
    return X_LIMITS.TWEET_MAX_CHARS - numberingLength;
}

/**
 * Find the best split point in text, prioritizing natural boundaries
 */
function findSplitPoint(text: string, maxLength: number): number {
    if (text.length <= maxLength) {
        return text.length;
    }

    const searchText = text.substring(0, maxLength);

    // Priority 1: Paragraph break (double newline)
    const paragraphBreak = searchText.lastIndexOf('\n\n');
    if (paragraphBreak > maxLength * 0.5) {
        return paragraphBreak;
    }

    // Priority 2: Single newline
    const lineBreak = searchText.lastIndexOf('\n');
    if (lineBreak > maxLength * 0.5) {
        return lineBreak;
    }

    // Priority 3: Sentence end (. ! ?)
    const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    let bestSentenceEnd = -1;
    for (const ender of sentenceEnders) {
        const pos = searchText.lastIndexOf(ender);
        if (pos > bestSentenceEnd) {
            bestSentenceEnd = pos + ender.length - 1; // Include the punctuation
        }
    }
    if (bestSentenceEnd > maxLength * 0.4) {
        return bestSentenceEnd;
    }

    // Priority 4: Clause boundary (, ; : —)
    const clauseEnders = [', ', '; ', ': ', ' — ', ' - '];
    let bestClauseEnd = -1;
    for (const ender of clauseEnders) {
        const pos = searchText.lastIndexOf(ender);
        if (pos > bestClauseEnd) {
            bestClauseEnd = pos + ender.length - 1;
        }
    }
    if (bestClauseEnd > maxLength * 0.3) {
        return bestClauseEnd;
    }

    // Priority 5: Word boundary (space)
    const lastSpace = searchText.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.2) {
        return lastSpace;
    }

    // Priority 6: Hard split (last resort)
    return maxLength;
}

/**
 * Preserve URLs by ensuring they don't get split
 */
function findSplitPointPreservingUrls(text: string, maxLength: number): number {
    const splitPoint = findSplitPoint(text, maxLength);

    // Check if we're splitting inside a URL
    const urls = [...text.matchAll(new RegExp(URL_REGEX.source, 'g'))];

    for (const match of urls) {
        const urlStart = match.index!;
        const urlEnd = urlStart + match[0].length;

        // If split point is inside a URL, move it before the URL
        if (splitPoint > urlStart && splitPoint < urlEnd) {
            // Try to split before the URL
            if (urlStart > 0) {
                const beforeUrl = text.substring(0, urlStart).trimEnd();
                return beforeUrl.length;
            }
        }
    }

    return splitPoint;
}

/**
 * Split text into tweet-sized chunks
 */
function splitIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
        if (getTwitterCharCount(remaining) <= maxLength) {
            chunks.push(remaining.trim());
            break;
        }

        const splitPoint = findSplitPointPreservingUrls(remaining, maxLength);
        const chunk = remaining.substring(0, splitPoint).trim();
        chunks.push(chunk);

        remaining = remaining.substring(splitPoint).trim();
    }

    return chunks;
}

/**
 * Add numbering to tweets (1/N format)
 */
function addNumbering(chunks: string[], totalTweets: number): string[] {
    if (totalTweets <= 1) {
        return chunks;
    }

    return chunks.map((chunk, index) => {
        return `${chunk} ${index + 1}/${totalTweets}`;
    });
}

/**
 * Main function: Split long text into a Twitter thread
 */
export function splitIntoThread(text: string): ThreadSplitResult {
    const warnings: string[] = [];

    // Handle empty text
    if (!text || text.trim().length === 0) {
        return {
            tweets: [],
            totalTweets: 0,
            originalLength: 0,
            warnings: ['No text provided'],
        };
    }

    const cleanText = text.trim();
    const originalLength = cleanText.length;

    // First pass: split without knowing final count
    let chunks = splitIntoChunks(cleanText, X_LIMITS.TWEET_MAX_CHARS - X_LIMITS.NUMBERING_RESERVE);

    // If only one tweet, no numbering needed
    if (chunks.length === 1 && getTwitterCharCount(chunks[0]) <= X_LIMITS.TWEET_MAX_CHARS) {
        const tweet: Tweet = {
            text: chunks[0],
            number: 1,
            totalTweets: 1,
            charCount: getTwitterCharCount(chunks[0]),
            isValid: true,
        };

        return {
            tweets: [tweet],
            totalTweets: 1,
            originalLength,
            warnings,
        };
    }

    // Second pass: re-split with accurate numbering space
    const totalTweets = chunks.length;
    const maxTextLength = getMaxTextLength(totalTweets);
    chunks = splitIntoChunks(cleanText, maxTextLength);

    // Add numbering
    const numberedChunks = addNumbering(chunks, chunks.length);

    // Build tweet objects
    const tweets: Tweet[] = numberedChunks.map((text, index) => {
        const charCount = getTwitterCharCount(text);
        return {
            text,
            number: index + 1,
            totalTweets: chunks.length,
            charCount,
            isValid: charCount <= X_LIMITS.TWEET_MAX_CHARS,
        };
    });

    // Add warnings
    if (tweets.length > X_LIMITS.THREAD_WARNING_LENGTH) {
        warnings.push(`Thread has ${tweets.length} tweets. Consider shortening for better engagement.`);
    }

    const invalidTweets = tweets.filter(t => !t.isValid);
    if (invalidTweets.length > 0) {
        warnings.push(`${invalidTweets.length} tweet(s) exceed the 280 character limit.`);
    }

    return {
        tweets,
        totalTweets: tweets.length,
        originalLength,
        warnings,
    };
}

/**
 * Analyze the first tweet for hook quality
 */
export function analyzeHook(firstTweet: string): {
    hasQuestion: boolean;
    hasNumber: boolean;
    hasEmoji: boolean;
    startsStrong: boolean;
    feedback: string;
} {
    const hasQuestion = /\?/.test(firstTweet);
    const hasNumber = /\d/.test(firstTweet);
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(firstTweet);

    // Check if starts with a strong word (not "I", "The", "A", etc.)
    const weakStarters = /^(I |The |A |An |This |That |It |My )/i;
    const startsStrong = !weakStarters.test(firstTweet);

    const strengths: string[] = [];
    if (hasQuestion) strengths.push('Asks a question ✓');
    if (hasNumber) strengths.push('Includes a number ✓');
    if (startsStrong) strengths.push('Strong opening ✓');

    const feedback = strengths.length > 0
        ? strengths.join(', ')
        : 'Consider starting with a question or bold statement';

    return {
        hasQuestion,
        hasNumber,
        hasEmoji,
        startsStrong,
        feedback,
    };
}
