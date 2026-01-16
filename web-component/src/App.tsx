import { useOpenAI } from './hooks/useOpenAI';
import { InstagramPreview } from './components/InstagramPreview/InstagramPreview';

function App() {
    const { toolOutput, isLoaded, displayMode } = useOpenAI();

    if (!isLoaded) {
        return (
            <div className="loading">
                <p>Loading preview...</p>
            </div>
        );
    }

    if (!toolOutput?.post) {
        return (
            <div className="error">
                <p>No post data available</p>
            </div>
        );
    }

    const { post } = toolOutput;

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
