import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing widget state that persists across renders within a ChatGPT message.
 * Follows the official OpenAI Apps SDK pattern:
 * - Reads initial state from window.openai.widgetState
 * - Writes updates via window.openai.setWidgetState
 * - Listens for openai:set_globals events for external updates
 *
 * @see https://developers.openai.com/apps-sdk/build/state-management
 */
export function useWidgetState<T>(initializer: () => T): [T, (updater: T | ((prev: T) => T)) => void] {
    // Initialize from OpenAI widget state or fallback to initializer
    const [state, setStateInternal] = useState<T>(() => {
        const openaiState = window.openai?.widgetState as T | undefined;
        if (openaiState !== undefined && openaiState !== null) {
            return openaiState;
        }
        return initializer();
    });

    // Sync with OpenAI widget state on external updates
    useEffect(() => {
        const handleSetGlobals = (event: CustomEvent) => {
            const globals = event.detail?.globals;
            if (globals?.widgetState !== undefined) {
                setStateInternal(globals.widgetState as T);
            }
        };

        window.addEventListener(
            'openai:set_globals',
            handleSetGlobals as EventListener,
            { passive: true }
        );

        return () => {
            window.removeEventListener(
                'openai:set_globals',
                handleSetGlobals as EventListener
            );
        };
    }, []);

    // Wrapper that also persists to OpenAI
    const setState = useCallback((updater: T | ((prev: T) => T)) => {
        setStateInternal((prev) => {
            const next = typeof updater === 'function'
                ? (updater as (prev: T) => T)(prev)
                : updater;

            // Persist to OpenAI widget state (async in background)
            if (window.openai?.setWidgetState) {
                window.openai.setWidgetState(next as Record<string, unknown>);
            }

            return next;
        });
    }, []);

    return [state, setState];
}
