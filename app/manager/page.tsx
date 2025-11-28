
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ManagerClient from "./ManagerClient";
import { API_URL } from "@/lib/config";

export default async function ManagerPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  let user = null;
  let accessToken = "";

  try {
    // Validate session with backend and get user details + access token
    const res = await fetch(`${API_URL}/auth/user`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log("ManagerPage: Backend auth check failed", res.status);
      redirect("/");
    }

    const data = await res.json();
    user = data.user;
    accessToken = data.access_token;

    if (!user) {
      console.log("ManagerPage: No user returned from backend");
      redirect("/");
    }
  } catch (err) {
    console.error("ManagerPage: Error validating session", err);
    if ((err as Error).message === "NEXT_REDIRECT") {
      throw err;
    }
    redirect("/");
  }

  const profile = {
    name: user.name || "",
    email: user.email || "",
    role: "Manager", // Defaulting to Manager as backend doesn't explicitly return role yet
    ...user
  };

  if (!accessToken) {
    console.error("ManagerPage: No access token returned from backend");
    redirect("/");
  }

  return (
    <ManagerClient profile={profile} initialBearerToken={accessToken} />
  );
}
