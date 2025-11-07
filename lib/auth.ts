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
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
    CredentialsProvider({
      name: "OTP Login",
      credentials: {
        email: { label: "Email", type: "email" },
        otpToken: { label: "OTP Token", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const otpToken = credentials?.otpToken;
        if (!email || !otpToken) return null;

        try {
          const decoded = jwt.verify(otpToken, process.env.JWT_SECRET!) as DecodedOtp;
          if (!decoded || decoded.email !== email) return null;

          await connectToDatabase();
          const user = await UserModel.findOne({ email });
          if (!user) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await connectToDatabase();

      if (account?.provider === "google") {
        if (!user.email) return false;

        const existing = await UserModel.findOne({ email: user.email });
        if (!existing) {
          const isAdmin = user.email.toLowerCase() === "serleb2000@gmail.com";
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
      if (user) {
        token.role = (user as any).role;
        token.sub = (user as any).id;
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

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

export default NextAuth(authOptions);
