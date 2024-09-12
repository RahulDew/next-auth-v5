"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function handleCredentialsSignin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid credentials",
          };
        default:
          return {
            error: "Something went wrong.",
          };
      }
    }
    throw error;
  }
}

export const handleCredentialsSignup = async (values: any) => {
  const { email, password, confirmedPassword } = values;
  // console.log("values", values);

  try {
    await connectDB();
    const userFound = await User.findOne({ email });
    if (userFound) {
      // console.log("Email already exists!");
      return {
        userCreated: false,
        error: "Email already exists!",
      };
    }
    if (password !== confirmedPassword) {
      return {
        userCreated: false,
        error: "Passwords don't match",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log("hashedPassword", hashedPassword);
    const user = new User({
      email,
      password: hashedPassword,
      iss: "credentials",
    });
    const savedUser = await user.save();
    // console.log(savedUser);
    return {
      userCreated: true,
      message: "User created successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      error: "can't create user",
    };
  }
};

export async function handleGithubSignin() {
  await signIn("github", { redirectTo: "/" });
}
export async function handleGoogleSignin() {
  await signIn("google", { redirectTo: "/" });
}

export async function handleSignOut() {
  await signOut();
}
