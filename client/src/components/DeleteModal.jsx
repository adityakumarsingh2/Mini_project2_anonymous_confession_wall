import { useState } from 'react';
import styles from './Modal.module.css';

export default function DeleteModal({ confession, onDelete, onClose }) {
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);

    const handleDelete = async () => {
        if (code.length < 4) return;
        setBusy(true);
        await onDelete(confession._id, code);
        setBusy(false);
    };

    return (
        <div className="overlay fade-in" onClick={onClose}>
            <div className={`glass modal slide-up ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.deleteIcon}>🗑️</div>
                <h3 className={styles.title}>Delete Confession?</h3>
                <p className={styles.sub}>This action cannot be undone.</p>

                <div className={styles.preview}>"{confession.text.slice(0, 80)}{confession.text.length > 80 ? '…' : ''}"</div>

                <div className={styles.codeRow}>
                    <span>🔐</span>
                    <input
                        type="password"
                        placeholder="Enter your secret code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>

                <div className={styles.actions}>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={busy || code.length < 4}>
                        {busy ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
