interface ProfileHeaderProps {
    username: string;
    isVerified: boolean;
}

export function ProfileHeader({ username, isVerified }: ProfileHeaderProps) {
    // Get first letter for avatar
    const avatarLetter = username.replace('@', '').charAt(0).toUpperCase();

    return (
        <header className="profile-header">
            <div className="avatar">{avatarLetter}</div>

            <div className="profile-info">
                <span className="username">
                    {username}
                    {isVerified && (
                        <span className="verified-badge" title="Verified">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        </span>
                    )}
                </span>
            </div>

            <button className="more-options" aria-label="More options">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="6" cy="12" r="1.5" />
                    <circle cx="18" cy="12" r="1.5" />
                </svg>
            </button>
        </header>
    );
}
