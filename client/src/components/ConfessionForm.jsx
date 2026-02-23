import { useState } from 'react';
import styles from './ConfessionForm.module.css';

const MAX = 1000;
const MOODS = ['Study', 'Relationship', 'Family', 'Friends', 'Feelings', 'Personal Thoughts', 'Career', 'Mental Health', 'College', 'Others'];

export default function ConfessionForm({ onSubmit, onSaveDraft }) {
    const [text, setText] = useState('');
    const [mood, setMood] = useState('Others');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [allowComments, setAllowComments] = useState(true);
    const [pollEnabled, setPollEnabled] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (text.trim().length < 5) return;

        setBusy(true);
        const payload = {
            text: text.trim(),
            mood,
            isAnonymous,
            allowComments,
        };

        if (pollEnabled) {
            payload.poll = {
                question: 'Vote on this!',
                options: pollOptions.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: [] }))
            };
        }

        await onSubmit(payload);
        setText('');
        setPollEnabled(false);
        setPollOptions(['', '']);
        setBusy(false);
    };

    const handleAddOption = () => {
        if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
    };

    const addEmoji = (e) => {
        setText(prev => (prev + e).slice(0, MAX));
    };

    return (
        <form className={`glass ${styles.form} slide-up`} onSubmit={handleSubmit}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2 className={styles.title}>Spill a Secret</h2>
                    <div className={styles.moodWrapper}>
                        <select value={mood} onChange={(e) => setMood(e.target.value)} className={styles.moodSelect}>
                            {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <div className={`${styles.counter} ${text.length > MAX * 0.9 ? styles.warn : ''}`}>
                    <span className={styles.count}>{MAX - text.length}</span>
                    <span className={styles.countLabel}>characters left</span>
                </div>
            </div>

            <div className={styles.inputWrapper}>
                <textarea
                    placeholder="What's going on? Be honest, it's anonymous... 🤫"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX))}
                    rows={6}
                    className={styles.textarea}
                    required
                />
                <div className={styles.emojiPicker}>
                    {['✨', '🔥', '❤️', '😂', '😢', '😮', '💀', '💯'].map(e => (
                        <button key={e} type="button" onClick={() => addEmoji(e)} className={styles.emojiBtn}>
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {pollEnabled && (
                <div className={styles.pollCreator}>
                    <p className={styles.pollLabel}>Anonymous Poll</p>
                    <div className={styles.pollOptions}>
                        {pollOptions.map((opt, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...pollOptions];
                                    newOpts[i] = e.target.value;
                                    setPollOptions(newOpts);
                                }}
                                className={styles.pollInput}
                            />
                        ))}
                    </div>
                    {pollOptions.length < 5 && (
                        <button type="button" onClick={handleAddOption} className={styles.addOption}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Option
                        </button>
                    )}
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.toggles}>
                    <label className={`${styles.toggle} ${pollEnabled ? styles.toggleActive : ''}`}>
                        <input type="checkbox" checked={pollEnabled} onChange={(e) => setPollEnabled(e.target.checked)} />
                        <span className={styles.toggleIcon}>📊</span>
                        <span className={styles.toggleText}>Poll</span>
                    </label>
                    <label className={`${styles.toggle} ${allowComments ? styles.toggleActive : ''}`}>
                        <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                        <span className={styles.toggleIcon}>💬</span>
                        <span className={styles.toggleText}>Comments</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => onSaveDraft({ text, mood })}
                        className="btn btn-ghost"
                        disabled={!text.trim()}
                    >
                        Save Draft
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={busy || text.trim().length < 5}>
                        {busy ? 'Spilling...' : 'Post Secret 🚀'}
                    </button>
                </div>
            </div>
        </form>
    );
}
