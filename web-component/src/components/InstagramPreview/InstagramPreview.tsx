import './InstagramPreview.css';
import { ProfileHeader } from './ProfileHeader';
import { PostImage } from './PostImage';
import { EngagementBar } from './EngagementBar';
import { CaptionSection } from './CaptionSection';
import type { OpenAIDisplayMode } from '../../types/openai';

interface InstagramPreviewProps {
    caption: string;
    imageUrl: string | null;
    username: string;
    likes: number;
    isVerified: boolean;
    timestamp: string;
    displayMode: OpenAIDisplayMode;
}

export function InstagramPreview({
    caption,
    imageUrl,
    username,
    likes,
    isVerified,
    timestamp,
    displayMode,
}: InstagramPreviewProps) {
    return (
        <article className="instagram-preview" data-display-mode={displayMode}>
            <ProfileHeader username={username} isVerified={isVerified} />
            <PostImage imageUrl={imageUrl} alt={`Post by ${username}`} />
            <EngagementBar />

            <div className="likes-section">
                <span className="likes-count">
                    {likes.toLocaleString()} {likes === 1 ? 'like' : 'likes'}
                </span>
            </div>

            <CaptionSection username={username} caption={caption} />

            <time className="timestamp">{timestamp}</time>

            <div className="add-comment">
                <button className="emoji-button" aria-label="Add emoji">😊</button>
                <input
                    type="text"
                    className="comment-input"
                    placeholder="Add a comment..."
                    disabled
                />
                <button className="post-button" disabled>Post</button>
            </div>

            <div className="preview-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                Preview Mode — PostPreview
            </div>
        </article>
    );
}
