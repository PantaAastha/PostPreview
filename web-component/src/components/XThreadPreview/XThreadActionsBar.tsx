import { useState } from 'react';
import { copyToClipboard, splitIntoThread } from '../../utils';
import './XThreadActionsBar.css';

interface XThreadActionsBarProps {
    content: string;
}

/**
 * Actions bar for X Thread with copy buttons
 */
export function XThreadActionsBar({ content }: XThreadActionsBarProps) {
    const [copiedThread, setCopiedThread] = useState(false);
    const [copiedFirst, setCopiedFirst] = useState(false);

    const result = splitIntoThread(content);

    const handleCopyThread = async () => {
        const fullThread = result.tweets
            .map((t) => t.text.replace(/ \d+\/\d+$/, ''))
            .join('\n\n---\n\n');
        await copyToClipboard(fullThread);
        setCopiedThread(true);
        setTimeout(() => setCopiedThread(false), 2000);
    };

    const handleCopyFirst = async () => {
        if (result.tweets.length > 0) {
            const firstTweet = result.tweets[0].text.replace(/ \d+\/\d+$/, '');
            await copyToClipboard(firstTweet);
            setCopiedFirst(true);
            setTimeout(() => setCopiedFirst(false), 2000);
        }
    };

    return (
        <div className="x-actions-bar">
            <button
                className={`x-actions-bar-btn ${copiedThread ? 'x-actions-bar-btn--copied' : ''}`}
                onClick={handleCopyThread}
                type="button"
            >
                {copiedThread ? '✓ Copied!' : `📋 Copy Thread (${result.totalTweets})`}
            </button>
            <button
                className={`x-actions-bar-btn x-actions-bar-btn--secondary ${copiedFirst ? 'x-actions-bar-btn--copied' : ''}`}
                onClick={handleCopyFirst}
                type="button"
            >
                {copiedFirst ? '✓ Copied!' : '📋 First Tweet'}
            </button>
        </div>
    );
}
