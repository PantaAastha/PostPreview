import './XThreadValidationBar.css';
import { splitIntoThread, type ThreadSplitResult } from '../../utils';

interface XThreadValidationBarProps {
    content: string;
}

/**
 * Validation bar for X Thread metrics
 */
export function XThreadValidationBar({ content }: XThreadValidationBarProps) {
    const result: ThreadSplitResult = splitIntoThread(content);

    // Check if any tweets are over limit
    const overLimitCount = result.tweets.filter((t) => t.charCount > 280).length;
    const tweetStatus = overLimitCount > 0 ? 'error' : 'valid';
    const warningCount = result.warnings.length;
    const warningStatus = warningCount > 0 ? 'warning' : 'valid';

    return (
        <div className="x-validation-bar">
            <div className={`x-validation-item x-validation-item--${tweetStatus === 'valid' ? 'valid' : 'error'}`}>
                <span className="x-validation-label">Tweets</span>
                <span className="x-validation-value">
                    {result.totalTweets}
                    {overLimitCount > 0 && (
                        <span className="x-validation-badge">❌ {overLimitCount} over</span>
                    )}
                </span>
            </div>

            <div className="x-validation-divider" />

            <div className={`x-validation-item x-validation-item--${warningStatus}`}>
                <span className="x-validation-label">Status</span>
                <span className="x-validation-value">
                    {warningCount === 0 ? '✅' : `⚠️ ${warningCount}`}
                </span>
            </div>

            <div className="x-validation-divider" />

            <div className="x-validation-item">
                <span className="x-validation-label">Chars</span>
                <span className="x-validation-value">{content.length.toLocaleString()}</span>
            </div>
        </div>
    );
}
