import passport from "passport";
import { getDateTime, setRtokenCookie } from "../utils/utils.js";
import { createAccessToken, createRefereshToken } from "../controllers/authController.js";
import express from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// import GoogleStrategy from "passport-google-oidc";
import db from "../db.js";
const router = express.Router();
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_REDIRECT_URI, // e.g. http://localhost:3000/auth/google/callback
            scope: ["openid", "profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            try {
                const image = profile.photos?.[0]?.value || null;
                const email = profile.emails[0].value;
                const fristName = profile.name.givenName;
                const lastName = profile.name.familyName;
                // Check if user exists
                const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
                    email,
                ]);
                let userId;
                if (rows.length > 0) {
                    userId = rows[0].id;
                } else {
                    // Create new user
                    const [result] = await db.query(
                        "INSERT INTO users (firstName, lastName, email, password, isVerified, createdAt,image,role) VALUES (?,?,?,?,?, ?,?,?)",
                        [fristName, lastName, email, null, 1, getDateTime(), image,'learner']
                    );
                    userId = result.insertId;
                }
                // Issue tokens
                const payload = { email, fristName, lastName, role: 'learner', id: userId }
                const { refreshtoken, tokenId } = await createRefereshToken(payload)
                const accessToken = createAccessToken(payload, tokenId)
                done(null, { accessToken, refreshtoken, userId, email });
            } catch (err) {
                done(err, null);
            }
        }
    )
);



router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,   // 🚀 disable session here
    })
);
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" , session: false, }),
    (req, res) => {
        const { accessToken, refreshtoken,userId } = req.user;
        
        // Store refresh token in HttpOnly cookie
        setRtokenCookie(res, refreshtoken)
        // Send user back to frontend with access token
        res.redirect(
            `${process.env.FRONTEND_ORIGIN}/google-success?user=${userId}`
        );
    }
);

export default router;