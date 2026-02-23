import { useState, useEffect, useCallback } from 'react';

const API = '/api';

export function useConfessions() {
    const [confessions, setConfessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activity, setActivity] = useState({ bookmarks: [], drafts: [], myConfessions: [] });

    const fetchConfessions = useCallback(async (filters = {}, silent = false) => {
        try {
            if (!silent) setLoading(true);
            const params = new URLSearchParams(filters).toString();
            const res = await fetch(`${API}/confessions?${params}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load confessions');
            const data = await res.json();
            setConfessions(data);
        } catch (e) {
            console.error('fetchConfessions:', e.message);
            setConfessions([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch(`${API}/user`, { credentials: 'include' });
            if (!res.ok) { setUser(null); return; }
            const data = await res.json();
            setUser(data);
        } catch (e) {
            setUser(null);
        }
    }, []);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await fetch(`${API}/user/activity`, { credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();
            setActivity(data);
        } catch (e) {
            console.error('fetchActivity:', e.message);
        }
    }, []);

    useEffect(() => {
        fetchConfessions();
        fetchUser();
    }, [fetchConfessions, fetchUser]);

    useEffect(() => {
        if (user) {
            fetchActivity();
        }
    }, [user, fetchActivity]);

    const postConfession = async (payload) => {
        const res = await fetch(`${API}/confessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }
        await fetchConfessions();
        await fetchActivity();
    };

    const reactToConfession = async (id, emoji) => {
        const res = await fetch(`${API}/confessions/${id}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ emoji }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Reaction failed');
        }
        await fetchConfessions({}, true);
    };

    const toggleBookmark = async (id) => {
        const res = await fetch(`${API}/user/bookmarks/${id}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Bookmark failed');
        await fetchActivity();
    };

    const saveDraft = async (payload) => {
        const res = await fetch(`${API}/user/drafts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Draft save failed');
        await fetchActivity();
    };

    const postComment = async (confessionId, payload) => {
        const res = await fetch(`${API}/confessions/${confessionId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Comment failed');
        await fetchConfessions({}, true);
    };

    const voteOnPoll = async (id, optionIndex) => {
        const res = await fetch(`${API}/confessions/${id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ optionIndex }),
        });
        if (!res.ok) throw new Error('Vote failed');
        await fetchConfessions({}, true);
    };

    const regenerateIdentity = async () => {
        const res = await fetch(`${API}/user/regenerate-identity`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to regenerate');
        const data = await res.json();
        setUser(data);
    };

    return {
        confessions,
        loading,
        user,
        activity,
        postConfession,
        reactToConfession,
        toggleBookmark,
        saveDraft,
        postComment,
        voteOnPoll,
        regenerateIdentity,
        refresh: fetchConfessions,
    };
}
