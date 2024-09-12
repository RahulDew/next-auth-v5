import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import { signInSchema } from "./lib/zod";
import Google from "next-auth/providers/google";
import { connectDB } from "./lib/mongodb";
import User from "./models/User";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Github,
    Google({
      profile(profile) {
        return { ...profile, OauthId: profile.id };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        let user = null;

        console.log("From authorize", credentials);

        console.log("From authorize", auth);
        // validate credentials
        const parsedCredentials = signInSchema.safeParse(credentials);
        console.log("Parsed credentials", parsedCredentials);
        if (!parsedCredentials.success) {
          console.error("Invalid credentials:", parsedCredentials.error.errors);
          return null;
        }

        await connectDB();
        user = await User.findOne({
          email: credentials?.email,
        }).select("+password");
        console.log("User", user);
        

        if (!user) throw new Error("Invalid credentials: Wrong Email");

        const passwordMatch = await bcrypt.compare(
          credentials!.password as string,
          user.password
        );

        if (!passwordMatch) throw new Error("Wrong Password");
        return user;
      },
    }),
  ],
  callbacks: {
    // authorized({ request: { nextUrl }, auth }) {
    //   const isLoggedIn = !!auth?.user;
    //   const { pathname } = nextUrl;
    //   // const role = auth?.user.role || "user";
    //   console.log("From callback", auth);
    //   if (pathname.startsWith("/auth/signIn") && isLoggedIn) {
    //     return Response.redirect(new URL("/", nextUrl));
    //   }
    //   // if (pathname.startsWith("/page2") && role !== "admin") {
    //   //   return Response.redirect(new URL("/", nextUrl));
    //   // }
    //   return !!auth;
    // },
    signIn: async ({ user }) => {
      try {
        //connecting to MongoDB
        await connectDB();
        console.log("From signIn callback", user);

        // check if user already exists
        const userExists = await User.findOne({ email: user.email });
        if (userExists) {
          // setting some properties to the user object
          user.id = userExists._id;
          user.picture = userExists.picture;
        }

        // if not, create a new document and save user in MongoDB
        if (!userExists) {
          const userDoc = await User.create({
            email: user.email,
            name: user.name,
            picture: user.picture,
            iss: user.iss,
          });
          // setting some properties to the user object
          user.id = userDoc._id;
          user.picture = userDoc.picture;
        }

        return true;
      } catch (error) {
        console.log("Error checking if user exists: ", error);
        return false;
      }
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.image = user.picture as string;
        // token.role = user.role as string;
      }
      // //   if (trigger === "update" && session) {
      // //     token = { ...token, ...session };
      // //   }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.image = token.image as string;
      //   session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
