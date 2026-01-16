interface PostImageProps {
    imageUrl: string | null;
    alt: string;
}

export function PostImage({ imageUrl, alt }: PostImageProps) {
    if (!imageUrl) {
        return (
            <div className="post-image-container">
                <div className="placeholder-image">
                    <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>No image provided</span>
                    <span style={{ fontSize: '12px' }}>
                        Use an image URL for the full preview experience
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="post-image-container">
            <img
                src={imageUrl}
                alt={alt}
                className="post-image"
                onError={(e) => {
                    // Replace with placeholder on error
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
            <div class="placeholder-image">
              <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="3" x2="21" y2="21" />
              </svg>
              <span>Image failed to load</span>
            </div>
          `;
                }}
            />
        </div>
    );
}
