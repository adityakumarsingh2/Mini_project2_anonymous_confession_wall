import { useMemo, useState } from 'react';
import ConfessionCard from './ConfessionCard';
import styles from './ConfessionList.module.css';

function SkeletonCard() {
    return (
        <div className={`glass ${styles.skeleton}`}>
            <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 16, width: '60%' }} />
        </div>
    );
}

export default function ConfessionList({ confessions, loading, user, onReact, onBookmark, onPostComment, onVote }) {
    if (loading) {
        return (
            <div className={styles.grid}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (confessions.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>🤫</div>
                <h3>Silence...</h3>
                <p>No confessions found in this view. Be the first to break the silence.</p>
            </div>
        );
    }

    return (
        <section className={styles.container}>
            <div className={styles.grid}>
                {confessions.map((c) => (
                    <ConfessionCard
                        key={c._id}
                        confession={c}
                        user={user}
                        onReact={onReact}
                        onBookmark={onBookmark}
                        onPostComment={onPostComment}
                        onVote={onVote}
                    />
                ))}
            </div>
        </section>
    );
}
