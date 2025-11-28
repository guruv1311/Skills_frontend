import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import Link from "next/link";
import { redirect } from "next/navigation";

// This is an async Server Component. It runs ONLY on the server.
export default async function Profile() {
  // 1. Get the cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.AUTH_COOKIE_NAME || "auth_token"
  )?.value;

  if (!token) {
    return <NotAuthenticated />;
  }

  // 2. Verify the token
  const payload = verifyToken(token);
  if (!payload) {
    return <NotAuthenticated />;
  }

  // Payload shape based on what we signed in callback:
  // { user: <claims>, role: 'manager'|'consultant', profile: { email, name, ... } }
  const role = (payload as any).role as string | undefined;
  const user = (payload as any).user;
  const profile = (payload as any).profile;

  // If role exists, redirect server-side immediately to the proper page
  if (role === "manager") {
    redirect("/manager");
  } else if (role === "consultant") {
    redirect("/consultant");
  }

  // If role is not present (unexpected), show the profile info and let user proceed.
  return (
    <main className="cds--grid cds--grid--full-width" style={{ padding: "2rem" }}>
      <div className="cds--row">
        <div className="cds--col-lg-16">
          <div className="cds--tile">
            <h1 className="cds--type-heading-05" style={{ marginBottom: "1rem" }}>
              You are authenticated ✅
            </h1>

            <h3 className="cds--type-heading-03" style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>
              User profile (ID token claims / userinfo):
            </h3>
            <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "0.25rem", overflowX: "auto" }}>
              {JSON.stringify(user, null, 2)}
            </pre>

            <h3 className="cds--type-heading-03" style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>
              Profile summary (from profile API):
            </h3>
            <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "0.25rem", overflowX: "auto" }}>
              {JSON.stringify(profile || {}, null, 2)}
            </pre>

            <div style={{ marginTop: "2rem" }}>
              <Link href="/api/auth/logout" className="cds--link">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// It's good practice to create a separate component for the unauthenticated state
function NotAuthenticated() {
  return (
    <main className="cds--grid cds--grid--full-width" style={{ padding: "2rem" }}>
      <div className="cds--row">
        <div className="cds--col-lg-16">
          <div className="cds--tile">
            <h1 className="cds--type-heading-05" style={{ marginBottom: "1rem" }}>
              Not authenticated
            </h1>
            <p className="cds--type-body-long-01">
              Please <Link href="/" className="cds--link">login</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
