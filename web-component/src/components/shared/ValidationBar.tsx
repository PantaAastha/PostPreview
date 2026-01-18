import type { ValidationStatus } from '../../types/openai';
import { getStatusIcon, formatCharCount } from '../../utils/validation';
import './ValidationBar.css';

interface ValidationItem {
    label: string;
    current: number;
    max: number;
    status: ValidationStatus;
    showWarningAt?: number; // Optional threshold to show warning text
}

interface ValidationBarProps {
    items: ValidationItem[];
    overallStatus: ValidationStatus;
}

/**
 * Reusable validation bar component displaying character counts and status indicators
 */
export function ValidationBar({ items, overallStatus }: ValidationBarProps) {
    return (
        <div className={`validation-bar validation-bar--${overallStatus}`}>
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

            {overallStatus !== 'valid' && (
                <div className="validation-message">
                    {overallStatus === 'error' && 'Post exceeds limits'}
                    {overallStatus === 'warning' && 'Review before posting'}
                </div>
            )}
        </div>
    );
}
