import './XThreadIssuesPanel.css';
import { splitIntoThread, analyzeHook, type ThreadSplitResult } from '../../utils';

interface XThreadIssuesPanelProps {
    content: string;
}

interface Issue {
    type: 'error' | 'warning' | 'info';
    message: string;
}

/**
 * Issues Panel for X Thread - Shows validation status and warnings at top
 */
export function XThreadIssuesPanel({ content }: XThreadIssuesPanelProps) {
    const result: ThreadSplitResult = splitIntoThread(content);
    const hookAnalysis = result.tweets.length > 0 ? analyzeHook(result.tweets[0].text) : null;

    const issues: Issue[] = [];

    // Check for warnings from thread splitter
    result.warnings.forEach((warning) => {
        issues.push({ type: 'warning', message: warning });
    });

    // Check hook quality - startsStrong indicates good hook
    if (hookAnalysis && !hookAnalysis.startsStrong && !hookAnalysis.hasQuestion && !hookAnalysis.hasNumber) {
        issues.push({
            type: 'info',
            message: 'Consider a stronger opening hook (question, number, or bold statement)',
        });
    }

    // Check if thread is very long
    if (result.totalTweets > 15) {
        issues.push({
            type: 'warning',
            message: `Long thread (${result.totalTweets} tweets) — consider breaking into multiple threads`,
        });
    }

    const hasErrors = issues.some((i) => i.type === 'error');
    const hasWarnings = issues.some((i) => i.type === 'warning');
    const isReady = issues.length === 0;

    // All good
    if (isReady) {
        const hookGood = hookAnalysis?.startsStrong || hookAnalysis?.hasQuestion || hookAnalysis?.hasNumber;
        const hookMsg = hookGood ? ' with strong hook' : '';
        return (
            <div className="x-issues-panel x-issues-panel--success">
                <span className="x-issues-panel-icon">✅</span>
                <span className="x-issues-panel-status">
                    Ready to post{hookMsg}
                </span>
            </div>
        );
    }

    // Has issues
    return (
        <div className={`x-issues-panel ${hasErrors ? 'x-issues-panel--error' : hasWarnings ? 'x-issues-panel--warning' : 'x-issues-panel--info'}`}>
            <div className="x-issues-panel-header">
                <span className="x-issues-panel-icon">{hasErrors ? '❌' : hasWarnings ? '⚠️' : '💡'}</span>
                <span className="x-issues-panel-status">
                    {hasErrors ? 'Issues detected' : hasWarnings ? 'Warnings' : 'Suggestions'}
                </span>
            </div>
            <ul className="x-issues-panel-list">
                {issues.map((issue, index) => (
                    <li key={index} className={`x-issues-panel-item x-issues-panel-item--${issue.type}`}>
                        {issue.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}
