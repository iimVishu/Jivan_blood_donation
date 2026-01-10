import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          return null;
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
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const email = user.email.toLowerCase();
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            // If user exists but wasn't verified (e.g. OTP pending), verify them now since Google is trusted
            if (!existingUser.isVerified) {
              existingUser.isVerified = true;
              await existingUser.save();
            }
            return true;
          }

          // Create new user if they don't exist
          await User.create({
            name: user.name,
            email: email,
            password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
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
    async jwt({ token, user, account }: any) {
      if (user) {
        // If it's a google login, we need to fetch the user from DB to get the ID and Role
        if (account?.provider === "google") {
          await dbConnect();
          const email = user.email.toLowerCase();
          const dbUser = await User.findOne({ email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } else {
          // Credentials login already has these
          token.role = user.role;
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
