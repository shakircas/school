import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("RECEIVED CREDENTIALS:", credentials); // CHECK YOUR TERMINAL

        try {
          await connectDB();

         const email = credentials.email.toLowerCase().trim();

         const user = await User.findOne({ email });


          if (!user) return null;

          console.log("DB HASH:", user.password);
          console.log("INPUT PASS:", credentials.password);


          const isValid = await compare(credentials.password, user.password);
          console.log("PASSWORD MATCH:", isValid);

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Credentials auth error:", error);
          throw error; // IMPORTANT for debugging
        }

      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});
