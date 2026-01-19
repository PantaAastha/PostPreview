import { useState, useCallback } from 'react';
import { TweetCard } from './TweetCard';
import { splitIntoThread, analyzeHook, copyToClipboard, type ThreadSplitResult } from '../../utils';
import './XThreadPreview.css';

interface XThreadPreviewProps {
    content: string;
    username?: string;
    displayName?: string;
    displayMode?: 'compact' | 'fullscreen';
}

/**
 * X/Twitter thread preview component
 */
export function XThreadPreview({
    content,
    username = '@username',
    displayName = 'Thread Author',
    displayMode = 'compact'
}: XThreadPreviewProps) {
    const [threadCopied, setThreadCopied] = useState(false);

    // Split content into thread
    const threadResult: ThreadSplitResult = splitIntoThread(content);
    const { tweets, totalTweets, warnings } = threadResult;

    // Analyze hook
    const hookAnalysis = totalTweets > 0 ? analyzeHook(tweets[0].text) : null;

    const handleCopyTweet = useCallback(async (text: string) => {
        await copyToClipboard(text);
    }, []);

    const handleCopyAll = useCallback(async () => {
        const fullThread = tweets
            .map(t => t.text.replace(/ \d+\/\d+$/, ''))
            .join('\n\n---\n\n');
        await copyToClipboard(fullThread);
        setThreadCopied(true);
        setTimeout(() => setThreadCopied(false), 2000);
    }, [tweets]);

    if (tweets.length === 0) {
        return (
            <div className="x-thread-empty">
                <p>Enter some text to preview your thread</p>
            </div>
        );
    }

    return (
        <div className={`x-thread-preview x-thread-preview--${displayMode}`}>
            {/* Thread header */}
            <div className="x-thread-header">
                <div className="x-thread-logo">𝕏</div>
                <div className="x-thread-info">
                    <span className="x-thread-count">
                        {totalTweets} {totalTweets === 1 ? 'tweet' : 'tweets'}
                    </span>
                    {hookAnalysis && totalTweets > 1 && (
                        <span
                            className="x-thread-hook-score"
                            title={
                                hookAnalysis.startsStrong || hookAnalysis.hasQuestion
                                    ? `Strong hook! ${hookAnalysis.feedback}`
                                    : 'Tip: Start with a question or bold statement to grab attention'
                            }
                        >
                            Hook: {hookAnalysis.startsStrong || hookAnalysis.hasQuestion ? '✓' : '⚠️'}
                        </span>
                    )}
                </div>
                <button
                    className={`x-thread-copy-all ${threadCopied ? 'x-thread-copy-all--copied' : ''}`}
                    onClick={handleCopyAll}
                    type="button"
                >
                    {threadCopied ? '✓ Copied!' : (totalTweets === 1 ? 'Copy' : 'Copy Thread')}
                </button>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="x-thread-warnings">
                    {warnings.map((warning, index) => (
                        <div key={index} className="x-thread-warning">
                            ⚠️ {warning}
                        </div>
                    ))}
                </div>
            )}

            {/* Tweet list */}
            <div className="x-thread-tweets">
                {tweets.map((tweet, index) => (
                    <TweetCard
                        key={index}
                        tweet={tweet}
                        username={username}
                        displayName={displayName}
                        isFirst={index === 0}
                        onCopy={(text) => handleCopyTweet(text)}
                    />
                ))}
            </div>

            {/* Thread summary footer */}
            <div className="x-thread-footer">
                <span className="x-thread-chars">
                    {threadResult.originalLength.toLocaleString()} characters total
                </span>
            </div>
        </div>
    );
}
