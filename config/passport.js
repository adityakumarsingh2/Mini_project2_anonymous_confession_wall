const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

const ADJECTIVES = ['Silent', 'Brave', 'Hidden', 'Mystic', 'Quiet', 'Wandering', 'Secret', 'Lonesome', 'Ancient', 'Golden'];
const NOUNS = ['Soul', 'Heart', 'Shadow', 'Echo', 'Whisper', 'Spirit', 'Dreamer', 'Voyager', 'Phantom', 'Oracle'];

function generateAnonName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
}

function generateAnonAvatar() {
    // Using DiceBear for modern, reliable avatars
    return `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${Math.random().toString(36).substring(7)}`;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName || profile.name?.givenName + ' ' + (profile.name?.familyName || '') || 'Anonymous',
                    picture: profile.photos[0].value,
                    anonName: generateAnonName(),
                    anonAvatar: generateAnonAvatar()
                });
                await user.save();
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
