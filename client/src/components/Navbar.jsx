import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ user, onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.brand}>
                <div className={styles.logoIcon}>🤫</div>
                <span className={`${styles.title} grad-text`}>ConfessIt</span>
            </div>

            <div className={styles.center}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search secrets..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.right}>
                {user ? (
                    <div className={styles.userProfile}>
                        <div className={styles.userInfo}>
                            <img src={user.anonAvatar} alt="avatar" className={styles.avatar} />
                            <span className={styles.name}>{user.anonName}</span>
                        </div>
                        <a href="/auth/logout" className={styles.logoutBtn}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </a>
                    </div>
                ) : (
                    <a href="/auth/google" className="btn btn-primary">Join Now</a>
                )}
            </div>
        </nav>
    );
}
