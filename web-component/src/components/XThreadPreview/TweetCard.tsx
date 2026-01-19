import { useState } from 'react';
import type { Tweet } from '../../utils/threadSplitter';
import { X_LIMITS, copyToClipboard } from '../../utils';
import './TweetCard.css';

interface TweetCardProps {
    tweet: Tweet;
    username?: string;
    displayName?: string;
    isFirst?: boolean;
    onCopy?: (text: string) => void;
}

/**
 * Individual tweet card component styled like X/Twitter
 */
export function TweetCard({
    tweet,
    username = '@username',
    displayName = 'Display Name',
    isFirst = false,
    onCopy
}: TweetCardProps) {
    const [copied, setCopied] = useState(false);
    const charPercentage = (tweet.charCount / X_LIMITS.TWEET_MAX_CHARS) * 100;
    const isOverLimit = tweet.charCount > X_LIMITS.TWEET_MAX_CHARS;

    // Character indicator color
    const getCharColor = () => {
        if (isOverLimit) return '#f91880'; // X pink/red
        if (charPercentage > 90) return '#ffd400'; // Warning yellow
        return '#1d9bf0'; // X blue
    };

    const handleCopy = async () => {
        // Remove the numbering for individual copy
        const textWithoutNumbering = tweet.text.replace(/ \d+\/\d+$/, '');

        // Use shared copy function, but also call onCopy callback if provided
        await copyToClipboard(textWithoutNumbering);
        if (onCopy) {
            onCopy(textWithoutNumbering);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`tweet-card ${isFirst ? 'tweet-card--first' : ''} ${isOverLimit ? 'tweet-card--invalid' : ''}`}>
            {/* Thread connector line */}
            {!isFirst && <div className="tweet-connector" />}

            <div className="tweet-header">
                {/* Avatar */}
                <div className="tweet-avatar">
                    <div className="tweet-avatar-placeholder">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="tweet-user-info">
                    <span className="tweet-display-name">{displayName}</span>
                    <span className="tweet-username">{username}</span>
                </div>

                {/* Hook badge - before thread number */}
                {isFirst && tweet.totalTweets > 1 && (
                    <span className="tweet-hook-badge">🪝 Hook</span>
                )}

                {/* Tweet number badge */}
                {tweet.totalTweets > 1 && (
                    <span className="tweet-number-badge">
                        {tweet.number}/{tweet.totalTweets}
                    </span>
                )}
            </div>

            <div className="tweet-content">
                {/* Remove numbering from display (it's shown in badge) */}
                {tweet.text.replace(/ \d+\/\d+$/, '')}
            </div>

            <div className="tweet-footer">
                {/* Character count */}
                <div
                    className="tweet-char-count"
                    style={{ color: getCharColor() }}
                >
                    <svg className="tweet-char-circle" viewBox="0 0 20 20">
                        <circle
                            cx="10"
                            cy="10"
                            r="9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${Math.min(charPercentage, 100) * 0.565} 56.5`}
                            transform="rotate(-90 10 10)"
                            opacity={charPercentage > 100 ? 0.3 : 1}
                        />
                        {isOverLimit && (
                            <text x="10" y="14" textAnchor="middle" fontSize="10" fill="currentColor">
                                !
                            </text>
                        )}
                    </svg>
                    <span className="tweet-char-text">
                        {tweet.charCount}
                    </span>
                </div>

                {/* Copy button */}
                {onCopy && (
                    <button
                        className={`tweet-copy-btn ${copied ? 'tweet-copy-btn--copied' : ''}`}
                        onClick={handleCopy}
                        type="button"
                    >
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                )}
            </div>
        </div>
    );
}
