import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();

        // Check if this is the mentor's first login — auto-create account
        const mentorEmail = process.env.MENTOR_EMAIL;
        const mentorPassword = process.env.MENTOR_PASSWORD;

        if (
          credentials.email === mentorEmail &&
          credentials.password === mentorPassword
        ) {
          let mentor = await User.findOne({ email: mentorEmail });
          if (!mentor) {
            const hash = await bcrypt.hash(mentorPassword!, 12);
            mentor = await User.create({
              name: "Rahul",
              email: mentorEmail,
              passwordHash: hash,
              role: "mentor",
              phase: 1,
              avatarInitials: "RA",
            });
          }
          return {
            id: mentor._id.toString(),
            name: mentor.name,
            email: mentor.email,
            role: mentor.role,
            phase: mentor.phase,
          };
        }

        const user = await User.findOne({ email: credentials.email, active: true });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phase: user.phase,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phase = user.phase;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.phase = token.phase as number;
        session.user.id = token.id as string;
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
