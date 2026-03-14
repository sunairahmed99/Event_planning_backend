import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../Models/UserSchmea.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.Googleclientid,
      clientSecret: process.env.Googleclientsecret,
      callbackURL: 'https://mern1-theta.vercel.app/user/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email but no googleId
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.isGoogleUser = true;
          if (!user.image && profile.photos && profile.photos.length > 0) {
            user.image = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user if doesn't exist
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          isGoogleUser: true,
          image: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          verifyuser: true, // Google accounts are verified
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

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

export default passport;
