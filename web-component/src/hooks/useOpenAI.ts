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
 * Follows the official OpenAI quickstart pattern:
 * - Reads initial data from window.openai.toolOutput
 * - Listens for openai:set_globals event for updates
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
            // Running inside ChatGPT - get initial data
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
    }, []);

    // Listen for openai:set_globals event (per OpenAI quickstart)
    useEffect(() => {
        const handleSetGlobals = (event: CustomEvent) => {
            const globals = event.detail?.globals;

            if (globals?.toolOutput) {
                setToolOutput(globals.toolOutput);
            }
            if (globals?.theme) {
                setTheme(globals.theme);
            }
            if (globals?.displayMode) {
                setDisplayMode(globals.displayMode);
            }
        };

        window.addEventListener('openai:set_globals', handleSetGlobals as EventListener, { passive: true });

        return () => {
            window.removeEventListener('openai:set_globals', handleSetGlobals as EventListener);
        };
    }, []);

    // Apply theme to document
    useEffect(() => {
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
