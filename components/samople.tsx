"use client";

import React from "react";
import { useSession } from "next-auth/react";

export default function Samople() {
  const { data: session } = useSession();
  console.log(session);

  return <div>{JSON.stringify(session)}</div>;
}
