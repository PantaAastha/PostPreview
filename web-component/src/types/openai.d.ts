/**
 * Type definitions for the OpenAI Apps SDK
 * These types describe the window.openai interface injected by ChatGPT
 */

export interface OpenAIToolOutput {
    success?: boolean;
    post?: {
        caption: string;
        imageUrl: string | null;
        username: string;
        likes: number;
        isVerified: boolean;
        timestamp: string;
    };
    message?: string;
}

export interface OpenAIWidgetState {
    [key: string]: unknown;
}

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

    /** Persistent state across tool calls (requires widgetSessionId) */
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
