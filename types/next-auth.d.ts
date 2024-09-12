// types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    iss: string;
    picture: string;

    // role: string;
  }
  interface Session {
    user: User;
    iss: string;
    picture: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // role: string;
  }
}
