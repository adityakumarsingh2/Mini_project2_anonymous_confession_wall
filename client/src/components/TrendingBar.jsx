import styles from './TrendingBar.module.css';

const MOODS = ['#Relationship', '#Study', '#College', '#Family', '#Feelings'];

export default function TrendingBar({ trendingPosts }) {
    return (
        <aside className={`${styles.trendingBar} sticky-top`}>
            <div className={`glass ${styles.widget}`}>
                <div className={styles.header}>
                    <h3 className={styles.widgetTitle}>Trending Secrets <span>🔥</span></h3>
                    <button className={styles.viewAll}>View All</button>
                </div>

                <div className={styles.list}>
                    {trendingPosts?.slice(0, 5).map((post, i) => {
                        const reactionCount = Object.values(post.reactions || {}).flat().length;
                        return (
                            <div key={post._id} className={styles.trendingItem}>
                                <div className={styles.rankBadge}>{i + 1}</div>
                                <div className={styles.itemContent}>
                                    <p className={styles.itemText}>{post.text.substring(0, 50)}...</p>
                                    <div className={styles.itemMeta}>
                                        <span className={styles.itemMood}>{post.mood}</span>
                                        {reactionCount > 0 && (
                                            <span className={styles.engagement}>
                                                🔥 {reactionCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {(!trendingPosts || trendingPosts.length === 0) && (
                        <p className={styles.empty}>Quiet night... No trends yet.</p>
                    )}
                </div>
            </div>

            <div className={`glass ${styles.widget}`}>
                <h3 className={styles.widgetTitle}>Popular Topics</h3>
                <div className={styles.topics}>
                    {MOODS.map(mood => (
                        <button key={mood} className={styles.topicTag}>{mood}</button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
