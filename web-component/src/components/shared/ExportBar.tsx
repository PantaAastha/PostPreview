import { CopyButton } from './CopyButton';
import './ExportBar.css';

interface ExportBarProps {
    caption: string;
}

/**
 * Removes hashtags from text
 */
function removeHashtags(text: string): string {
    return text.replace(/#[\w\u0080-\uFFFF]+\s*/g, '').trim();
}

/**
 * Export bar with copy options for Instagram captions
 */
export function ExportBar({ caption }: ExportBarProps) {
    const captionWithoutHashtags = removeHashtags(caption);
    const hasHashtags = caption !== captionWithoutHashtags;

    return (
        <div className="export-bar">
            <CopyButton
                text={caption}
                label="Copy Caption"
                variant="primary"
            />
            {hasHashtags && (
                <CopyButton
                    text={captionWithoutHashtags}
                    label="Without #"
                    variant="secondary"
                />
            )}
        </div>
    );
}
