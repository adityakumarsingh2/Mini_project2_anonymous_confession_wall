require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const Confession = require('./models/Confession');

// Passport Config.
require('./config/passport');

const User = require('./models/User');
const Comment = require('./models/Comment');

const app = express();

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/confession_wall')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- Middleware (order matters!) ---
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        secure: false
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Helper: Auth Middleware ---
const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Authentication required' });
};

// --- Auth Routes ---
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: (process.env.CLIENT_ORIGIN || 'http://localhost:5173') + '/?error=auth_failed' }),
    (req, res) => {
        res.redirect(process.env.CLIENT_ORIGIN || 'http://localhost:5173');
    }
);

app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(process.env.CLIENT_ORIGIN || 'http://localhost:5173');
    });
});

// --- User Activity & Auth Routes ---
app.get('/api/user', (req, res) => {
    res.json(req.user || null);
});

app.get('/api/user/activity', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('bookmarks');
        const myConfessions = await Confession.find({ userId: req.user._id });
        res.json({
            bookmarks: user.bookmarks,
            drafts: user.drafts,
            myConfessions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/user/regenerate-identity', isAuth, async (req, res) => {
    try {
        const ADJECTIVES = ['Silent', 'Brave', 'Hidden', 'Mystic', 'Quiet', 'Wandering', 'Secret', 'Lonesome', 'Ancient', 'Golden'];
        const NOUNS = ['Soul', 'Heart', 'Shadow', 'Echo', 'Whisper', 'Spirit', 'Dreamer', 'Voyager', 'Phantom', 'Oracle'];

        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const num = Math.floor(Math.random() * 100);

        const newName = `${adj}${noun}${num}`;
        const newAvatar = `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${Math.random().toString(36).substring(7)}`;

        const user = await User.findByIdAndUpdate(req.user._id, {
            anonName: newName,
            anonAvatar: newAvatar
        }, { new: true });

        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// --- Confession Routes ---

// GET /api/confessions
app.get('/api/confessions', async (req, res) => {
    try {
        const { sort, search, mood } = req.query;
        let query = {};

        if (search) {
            query.text = { $regex: search, $options: 'i' };
        }
        if (mood) {
            query.mood = mood;
        }

        let confessions = await Confession.find(query).sort({ createdAt: -1 });

        // Sorting Logic
        if (sort === 'trending') {
            const now = Date.now();
            confessions = confessions.map(c => {
                const count = (map) => Array.from(map.values()).flat().length;
                const reactionWeight = count(c.reactions || new Map()) * 1;
                const commentWeight = (c.commentCount || 0) * 3;
                const pollWeight = (c.poll?.options?.reduce((acc, o) => acc + o.votes.length, 0) || 0) * 2;

                const ageInHours = (now - new Date(c.createdAt)) / (1000 * 60 * 60);
                const decay = Math.pow(0.9, ageInHours / 2); // Decay every 2 hours

                return { ...c.toObject(), trendScore: (reactionWeight + commentWeight + pollWeight) * decay };
            }).sort((a, b) => b.trendScore - a.trendScore);
        } else if (sort === 'most_liked') {
            confessions = confessions.sort((a, b) => {
                const count = (map) => Array.from(map.values()).flat().length;
                return count(b.reactions || new Map()) - count(a.reactions || new Map());
            });
        }

        res.json(confessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/confessions
app.post('/api/confessions', isAuth, async (req, res) => {
    const { text, mood, isAnonymous, allowComments, poll } = req.body;

    const confession = new Confession({
        text,
        mood,
        isAnonymous,
        allowComments,
        poll,
        userId: req.user._id,
        anonName: req.user.anonName,
        anonAvatar: req.user.anonAvatar
    });

    try {
        const newConfession = await confession.save();
        res.status(201).json(newConfession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/confessions/:id/react
app.post('/api/confessions/:id/react', isAuth, async (req, res) => {
    const { emoji } = req.body;
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) return res.status(404).json({ message: 'Not found' });

        const userId = req.user._id.toString();
        const currentReactions = confession.reactions || new Map();

        // Remove existing reaction by this user if any
        currentReactions.forEach((users, key) => {
            currentReactions.set(key, (users || []).filter(id => id !== userId));
        });

        // Add new reaction
        const users = currentReactions.get(emoji) || [];
        users.push(userId);
        currentReactions.set(emoji, users);

        confession.reactions = currentReactions;
        await confession.save();
        res.json(confession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Poll Voting ---
app.post('/api/confessions/:id/vote', isAuth, async (req, res) => {
    const { optionIndex } = req.body;
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession.poll) return res.status(400).json({ message: 'No poll found' });

        // Remove user's previous votes in this poll
        confession.poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(uid => uid !== req.user._id.toString());
        });

        // Add new vote
        confession.poll.options[optionIndex].votes.push(req.user._id.toString());
        await confession.save();
        res.json(confession);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Comment Routes ---

app.get('/api/confessions/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ confessionId: req.params.id }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/confessions/:id/comments', isAuth, async (req, res) => {
    const { text, parentCommentId } = req.body;
    const comment = new Comment({
        text,
        parentCommentId,
        confessionId: req.params.id,
        userId: req.user._id,
        anonName: req.user.anonName,
        anonAvatar: req.user.anonAvatar
    });

    try {
        const newComment = await comment.save();
        await Confession.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/comments/:id/like
app.post('/api/comments/:id/like', isAuth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user._id.toString();
        const likedIndex = comment.likes.indexOf(userId);

        if (likedIndex > -1) {
            comment.likes.splice(likedIndex, 1);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/comments/:id
app.delete('/api/comments/:id', isAuth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Comment.findByIdAndDelete(req.params.id);
        await Confession.findByIdAndUpdate(comment.confessionId, { $inc: { commentCount: -1 } });
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/comments/:id/report
app.post('/api/comments/:id/report', isAuth, async (req, res) => {
    const { reason } = req.body;
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        comment.reports.push({
            userId: req.user._id,
            reason: reason || 'Inappropriate content',
            createdAt: new Date()
        });

        await comment.save();
        res.json({ message: 'Report submitted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- User Activity Routes (Bookmarks/Drafts) ---

app.post('/api/user/bookmarks/:id', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const index = user.bookmarks.indexOf(req.params.id);
        if (index > -1) {
            user.bookmarks.splice(index, 1); // Toggle off
        } else {
            user.bookmarks.push(req.params.id); // Toggle on
        }
        await user.save();
        res.json(user.bookmarks || []);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/user/drafts', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.drafts.push(req.body);
        await user.save();
        res.json(user.drafts || []);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
