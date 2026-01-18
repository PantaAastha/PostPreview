import type { PlatformType } from '../../types/openai';
import './PlatformSelector.css';

interface PlatformSelectorProps {
    currentPlatform: PlatformType;
    onPlatformChange: (platform: PlatformType) => void;
    /** Disable switching (when viewing a specific platform from tool output) */
    disabled?: boolean;
}

/**
 * Toggle between Instagram and X (Twitter) platforms
 */
export function PlatformSelector({
    currentPlatform,
    onPlatformChange,
    disabled = false
}: PlatformSelectorProps) {
    return (
        <div className={`platform-selector ${disabled ? 'platform-selector--disabled' : ''}`}>
            <button
                className={`platform-tab ${currentPlatform === 'instagram' ? 'platform-tab--active' : ''}`}
                onClick={() => onPlatformChange('instagram')}
                disabled={disabled}
                type="button"
            >
                <span className="platform-icon">📷</span>
                <span className="platform-name">Instagram</span>
            </button>

            <button
                className={`platform-tab ${currentPlatform === 'x' ? 'platform-tab--active' : ''}`}
                onClick={() => onPlatformChange('x')}
                disabled={disabled}
                type="button"
            >
                <span className="platform-icon">𝕏</span>
                <span className="platform-name">X / Twitter</span>
            </button>
        </div>
    );
}
