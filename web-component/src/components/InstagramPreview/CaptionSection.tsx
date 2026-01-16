interface CaptionSectionProps {
    username: string;
    caption: string;
}

/**
 * Parse caption to highlight hashtags
 */
function parseCaption(caption: string): React.ReactNode[] {
    const parts = caption.split(/(#\w+)/g);

    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <span key={index} className="hashtag">
                    {part}
                </span>
            );
        }
        return part;
    });
}

export function CaptionSection({ username, caption }: CaptionSectionProps) {
    return (
        <div className="caption-section">
            <p className="caption-text">
                <span className="caption-username">{username}</span>
                {parseCaption(caption)}
            </p>
        </div>
    );
}
