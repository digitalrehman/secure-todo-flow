
const { Auth } = require("@auth/express");
const { MongoDBAdapter } = require("@auth/mongodb-adapter");
const { getMongoClient } = require("./config/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

/**
 * Auth.js configuration
 */
const authConfig = {
  adapter: MongoDBAdapter(getMongoClient().then(client => client.db())),
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Find user by email
        const user = await User.findOne({ email: credentials.email });
        
        // Check if user exists and password matches
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            phoneNumber: user.phoneNumber || null
          };
        }
        
        // Authentication failed
        return null;
      }
    },
    {
      id: "google",
      name: "Google",
      type: "oauth",
      wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile" } },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          isEmailVerified: true
        };
      }
    }
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Pass user data to the token
      if (user) {
        token.id = user.id;
        token.isEmailVerified = user.isEmailVerified;
        token.isPhoneVerified = user.isPhoneVerified;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass token data to the session
      if (token) {
        session.user.id = token.id;
        session.user.isEmailVerified = token.isEmailVerified;
        session.user.isPhoneVerified = token.isPhoneVerified;
        session.user.phoneNumber = token.phoneNumber;
      }
      return session;
    }
  },
  secret: process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

module.exports = { Auth, authConfig };
