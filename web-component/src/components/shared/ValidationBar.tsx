import type { ValidationStatus, CaptionEngagement } from '../../types/openai';
import { getStatusIcon, formatCharCount } from '../../utils/validation';
import './ValidationBar.css';

interface ValidationItem {
    label: string;
    current: number;
    max: number;
    status: ValidationStatus;
}

interface ValidationBarProps {
    items: ValidationItem[];
    overallStatus: ValidationStatus;
    /** Optional engagement badge to display */
    engagement?: CaptionEngagement;
}

/**
 * Validation bar with character counts, status indicators, and optional engagement badge
 */
export function ValidationBar({ items, overallStatus, engagement }: ValidationBarProps) {
    const engagementColors = {
        optimal: '#16a34a',
        good: '#2563eb',
        long: '#ca8a04',
    };

    return (
        <div className={`validation-bar validation-bar--${overallStatus}`}>
            <div className="validation-row">
                <div className="validation-items">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`validation-item validation-item--${item.status}`}
                        >
                            <span className="validation-icon">
                                {getStatusIcon(item.status)}
                            </span>
                            <span className="validation-label">{item.label}</span>
                            <span className="validation-count">
                                {formatCharCount(item.current, item.max)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Engagement badge */}
                {engagement && (
                    <div
                        className={`engagement-badge engagement-badge--${engagement.level}`}
                        data-tooltip={engagement.tip}
                    >
                        <span
                            className="engagement-dot"
                            style={{ backgroundColor: engagementColors[engagement.level] }}
                        />
                        <span className="engagement-label">{engagement.label}</span>
                    </div>
                )}
            </div>

            {overallStatus !== 'valid' && (
                <div className="validation-message">
                    {overallStatus === 'error' && 'Post exceeds limits'}
                    {overallStatus === 'warning' && 'Review before posting'}
                </div>
            )}
        </div>
    );
}
