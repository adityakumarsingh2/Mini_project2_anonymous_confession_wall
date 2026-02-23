import { useState } from 'react';
import CommentSection from './CommentSection';
import styles from './ConfessionCard.module.css';

const DEFAULT_REACTIONS = ['❤️', '😂', '😢', '🔥', '😮'];

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function ConfessionCard({ confession, user, onReact, onBookmark, onPostComment, onVote }) {
    const [showComments, setShowComments] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const reactionsMap = confession.reactions || {};

    // Sort and get top reactions
    const sortedReactions = Object.entries(reactionsMap)
        .filter(([_, users]) => users.length > 0)
        .sort((a, b) => b[1].length - a[1].length);

    const topReactions = sortedReactions.slice(0, 3);

    const getUserReaction = () => {
        if (!user) return null;
        for (const [emoji, users] of Object.entries(reactionsMap)) {
            if (users.includes(user._id)) return emoji;
        }
        return null;
    };

    const currentReaction = getUserReaction();

    const handleVote = async (optionIndex) => {
        if (!user || !onVote) return;
        await onVote(confession._id, optionIndex);
    };

    const toggleReaction = (emoji) => {
        onReact(confession._id, emoji);
        setShowEmojiPicker(false);
    };

    return (
        <article className={`glass ${styles.card} slide-up`}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarWrapper}>
                        <img src={confession.anonAvatar} alt="Anon" className={styles.avatar} />
                    </div>
                    <div className={styles.userMeta}>
                        <h4 className={styles.anonName}>{confession.anonName}</h4>
                        <span className={styles.time}>{timeAgo(confession.createdAt)}</span>
                    </div>
                </div>
                <div className={`${styles.moodTag} mood-${confession.mood?.toLowerCase().replace(/ /g, '-')}`}>
                    {confession.mood}
                </div>
            </div>

            <p className={styles.text}>{confession.text}</p>

            {confession.poll?.options?.length > 0 && (
                <div className={styles.poll}>
                    <p className={styles.pollQuestion}>{confession.poll.question}</p>
                    <div className={styles.pollGrid}>
                        {confession.poll.options.map((opt, i) => {
                            const hasVoted = user && opt.votes.includes(user._id);
                            const totalVotes = confession.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                            const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    className={`${styles.pollOption} ${hasVoted ? styles.voted : ''}`}
                                    onClick={() => handleVote(i)}
                                    disabled={!user}
                                >
                                    <div className={styles.pollBg} style={{ width: `${percent}%` }} />
                                    <span className={styles.optText}>{opt.text}</span>
                                    <span className={styles.optPercent}>{percent}%</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <div className={styles.engagement}>
                    <div className={styles.reactionContainer}>
                        {topReactions.map(([emoji, users]) => (
                            <button
                                key={emoji}
                                type="button"
                                className={`${styles.miniReact} ${currentReaction === emoji ? styles.activeReact : ''}`}
                                onClick={() => toggleReaction(emoji)}
                                disabled={!user}
                            >
                                {emoji} <span className={styles.miniCount}>{users.length}</span>
                            </button>
                        ))}

                        <div className={styles.pickerWrapper}>
                            <button
                                className={styles.addReact}
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                disabled={!user}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                            </button>

                            {showEmojiPicker && (
                                <div className={`glass ${styles.pickerPopup}`}>
                                    {DEFAULT_REACTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => toggleReaction(emoji)}
                                            className={styles.pickerEmoji}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button className={styles.commentToggle} type="button" onClick={() => setShowComments(!showComments)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span className={styles.statCount}>{confession.commentCount || 0}</span>
                    </button>
                </div>

                <div className={styles.actions}>
                    <button
                        className={`${styles.actionBtn} ${user?.bookmarks?.includes(confession._id) ? styles.bookmarked : ''}`}
                        type="button"
                        onClick={() => onBookmark(confession._id)}
                        disabled={!user}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                    <button className={styles.actionBtn} type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className={styles.commentSection}>
                    <CommentSection
                        confessionId={confession._id}
                        user={user}
                        onPostComment={onPostComment}
                    />
                </div>
            )}
        </article>
    );
}
