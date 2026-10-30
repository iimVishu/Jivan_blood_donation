import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.trim().toLowerCase() });

        if (!user) {
          return null;
        }

        if (user.provider === "google") {
          throw new Error("Please sign in with Google");
        }
        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        if (profile?.email_verified !== true) return false;
        try {
          await dbConnect();
          if (!user.email) return false;
          const email = user.email.trim().toLowerCase();
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            // If user exists but wasn't verified (e.g. OTP pending), verify them now since Google is trusted
            if (!existingUser.isVerified) {
              existingUser.isVerified = true;
              existingUser.password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
              existingUser.provider = 'google';
              existingUser.otp = undefined;
              existingUser.otpExpiry = undefined;
              await existingUser.save();
            }
            return true;
          }

          // Create new user if they don't exist
          await User.create({
            name: user.name,
            email: email,
            password: await bcrypt.hash(randomBytes(32).toString("hex"), 10), // Random password
            role: "donor",
            isVerified: true, // Google emails are verified
            location: { type: 'Point', coordinates: [0, 0] }, // Default location
            provider: "google",
          });

          return true;
        } catch (error) {
          console.error("Error saving google user", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      // Refresh role and hospital assignments so admin changes take effect immediately.
      await dbConnect();
      const dbUser = token.email ? await User.findOne({ email: token.email.toLowerCase() }) : null;
      token.id = dbUser?.isVerified ? dbUser._id.toString() : "";
      token.role = dbUser?.isVerified ? dbUser.role : "";
      token.hospitalId = dbUser?.hospitalId?.toString();
      token.hospitalIds = dbUser?.hospitalIds?.map((id: unknown) => String(id)) || [];
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.hospitalId = token.hospitalId;
        session.user.hospitalIds = token.hospitalIds;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
