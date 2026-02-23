const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    votes: { type: [String], default: [] } // Array of User IDs
});

const ConfessionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        enum: ['Study', 'Relationship', 'Family', 'Friends', 'Feelings', 'Personal Thoughts', 'Career', 'Mental Health', 'College', 'Others'],
        default: 'Others'
    },
    // Cached anon info from the user at the time of posting
    anonName: String,
    anonAvatar: String,

    isAnonymous: {
        type: Boolean,
        default: true
    },
    allowComments: {
        type: Boolean,
        default: true
    },

    // Reactions: Map of emoji -> [userIds]
    // Using a map allows any emoji and "one reaction per user" logic
    reactions: {
        type: Map,
        of: [String],
        default: new Map()
    },

    poll: {
        question: String,
        options: [PollOptionSchema]
    },

    commentCount: {
        type: Number,
        default: 0
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for engagement score (used for trending)
ConfessionSchema.virtual('engagementScore').get(function () {
    let score = 0;
    // Weights: Reaction (1), Comment (3), Share/Bookmark (todo)
    this.reactions.forEach((users) => score += users.length);
    score += (this.commentCount * 3);

    // Recency decay (very simple)
    const hoursOld = (Date.now() - this.createdAt) / 3600000;
    return score / Math.pow(hoursOld + 2, 1.5);
});

module.exports = mongoose.model('Confession', ConfessionSchema);
