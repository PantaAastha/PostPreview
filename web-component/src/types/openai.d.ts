/**
 * Type definitions for the OpenAI Apps SDK
 * These types describe the window.openai interface injected by ChatGPT
 */

// =============================================================================
// Platform Types
// =============================================================================

export type PlatformType = 'instagram' | 'x';

// =============================================================================
// Instagram Types
// =============================================================================

export interface InstagramPost {
    caption: string;
    imageUrl: string | null;
    username: string;
    likes: number;
    isVerified: boolean;
    timestamp: string;
}

// =============================================================================
// X (Twitter) Thread Types
// =============================================================================

export interface Tweet {
    index: number;
    text: string;
    charCount: number;
    isValid: boolean;
    isFirstTweet: boolean;
}

export interface HookAnalysis {
    startsWithQuestion: boolean;
    startsWithNumber: boolean;
    hasEmoji: boolean;
    isStrong: boolean;
    suggestion?: string;
}

export interface ThreadValidation {
    allTweetsValid: boolean;
    totalTweets: number;
    warnings: string[];
    hookAnalysis?: HookAnalysis;
}

export interface XThread {
    tweets: Tweet[];
    totalTweets: number;
    imageUrl?: string;
    authorHandle: string;
    validation: ThreadValidation;
}

// =============================================================================
// Validation Types
// =============================================================================

export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface ValidationResult {
    status: ValidationStatus;
    message?: string;
}

export interface InstagramValidation {
    caption: {
        charCount: number;
        maxChars: number;
        isValid: boolean;
        status: ValidationStatus;
    };
    hashtags: {
        count: number;
        optimal: number;
        status: ValidationStatus;
        tags: string[];
    };
    mentions: string[];
    overallStatus: ValidationStatus;
}

// =============================================================================
// Tool Output Types (discriminated union for multi-platform)
// =============================================================================

export interface InstagramToolOutput {
    success: boolean;
    platform: 'instagram';
    post: InstagramPost;
    message?: string;
}

export interface XThreadToolOutput {
    success: boolean;
    platform: 'x';
    thread: XThread;
    message?: string;
}

/** Legacy format for backwards compatibility */
export interface LegacyToolOutput {
    success?: boolean;
    post?: InstagramPost;
    message?: string;
}

export type OpenAIToolOutput = InstagramToolOutput | XThreadToolOutput | LegacyToolOutput;

// =============================================================================
// Widget State Types
// =============================================================================

export interface PostPreviewWidgetState {
    activePlatform: PlatformType;
    // Future: expandedTweetIndex, selectedHashtags, etc.
}

export interface OpenAIWidgetState {
    [key: string]: unknown;
}

// =============================================================================
// OpenAI SDK Interface
// =============================================================================

export type OpenAIDisplayMode = 'compact' | 'fullscreen';
export type OpenAITheme = 'light' | 'dark';

export interface OpenAIInterface {
    /** The parsed output from the last tool call */
    toolOutput?: OpenAIToolOutput;

    /** The raw input passed to the tool */
    toolInput?: Record<string, unknown>;

    /** Current display mode of the widget */
    displayMode?: OpenAIDisplayMode;

    /** Current theme from the host (ChatGPT) */
    theme?: OpenAITheme;

    /** Persistent state across renders within a message */
    widgetState?: OpenAIWidgetState;

    /** Set widget state for persistence */
    setWidgetState?: (state: OpenAIWidgetState) => void;

    /** Call another MCP tool from the widget */
    callTool?: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;

    /** Request a display mode change */
    requestDisplayMode?: (mode: OpenAIDisplayMode) => void;

    /** Open an external URL */
    openExternal?: (url: string) => void;

    /** Send a follow-up message to the conversation */
    sendFollowUpMessage?: (message: string) => void;
}

declare global {
    interface Window {
        openai?: OpenAIInterface;
    }
}
