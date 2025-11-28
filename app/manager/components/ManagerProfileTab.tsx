// app/manager/components/ManagerProfileTab.tsx
"use client";

import React, { useState } from "react";
import {
  Tile,
  Grid,
  Column,
  Tag,
  Button,
  Modal,
  Loading,
} from "@carbon/react";
import {
  User,
  Enterprise,
  Collaborate, // for SupervisorAccount
  Identification, // for Badge
  Email,
  Phone,
  Close,
} from "@carbon/icons-react";

import ReporteeDetailCard from "./ReporteeDetailCard";
import { ProfileSummary } from "../types";
import { ReporteeDetail } from "../services/ReporteeDetails";

export default function ManagerProfileTab({
  p,
  role,
  initials,
  reportees,
  loadingReportees,
  reporteesError,
}: {
  p: ProfileSummary;
  role: string;
  initials: string;
  reportees: ReporteeDetail[] | null;
  loadingReportees: boolean;
  reporteesError: string | null;
}) {
  const userId = p.userId || p.email;
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [details, setDetails] = useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    if (!userId) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/profile/details/${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setDetails(data);
        }
      } catch (err) {
        console.error("Failed to fetch manager profile details:", err);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Helper to validate email
  const isValidEmail = (e: string | null | undefined) => e && e.includes("@");

  // Merge props with fetched details
  const displayProfile = {
    ...p,
    ...details,
    // Prefer fetched details if available, but keep p as base
    name: details?.name || p.name,
    email: isValidEmail(details?.email) ? details.email : (isValidEmail(p.email) ? p.email : null),
    phone: details?.phone || p.phone,
    designation: details?.designation || p.designation,
    Unit: details?.unit || p.Unit,
    manager: details?.manager || p.manager,
  };

  return (
    <>
      {/* Profile Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* Avatar */}
          <div
            onClick={() => setAvatarOpen(true)}
            style={{
              width: "84px",
              height: "84px",
              backgroundColor: "#0353E9",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            <img
              src={`/api/profile/image/${userId}`}
              alt={initials}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Fallback initials if image fails or is loading (img covers it if successful) */}
            <span style={{ position: "absolute" }}>{initials}</span>
          </div>

          <Modal
            open={avatarOpen}
            onRequestClose={() => setAvatarOpen(false)}
            passiveModal
            modalHeading="Profile Picture"
            size="sm"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: "#111",
              }}
            >
              <img
                src={`/api/profile/image/${userId}`}
                alt={initials}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
            </div>
          </Modal>

          <div>
            <h4 className="cds--type-heading-04" style={{ fontWeight: 700 }}>
              {displayProfile.name ?? "Manager"}
            </h4>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
              <Tag type="blue" size="sm">
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Collaborate size={16} />
                  {role}
                </div>
              </Tag>
              {displayProfile.Unit && (
                <Tag type="cool-gray" size="sm">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Enterprise size={16} />
                    {displayProfile.Unit}
                  </div>
                </Tag>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Tile */}
      <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff", marginBottom: "2rem" }}>
        <Grid>
          {/* Contact Section */}
          <Column lg={8} md={4} sm={4}>
            <h6 className="cds--type-heading-01" style={{ marginBottom: "1rem", color: "#525252" }}>
              Contact
            </h6>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "1rem", display: "flex", alignItems: "flex-start" }}>
                <User size={20} style={{ marginRight: "0.75rem", color: "#525252", marginTop: "2px" }} />
                <div>
                  <div className="cds--type-label-01" style={{ color: "#525252" }}>Name</div>
                  <div className="cds--type-body-01">{displayProfile.name ?? "Not available"}</div>
                </div>
              </li>
              <li style={{ marginBottom: "1rem", display: "flex", alignItems: "flex-start" }}>
                <Email size={20} style={{ marginRight: "0.75rem", color: "#525252", marginTop: "2px" }} />
                <div>
                  <div className="cds--type-label-01" style={{ color: "#525252" }}>Email</div>
                  <div className="cds--type-body-01">{displayProfile.email ?? "Not available"}</div>
                </div>
              </li>
              <li style={{ marginBottom: "1rem", display: "flex", alignItems: "flex-start" }}>
                <Phone size={20} style={{ marginRight: "0.75rem", color: "#525252", marginTop: "2px" }} />
                <div>
                  <div className="cds--type-label-01" style={{ color: "#525252" }}>Phone</div>
                  <div className="cds--type-body-01">{displayProfile.phone ?? "Not available"}</div>
                </div>
              </li>
              {/* <li style={{ marginBottom: "1rem", display: "flex", alignItems: "flex-start" }}>
                <Identification size={20} style={{ marginRight: "0.75rem", color: "#525252", marginTop: "2px" }} />
                <div>
                  <div className="cds--type-label-01" style={{ color: "#525252" }}>Designation</div>
                  <div className="cds--type-body-01">{displayProfile.designation ?? "Not available"}</div>
                </div>
              </li> */}
            </ul>
          </Column>

          {/* Organization Section */}
          <Column lg={8} md={4} sm={4}>
            <h6 className="cds--type-heading-01" style={{ marginBottom: "1rem", color: "#525252" }}>
              Organization
            </h6>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "1rem", display: "flex", alignItems: "flex-start" }}>
                <Enterprise size={20} style={{ marginRight: "0.75rem", color: "#525252", marginTop: "2px" }} />
                <div>
                  <div className="cds--type-label-01" style={{ color: "#525252" }}>Unit</div>
                  <div className="cds--type-body-01">{displayProfile.Unit ?? "Not available"}</div>
                </div>
              </li>
              <li style={{ marginBottom: "1rem", display: "flex", alignItems: "flex-start" }}>
                <Collaborate size={20} style={{ marginRight: "0.75rem", color: "#525252", marginTop: "2px" }} />
                <div>
                  <div className="cds--type-label-01" style={{ color: "#525252" }}>Reporting To</div>
                  <div className="cds--type-body-01">{displayProfile.manager ?? "Not available"}</div>
                </div>
              </li>
            </ul>
          </Column>
        </Grid>
      </Tile>

      {/* Reportee Details Section */}
      <div style={{ marginTop: "3rem" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Direct Reportees
        </h4>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1.5rem" }}>
          Review profiles for your team members.
        </p>

        {loadingReportees ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <Loading description="Loading reportees..." withOverlay={false} />
          </div>
        ) : reporteesError ? (
          <p className="cds--type-body-01" style={{ color: "#da1e28" }}>{reporteesError}</p>
        ) : !reportees || reportees.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>
            No direct reports found on your profile.
          </p>
        ) : (
          <Grid>
            {reportees.map((reportee) => (
              <Column
                key={reportee.userId}
                lg={8} md={4} sm={4}
                style={{ marginBottom: "1.5rem" }}
              >
                <ReporteeDetailCard reportee={reportee} />
              </Column>
            ))}
          </Grid>
        )}
      </div>
    </>
  );
}
