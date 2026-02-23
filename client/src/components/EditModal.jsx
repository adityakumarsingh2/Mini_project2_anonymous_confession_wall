import { useState } from 'react';
import styles from './Modal.module.css';

export default function EditModal({ confession, onSave, onClose }) {
    const [text, setText] = useState(confession.text);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSave = async () => {
        if (!text.trim() || code.length < 4) return;
        setBusy(true);
        await onSave(confession._id, text.trim(), code);
        setBusy(false);
    };

    return (
        <div className="overlay fade-in" onClick={onClose}>
            <div className={`glass modal slide-up ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>✏️ Edit Confession</h3>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className={styles.textarea}
                />

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
                    <button className="btn btn-primary" onClick={handleSave} disabled={busy || code.length < 4}>
                        {busy ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
