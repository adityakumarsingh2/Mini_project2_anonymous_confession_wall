import { useState, useCallback, useMemo } from 'react';
import { useConfessions } from './hooks/useConfessions';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TrendingBar from './components/TrendingBar';
import ConfessionForm from './components/ConfessionForm';
import ConfessionList from './components/ConfessionList';
import EditModal from './components/EditModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import styles from './App.module.css';

let toastId = 0;

export default function App() {
    const {
        confessions,
        loading,
        user,
        activity,
        postConfession,
        reactToConfession,
        toggleBookmark,
        saveDraft,
        postComment,
        voteOnPoll,
        regenerateIdentity,
        refresh
    } = useConfessions();

    const [currentView, setCurrentView] = useState('feed'); // feed, my-posts, drafts, bookmarks
    const [toasts, setToasts] = useState([]);

    const handleRegenerate = async () => {
        try {
            await regenerateIdentity();
            addToast('Identity regenerated! ✨');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // --- Computed List based on View ---
    const filteredList = useMemo(() => {
        if (currentView === 'feed') return confessions;
        if (currentView === 'my-posts') return activity.myConfessions || [];
        if (currentView === 'bookmarks') return activity.bookmarks || [];
        if (currentView === 'drafts') return activity.drafts || [];
        return confessions;
    }, [currentView, confessions, activity]);

    const handlePost = async (payload) => {
        try {
            await postConfession(payload);
            addToast('Secret shared! 🚀');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const handleReact = async (id, emoji) => {
        try {
            await reactToConfession(id, emoji);
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const handleBookmark = async (id) => {
        try {
            await toggleBookmark(id);
            addToast('Saved to bookmarks 🔖');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    return (
        <div className={styles.app}>
            <Navbar user={user} onSearch={(q) => refresh({ search: q })} />

            <main className={styles.main}>
                {/* Hero */}
                <div className={styles.hero}>
                    <h1 className={styles.heroTitle}>
                        <span className="grad-text">Anonymous</span> Confessions
                    </h1>
                    <p className={styles.heroParagraph}>
                        Share your soul. Everyone is listening, but no one knows who you are. 🤫
                    </p>
                </div>

                {/* Left Section */}
                <div className={styles.sidebarSection}>
                    <Sidebar
                        user={user}
                        activity={activity}
                        onNavigate={setCurrentView}
                        onRegenerate={handleRegenerate}
                    />
                </div>

                {/* Middle Section */}
                <div className={styles.feed}>
                    {user && currentView === 'feed' && <ConfessionForm onSubmit={handlePost} onSaveDraft={saveDraft} />}

                    {!user && currentView === 'feed' && (
                        <div className={`glass ${styles.loginPrompt}`}>
                            <span className={styles.loginEmoji}>🔐</span>
                            <h3>Login to Confess</h3>
                            <p>You need to sign in with Google to post. Your identity remains hidden.</p>
                            <a href="/auth/google" className="btn btn-primary">Login with Google</a>
                        </div>
                    )}

                    <ConfessionList
                        confessions={filteredList}
                        loading={loading}
                        user={user}
                        onReact={handleReact}
                        onBookmark={handleBookmark}
                        onPostComment={postComment}
                        onVote={voteOnPoll}
                    />
                </div>

                {/* Right Section */}
                <div className={styles.trendingSection}>
                    <TrendingBar trendingPosts={confessions} />
                </div>
            </main>

            {/* Toasts */}
            <Toast toasts={toasts} remove={removeToast} />
        </div>
    );
}
