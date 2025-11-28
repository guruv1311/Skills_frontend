"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ConsultantClient from "./ConsultantClient";
import { Loading } from "@carbon/react";

export default function ConsultantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const profile = {
    userId: user.user_id,
    name: user.name || "",
    email: user.email || "",
    role: "Consultant",
    // Add other fields if available in user object or fetch them
  };

  return <ConsultantClient profile={profile} />;
}
