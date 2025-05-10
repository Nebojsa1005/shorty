import * as dotenv from "dotenv";

dotenv.config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `http://localhost:4200/api/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails?.[0].value,   
    picture: profile.photos?.[0].value,
  };

  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user); // or just use user.id
});

passport.deserializeUser((obj, done) => {
  console.log(2134, obj);
  
  done(null, obj);
});
