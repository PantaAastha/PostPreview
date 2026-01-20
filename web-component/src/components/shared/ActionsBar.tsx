import { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import './ActionsBar.css';

interface ActionsBarProps {
    caption: string;
}

/**
 * Actions bar with copy buttons at bottom of widget
 */
export function ActionsBar({ caption }: ActionsBarProps) {
    const [copiedFull, setCopiedFull] = useState(false);
    const [copiedNoTags, setCopiedNoTags] = useState(false);

    // Remove hashtags from caption
    const captionWithoutHashtags = caption
        .replace(/#\w+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const handleCopyFull = async () => {
        await copyToClipboard(caption);
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
    };

    const handleCopyNoHashtags = async () => {
        await copyToClipboard(captionWithoutHashtags);
        setCopiedNoTags(true);
        setTimeout(() => setCopiedNoTags(false), 2000);
    };

    return (
        <div className="actions-bar">
            <button
                className={`actions-bar-btn ${copiedFull ? 'actions-bar-btn--copied' : ''}`}
                onClick={handleCopyFull}
                type="button"
            >
                {copiedFull ? '✓ Copied!' : '📋 Copy Caption'}
            </button>
            <button
                className={`actions-bar-btn actions-bar-btn--secondary ${copiedNoTags ? 'actions-bar-btn--copied' : ''}`}
                onClick={handleCopyNoHashtags}
                type="button"
            >
                {copiedNoTags ? '✓ Copied!' : '📋 No Hashtags'}
            </button>
        </div>
    );
}
