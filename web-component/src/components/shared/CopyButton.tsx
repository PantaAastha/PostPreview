import { useState, useCallback } from 'react';
import './CopyButton.css';

interface CopyButtonProps {
    /** The text to copy to clipboard */
    text: string;
    /** Button label */
    label?: string;
    /** Optional variant for alternate copy (e.g., without hashtags) */
    variant?: 'primary' | 'secondary';
    /** Icon to show (optional) */
    showIcon?: boolean;
}

/**
 * Button that copies text to clipboard with "Copied!" feedback
 */
export function CopyButton({
    text,
    label = 'Copy',
    variant = 'primary',
    showIcon = true
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers or sandboxed environments
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [text]);

    return (
        <button
            className={`copy-button copy-button--${variant} ${copied ? 'copy-button--copied' : ''}`}
            onClick={handleCopy}
            type="button"
        >
            {showIcon && (
                <span className="copy-icon">
                    {copied ? (
                        // Checkmark icon
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        // Copy icon
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    )}
                </span>
            )}
            <span className="copy-label">{copied ? 'Copied!' : label}</span>
        </button>
    );
}
