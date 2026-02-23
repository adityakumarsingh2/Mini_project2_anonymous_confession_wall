import { useState } from 'react';
import styles from './CommentSection.module.css';

export default function CommentItem({
    comment,
    user,
    onReply,
    onLike,
    onDelete,
    onReport,
    isReply = false
}) {
    const [isLiking, setIsLiking] = useState(false);
    const hasLiked = user && comment.likes?.includes(user._id);

    const handleLike = async () => {
        if (!user || isLiking) return;
        setIsLiking(true);
        await onLike(comment._id);
        setIsLiking(false);
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div className={`${styles.commentWrapper} ${isReply ? styles.replyWrapper : ''}`}>
            <div className={styles.commentMain}>
                <img src={comment.anonAvatar} alt="" className={isReply ? styles.miniAvatarSmall : styles.miniAvatar} />
                <div className={styles.commentContent}>
                    <div className={styles.commentHeader}>
                        <span className={styles.name}>{comment.anonName}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.time}>{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>

                    <div className={styles.commentActions}>
                        <button
                            className={`${styles.actionLink} ${hasLiked ? styles.liked : ''}`}
                            type="button"
                            onClick={handleLike}
                            disabled={!user}
                        >
                            {hasLiked ? '❤️' : '🤍'} {comment.likes?.length || 0}
                        </button>

                        {!isReply && user && (
                            <button className={styles.actionLink} type="button" onClick={() => onReply(comment)}>
                                Reply
                            </button>
                        )}

                        {user?._id === comment.userId && (
                            <button className={`${styles.actionLink} ${styles.deleteAction}`} type="button" onClick={() => onDelete(comment._id)}>
                                Delete
                            </button>
                        )}

                        {user && user._id !== comment.userId && (
                            <button className={styles.actionLink} type="button" onClick={() => onReport(comment._id)}>
                                Report
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {comment.replies?.length > 0 && !isReply && (
                <div className={styles.nestedReplies}>
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            user={user}
                            onLike={onLike}
                            onDelete={onDelete}
                            onReport={onReport}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
