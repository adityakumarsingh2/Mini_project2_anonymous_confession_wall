const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    // The "Internal" identity (from Google)
    name: String,
    picture: String,

    // The "Anonymous" identity
    anonName: {
        type: String,
        required: true
    },
    anonAvatar: {
        type: String,
        required: true
    },

    // Engagement
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Confession'
    }],
    drafts: [{
        text: String,
        mood: String,
        createdAt: { type: Date, default: Date.now }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
