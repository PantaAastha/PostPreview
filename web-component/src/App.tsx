import { useOpenAI } from './hooks/useOpenAI';
import { useWidgetState } from './hooks/useWidgetState';
import { InstagramPreview } from './components/InstagramPreview/InstagramPreview';
import { XThreadPreview } from './components/XThreadPreview';
import { ValidationBar, ExportBar, PlatformSelector } from './components/shared';
import { validateInstagramCaption, INSTAGRAM_LIMITS } from './utils/validation';
import type { InstagramPost, PlatformType, PostPreviewWidgetState } from './types/openai';
import './App.css';

/**
 * Helper to detect EXPLICIT platform from tool output
 * Only returns platform when explicitly set - legacy format doesn't lock toggle
 */
function detectPlatform(toolOutput: unknown): PlatformType | null {
    if (!toolOutput || typeof toolOutput !== 'object') return null;
    const output = toolOutput as Record<string, unknown>;

    // Only lock to platform when explicitly specified
    if (output.platform === 'instagram') return 'instagram';
    if (output.platform === 'x') return 'x';

    // Legacy format or no platform - don't lock the toggle
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
 * Helper to extract X thread content from tool output
 */
interface XThreadData {
    content: string;
    username?: string;
    displayName?: string;
}

function getXThread(toolOutput: unknown): XThreadData | null {
    if (!toolOutput || typeof toolOutput !== 'object') return null;

    const output = toolOutput as Record<string, unknown>;

    // Format: { platform: 'x', thread: {...} }
    if (output.platform === 'x' && output.thread) {
        return output.thread as XThreadData;
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
 * X Thread content view
 */
function XThreadContent({ thread, displayMode }: { thread: XThreadData | null; displayMode: string }) {
    // If no thread data from tool, show appropriate message
    if (!thread) {
        // Check if we're in ChatGPT (window.openai exists) or local dev
        const isInChatGPT = !!window.openai;

        if (isInChatGPT) {
            // In ChatGPT without thread data - show prompt to use tool
            return (
                <div className="x-thread-empty">
                    <span className="coming-soon-icon">🧵</span>
                    <p>Ask me to create a thread from your content!</p>
                    <p className="coming-soon-hint">Try: "Turn this into a Twitter thread"</p>
                </div>
            );
        }

        // Local dev - show demo
        const demoContent = `This is a demo thread to show how the X Thread Builder works!

The algorithm automatically splits your long text into tweet-sized chunks. It prioritizes natural breaking points like paragraphs, sentences, and clauses.

Here's what makes it smart:
- Preserves URLs intact
- Adds 1/N numbering
- Analyzes your hook quality

Try pasting your own content to see it in action. The thread builder will help you craft engaging Twitter threads that capture attention. 🧵`;

        return (
            <XThreadPreview
                content={demoContent}
                username="@postpreview"
                displayName="PostPreview"
                displayMode={displayMode as 'compact' | 'fullscreen'}
            />
        );
    }

    return (
        <XThreadPreview
            content={thread.content}
            username={thread.username || '@postpreview'}
            displayName={thread.displayName || 'PostPreview'}
            displayMode={displayMode as 'compact' | 'fullscreen'}
        />
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
    // Null-safe access to widgetState.activePlatform with fallback
    const currentPlatform = detectedPlatform || widgetState?.activePlatform || 'instagram';

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
    const xThread = getXThread(toolOutput);

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
                <div className="x-thread-empty">
                    <span className="coming-soon-icon">📸</span>
                    <p>Ask me to create an Instagram post!</p>
                    <p className="coming-soon-hint">Try: "Create an Instagram caption for..."</p>
                </div>
            )}

            {currentPlatform === 'x' && (
                <XThreadContent thread={xThread} displayMode={displayMode} />
            )}
        </div>
    );
}

export default App;
