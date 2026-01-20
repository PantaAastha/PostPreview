import { useState, useEffect } from 'react';
import {
    loadImageDimensions,
    validateImageDimensions,
    getLoadingState,
    getErrorState,
    type ImageValidationResult,
} from '../../utils/imageValidation';
import './IssuesPanel.css';

interface Issue {
    type: 'error' | 'warning' | 'info';
    message: string;
}

interface IssuesPanelProps {
    imageUrl: string | null;
    captionStatus: 'valid' | 'warning' | 'error';
    captionMessage?: string;
    hashtagStatus: 'valid' | 'warning' | 'error';
    hashtagMessage?: string;
}

/**
 * Issues Panel - Shows validation status and warnings at top of widget
 */
export function IssuesPanel({
    imageUrl,
    captionStatus,
    captionMessage,
    hashtagStatus,
    hashtagMessage,
}: IssuesPanelProps) {
    const [imageValidation, setImageValidation] = useState<ImageValidationResult>(getLoadingState());
    const [issues, setIssues] = useState<Issue[]>([]);

    // Load and validate image
    useEffect(() => {
        if (!imageUrl) {
            setImageValidation(getErrorState('No image'));
            return;
        }

        setImageValidation(getLoadingState());
        loadImageDimensions(imageUrl)
            .then((dimensions) => {
                setImageValidation(validateImageDimensions(dimensions));
            })
            .catch(() => {
                setImageValidation(getErrorState('Could not analyze image'));
            });
    }, [imageUrl]);

    // Collect all issues
    useEffect(() => {
        const newIssues: Issue[] = [];

        // Image issues
        if (imageUrl && !imageValidation.isLoading && !imageValidation.error) {
            if (imageValidation.aspectRatio?.status !== 'valid') {
                newIssues.push({
                    type: 'warning',
                    message: imageValidation.aspectRatio?.message || 'Aspect ratio may cause cropping',
                });
            }
            if (imageValidation.resolution?.status === 'error') {
                newIssues.push({
                    type: 'error',
                    message: imageValidation.resolution.message,
                });
            } else if (imageValidation.resolution?.status === 'warning') {
                newIssues.push({
                    type: 'warning',
                    message: imageValidation.resolution.message,
                });
            }
        }

        // Caption issues
        if (captionStatus === 'error') {
            newIssues.push({
                type: 'error',
                message: captionMessage || 'Caption exceeds limit',
            });
        } else if (captionStatus === 'warning') {
            newIssues.push({
                type: 'warning',
                message: captionMessage || 'Caption is getting long',
            });
        }

        // Hashtag issues
        if (hashtagStatus === 'error') {
            newIssues.push({
                type: 'error',
                message: hashtagMessage || 'Too many hashtags',
            });
        } else if (hashtagStatus === 'warning') {
            newIssues.push({
                type: 'warning',
                message: hashtagMessage || 'Many hashtags used',
            });
        }

        setIssues(newIssues);
    }, [imageValidation, imageUrl, captionStatus, captionMessage, hashtagStatus, hashtagMessage]);

    const hasErrors = issues.some((i) => i.type === 'error');
    const isReady = issues.length === 0 && !imageValidation.isLoading;

    // Don't show panel if still loading image
    if (imageUrl && imageValidation.isLoading) {
        return (
            <div className="issues-panel issues-panel--loading">
                <span className="issues-panel-icon">⏳</span>
                <span className="issues-panel-status">Analyzing...</span>
            </div>
        );
    }

    // All good - show success
    if (isReady) {
        return (
            <div className="issues-panel issues-panel--success">
                <span className="issues-panel-icon">✅</span>
                <span className="issues-panel-status">Ready to post</span>
            </div>
        );
    }

    // Has issues
    return (
        <div className={`issues-panel ${hasErrors ? 'issues-panel--error' : 'issues-panel--warning'}`}>
            <div className="issues-panel-header">
                <span className="issues-panel-icon">{hasErrors ? '❌' : '⚠️'}</span>
                <span className="issues-panel-status">
                    {hasErrors ? 'Issues detected' : 'Warnings'}
                </span>
            </div>
            <ul className="issues-panel-list">
                {issues.map((issue, index) => (
                    <li key={index} className={`issues-panel-item issues-panel-item--${issue.type}`}>
                        {issue.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}
