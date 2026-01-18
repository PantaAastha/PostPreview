import type { InstagramValidation } from '../../types/openai';
import './CaptionAnalysis.css';

interface CaptionAnalysisProps {
    validation: InstagramValidation;
}

/**
 * Displays caption engagement analysis
 */
export function CaptionAnalysis({ validation }: CaptionAnalysisProps) {
    const { caption } = validation;

    // Engagement level colors
    const engagementColors = {
        optimal: '#16a34a', // green
        good: '#2563eb',    // blue
        long: '#ca8a04',    // yellow
    };

    return (
        <div className="caption-analysis">
            {/* Engagement indicator */}
            <div
                className={`engagement-badge engagement-badge--${caption.engagement.level}`}
                data-tooltip={caption.engagement.tip}
            >
                <span
                    className="engagement-dot"
                    style={{ backgroundColor: engagementColors[caption.engagement.level] }}
                />
                <span className="engagement-label">{caption.engagement.label}</span>
            </div>
        </div>
    );
}

