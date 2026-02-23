import styles from './Sidebar.module.css';

export default function Sidebar({ user, activity, currentView, onNavigate, onRegenerate }) {
    if (!user) return <div className={styles.sidebar}>Please login to see profile</div>;

    const navItems = [
        { id: 'feed', label: 'Main Feed', icon: '🏠' },
        { id: 'my-posts', label: 'My Secrets', icon: '📝' },
        { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
        { id: 'drafts', label: 'Drafts', icon: '💾', badge: activity?.drafts?.length }
    ];

    return (
        <aside className={`${styles.sidebar} sticky-top`}>
            <div className={`glass ${styles.profileCard}`}>
                <div className={styles.avatarWrapper}>
                    <img src={user.anonAvatar} alt="avatar" className={styles.avatar} />
                    <button type="button" onClick={onRegenerate} className={styles.cycleBtn} title="Regenerate Identity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    </button>
                </div>
                <div className={styles.info}>
                    <h3 className={styles.anonName}>{user.anonName}</h3>
                    <p className={styles.realName}>
                        {typeof user.name === 'string' ? user.name : (user.name?.displayName || 'User')}
                    </p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>{activity?.myConfessions?.length || 0}</span>
                        <span className={styles.statLab}>Secrets</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>{activity?.bookmarks?.length || 0}</span>
                        <span className={styles.statLab}>Saved</span>
                    </div>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${styles.navItem} ${currentView === item.id ? styles.active : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                        {item.badge > 0 && (
                            <span className={styles.badge}>{item.badge}</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
