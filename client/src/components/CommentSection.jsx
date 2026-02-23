import { useState, useEffect, useRef } from 'react';
import CommentItem from './CommentItem';
import styles from './CommentSection.module.css';

export default function CommentSection({ confessionId, user, onPostComment }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [viewAll, setViewAll] = useState(false);
    const commentsEndRef = useRef(null);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/confessions/${confessionId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error('fetchComments:', e);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [confessionId]);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            await onPostComment(confessionId, {
                text: text.trim(),
                parentCommentId: replyTo?._id || null
            });
            setText('');
            setReplyTo(null);
            await fetchComments();
            setTimeout(scrollToBottom, 100);
        } catch (e) {
            console.error('handleSubmit comment:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (commentId) => {
        try {
            const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
            if (res.ok) fetchComments();
        } catch (e) { console.error('Like error:', e); }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) fetchComments();
        } catch (e) { console.error('Delete error:', e); }
    };

    const handleReport = async (commentId) => {
        const reason = window.prompt('Reason for reporting?');
        if (!reason) return;
        try {
            const res = await fetch(`/api/comments/${commentId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (res.ok) alert('Report submitted. Thank you for keeping the community safe!');
        } catch (e) { console.error('Report error:', e); }
    };

    const threadComments = () => {
        const root = comments.filter(c => !c.parentCommentId);
        const replies = comments.filter(c => c.parentCommentId);
        return root.map(c => ({
            ...c,
            replies: replies.filter(r => r.parentCommentId === c._id)
        }));
    };

    const threaded = threadComments();
    const displayedComments = viewAll ? threaded : threaded.slice(0, 2);

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                {replyTo && (
                    <div className={styles.replyingTo}>
                        <span>Replying to <strong>{replyTo.anonName}</strong></span>
                        <button type="button" onClick={() => setReplyTo(null)}>✕</button>
                    </div>
                )}
                <div className={styles.inputWrap}>
                    <img src={user?.anonAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} alt="" className={styles.userMiniAvatar} />
                    <input
                        type="text"
                        placeholder={user ? "Write a polite comment..." : "Sign in to join the conversation"}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={!user || loading}
                        className={styles.input}
                    />
                    <button type="submit" disabled={!user || loading || !text.trim()} className={styles.sendBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </form>

            <div className={styles.list}>
                {displayedComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        user={user}
                        onReply={setReplyTo}
                        onLike={handleLike}
                        onDelete={handleDelete}
                        onReport={handleReport}
                    />
                ))}

                {threaded.length > 2 && !viewAll && (
                    <button className={styles.viewMore} onClick={() => setViewAll(true)}>
                        View {threaded.length - 2} more comments
                    </button>
                )}

                <div ref={commentsEndRef} />
            </div>

            {comments.length === 0 && (
                <div className={styles.empty}>No comments yet. Be the first to share your thoughts! ✨</div>
            )}
        </div>
    );
}
