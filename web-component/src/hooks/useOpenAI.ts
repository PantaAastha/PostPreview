import { useState, useEffect } from 'react';
import type { OpenAIToolOutput, OpenAITheme, OpenAIDisplayMode } from '../types/openai';

interface UseOpenAIResult {
    toolOutput: OpenAIToolOutput | null;
    theme: OpenAITheme;
    displayMode: OpenAIDisplayMode;
    isLoaded: boolean;
    requestFullscreen: () => void;
    openExternal: (url: string) => void;
}

/**
 * Hook to interface with the OpenAI Apps SDK
 * Provides access to tool output, theme, and host helpers
 */
export function useOpenAI(): UseOpenAIResult {
    const [isLoaded, setIsLoaded] = useState(false);
    const [toolOutput, setToolOutput] = useState<OpenAIToolOutput | null>(null);
    const [theme, setTheme] = useState<OpenAITheme>('light');
    const [displayMode, setDisplayMode] = useState<OpenAIDisplayMode>('compact');

    useEffect(() => {
        // Check if running inside ChatGPT (window.openai exists)
        const openai = window.openai;

        if (openai) {
            // Running inside ChatGPT
            if (openai.toolOutput) {
                setToolOutput(openai.toolOutput);
            }
            if (openai.theme) {
                setTheme(openai.theme);
            }
            if (openai.displayMode) {
                setDisplayMode(openai.displayMode);
            }
            setIsLoaded(true);
        } else {
            // Running in dev mode - use mock data
            console.log('[PostPreview] Running in dev mode with mock data');
            setToolOutput({
                success: true,
                post: {
                    caption: "Starting the day right with a perfect cup of coffee ☕️ There's something magical about that first sip in the morning. What's your go-to coffee order? #CoffeeLover #MorningVibes #CafeLife",
                    imageUrl: null,
                    username: '@yourname',
                    likes: 142,
                    isVerified: false,
                    timestamp: 'Just now',
                },
                message: 'Instagram post preview ready',
            });
            setIsLoaded(true);
        }

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const requestFullscreen = () => {
        if (window.openai?.requestDisplayMode) {
            window.openai.requestDisplayMode('fullscreen');
        }
    };

    const openExternal = (url: string) => {
        if (window.openai?.openExternal) {
            window.openai.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return {
        toolOutput,
        theme,
        displayMode,
        isLoaded,
        requestFullscreen,
        openExternal,
    };
}
