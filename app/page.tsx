"use client";

import { useState } from "react";
import {
  TextInput,
  Button,
  InlineLoading,
  Grid,
  Column,
} from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import "./landing-page.css";

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      //router.push("/manager"); // Default to consultant view
      if (user.role === "Manager") {
         router.push("/manager");
       } else {
         router.push("/consultant");
       }
    }
  }, [user, loading, router]);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateEmail(email)) {
      setError("Please enter a valid IBMid");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Direct redirect to login route - don't wait for state updates
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="landing-page">
      <Grid fullWidth className="landing-page__grid">
        <Column lg={6} md={4} sm={4} className="landing-page__login-column">
          <div className="landing-page__login-content">
            <div style={{ height: "12vh" }} />

            <div style={{ marginBottom: "3rem" }}>
              <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 200 }}>Log in to </span>
                <span style={{ fontWeight: 600 }}>Skills Profile</span>
              </h4>
              <p className="cds--type-body-long-01" style={{ color: "#525252" }}>
                AI-Driven Skill Management Platform
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: "400px", width: "100%", marginTop: "2rem" }}>
              <TextInput
                id="email-input"
                labelText="Sign in with IBMid"
                placeholder="user@ibm.com"
                type="email"
                value={email}
                invalid={!!error}
                invalidText={error}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: "1.5rem" }}
              />

              <Button
                type="submit"
                renderIcon={isSubmitting ? undefined : ArrowRight}
                disabled={isSubmitting}
                kind="primary"
                size="lg"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                {isSubmitting ? (
                  <InlineLoading
                    status="active"
                    iconDescription="Loading"
                    description="Signing in..."
                  />
                ) : (
                  "Sign in via SSO"
                )}
              </Button>

              {isSubmitting && (
                <p className="cds--type-caption-01" style={{ marginTop: "1rem", color: "#525252" }}>
                  Redirecting to IBM SSO…
                </p>
              )}
            </form>
          </div>
        </Column>
        <Column lg={10} md={4} sm={0} className="landing-page__image-column">
          <div
            style={{
              height: "100vh",
              backgroundImage: `url("/login_background_light.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </Column>
      </Grid>
    </div>
  );
}
