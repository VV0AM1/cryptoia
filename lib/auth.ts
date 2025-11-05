import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { User as UserModel } from "@/models/User";

interface DecodedOtp extends jwt.JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Custom OTP Provider
    CredentialsProvider({
      name: "OTP Login",
      credentials: {
        email: { label: "Email", type: "email" },
        otpToken: { label: "OTP Token", type: "text" },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const otpToken = credentials?.otpToken;

        if (!email || !otpToken) {
          console.error("Missing email or otpToken");
          return null;
        }

        try {
          // 🧩 Decode and verify the token that was generated in /api/verify-otp
          const decoded = jwt.verify(
            otpToken,
            process.env.JWT_SECRET!
          ) as DecodedOtp;

          if (!decoded || decoded.email !== email) {
            console.error("Token invalid or email mismatch:", decoded);
            return null;
          }

          await connectToDatabase();

          const user = await UserModel.findOne({ email });
          if (!user) {
            console.error("No user found for email:", email);
            return null;
          }

          // ✅ Return user info that NextAuth will serialize into the session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
          };
        } catch (err) {
          console.error("OTP token verification failed:", err);
          return null;
        }
      },
    }),
  ],

  // ✅ Handle Google + Credentials sessions
  callbacks: {
    async signIn({ user, account }) {
      await connectToDatabase();

      // Google sign-in logic
      if (account?.provider === "google") {
        const existing = await UserModel.findOne({ email: user.email });

        if (!existing) {
          const isAdmin = user.email?.toLowerCase() === "serleb2000@gmail.com";
          await UserModel.create({
            name: user.name || "Google User",
            email: user.email,
            provider: "google",
            isVerified: true,
            role: isAdmin ? "admin" : "user",
          });
        } else {
          existing.provider = "google";
          existing.isVerified = true;
          await existing.save();
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      // 🧩 Merge user data into token
      if (user) {
        token.role = user.role;
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);