import { useOpenAI } from './hooks/useOpenAI';
import { InstagramPreview } from './components/InstagramPreview/InstagramPreview';
import type { InstagramPost } from './types/openai';

/**
 * Helper to extract Instagram post from tool output (handles both legacy and new formats)
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

function App() {
    const { toolOutput, isLoaded, displayMode } = useOpenAI();

    if (!isLoaded) {
        return (
            <div className="loading">
                <p>Loading preview...</p>
            </div>
        );
    }

    const post = getInstagramPost(toolOutput);

    if (!post) {
        return (
            <div className="error">
                <p>No post data available</p>
            </div>
        );
    }

    return (
        <InstagramPreview
            caption={post.caption}
            imageUrl={post.imageUrl}
            username={post.username}
            likes={post.likes}
            isVerified={post.isVerified}
            timestamp={post.timestamp}
            displayMode={displayMode}
        />
    );
}

export default App;
