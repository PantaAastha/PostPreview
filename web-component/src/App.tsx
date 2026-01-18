import { useOpenAI } from './hooks/useOpenAI';
import { useWidgetState } from './hooks/useWidgetState';
import { InstagramPreview } from './components/InstagramPreview/InstagramPreview';
import { ValidationBar, ExportBar, PlatformSelector } from './components/shared';
import { validateInstagramCaption, INSTAGRAM_LIMITS } from './utils/validation';
import type { InstagramPost, PlatformType, PostPreviewWidgetState } from './types/openai';
import './App.css';

/**
 * Helper to detect platform from tool output
 */
function detectPlatform(toolOutput: unknown): PlatformType | null {
    if (!toolOutput || typeof toolOutput !== 'object') return null;
    const output = toolOutput as Record<string, unknown>;

    if (output.platform === 'instagram') return 'instagram';
    if (output.platform === 'x') return 'x';

    // Legacy format (assume Instagram)
    if (output.post) return 'instagram';

    return null;
}

/**
 * Helper to extract Instagram post from tool output
 */
function getInstagramPost(toolOutput: unknown): InstagramPost | null {
    if (!toolOutput || typeof toolOutput !== 'object') return null;

    const output = toolOutput as Record<string, unknown>;

    // New format: { platform: 'instagram', post: {...} }
    if (output.platform === 'instagram' && output.post) {
        return output.post as InstagramPost;
    }

    // Legacy format: { post: {...} }
    if (output.post && typeof output.post === 'object') {
        return output.post as InstagramPost;
    }

    return null;
}

/**
 * Instagram content view with validation and export
 */
function InstagramContent({ post, displayMode }: { post: InstagramPost; displayMode: string }) {
    const validation = validateInstagramCaption(post.caption);

    const validationItems = [
        {
            label: 'Caption',
            current: validation.caption.charCount,
            max: validation.caption.maxChars,
            status: validation.caption.status,
        },
        {
            label: 'Hashtags',
            current: validation.hashtags.count,
            max: INSTAGRAM_LIMITS.HASHTAG_OPTIMAL,
            status: validation.hashtags.status,
        },
    ];

    return (
        <>
            <ValidationBar
                items={validationItems}
                overallStatus={validation.overallStatus}
                engagement={validation.caption.engagement}
            />
            <InstagramPreview
                caption={post.caption}
                imageUrl={post.imageUrl}
                username={post.username}
                likes={post.likes}
                isVerified={post.isVerified}
                timestamp={post.timestamp}
                displayMode={displayMode as 'compact' | 'fullscreen'}
            />
            <ExportBar caption={post.caption} />
        </>
    );
}

/**
 * Placeholder for X Thread content (Phase 4)
 */
function XThreadContent() {
    return (
        <div className="coming-soon">
            <span className="coming-soon-icon">🚧</span>
            <p>X Thread Builder coming soon!</p>
            <p className="coming-soon-hint">Use the Instagram preview for now</p>
        </div>
    );
}

function App() {
    const { toolOutput, isLoaded, displayMode } = useOpenAI();

    // Persistent widget state for platform selection
    const [widgetState, setWidgetState] = useWidgetState<PostPreviewWidgetState>(() => ({
        activePlatform: 'instagram',
    }));

    // Detect platform from tool output (takes precedence over widget state)
    const detectedPlatform = detectPlatform(toolOutput);
    const currentPlatform = detectedPlatform || widgetState.activePlatform;

    // Platform change handler
    const handlePlatformChange = (platform: PlatformType) => {
        setWidgetState({ ...widgetState, activePlatform: platform });
    };

    if (!isLoaded) {
        return (
            <div className="loading">
                <p>Loading preview...</p>
            </div>
        );
    }

    // Get content based on platform
    const instagramPost = getInstagramPost(toolOutput);

    return (
        <div className="postpreview-app">
            {/* Platform Toggle */}
            <PlatformSelector
                currentPlatform={currentPlatform}
                onPlatformChange={handlePlatformChange}
                disabled={!!detectedPlatform} // Disable if platform is from tool output
            />

            {/* Platform-specific content */}
            {currentPlatform === 'instagram' && instagramPost && (
                <InstagramContent post={instagramPost} displayMode={displayMode} />
            )}

            {currentPlatform === 'instagram' && !instagramPost && (
                <div className="error">
                    <p>No Instagram post data available</p>
                </div>
            )}

            {currentPlatform === 'x' && (
                <XThreadContent />
            )}
        </div>
    );
}

export default App;
