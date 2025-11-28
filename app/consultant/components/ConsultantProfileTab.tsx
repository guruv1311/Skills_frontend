"use client";

import React, { useEffect, useState } from "react";
import {
  Tile,
  Tag,
  Modal,
  Button,
  Tooltip,
  Grid,
  Column,
  Stack,
} from "@carbon/react";
import {
  User,
  Enterprise,
  Email,
  Phone,
  UserMultiple,
  CheckmarkFilled,
  Information,
} from "@carbon/icons-react";
import { ProfileSummary } from "../types";

/**
 * Small circular SVG progress component.
 * Accepts value in [0..100]. Renders a circular ring and percentage text.
 */
// function CircularPercent({
//   value,
//   size = 64,
//   stroke = 8,
//   trackColor = "#eeeeee",
//   progressColor = "#4f46e5",
// }: {
//   value: number;
//   size?: number;
//   stroke?: number;
//   trackColor?: string;
//   progressColor?: string;
// }) {
//   const radius = (size - stroke) / 2;
//   const center = size / 2;
//   const circumference = 2 * Math.PI * radius;
//   const clamped = Math.max(0, Math.min(100, Math.round(value)));
//   const offset = circumference - (clamped / 100) * circumference;

//   return (
//     <Box
//       sx={{
//         width: size,
//         height: size,
//         display: "inline-block",
//         position: "relative",
//       }}
//       aria-hidden
//     >
//       <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//         {/* track */}
//         <circle
//           cx={center}
//           cy={center}
//           r={radius}
//           stroke={trackColor}
//           strokeWidth={stroke}
//           fill="none"
//         />
//         {/* progress */}
//         <circle
//           cx={center}
//           cy={center}
//           r={radius}
//           stroke={progressColor}
//           strokeWidth={stroke}
//           strokeLinecap="round"
//           fill="none"
//           strokeDasharray={`${circumference} ${circumference}`}
//           strokeDashoffset={offset}
//           transform={`rotate(-90 ${center} ${center})`}
//         />
//       </svg>

//       {/* percentage label in center */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           pointerEvents: "none",
//         }}
//       >
//         <Typography
//           variant="caption"
//           sx={{ fontWeight: 700, lineHeight: 1 }}
//         >{`${clamped}%`}</Typography>
//       </Box>
//     </Box>
//   );
// }

// function HorizontalPercent({
//   value,
//   height = 8, // Represents the height/stroke of the bar
//   icon: IconComponent = InsightsIcon, // Allows custom icon input
//   trackColor = "#e0e0e0",
//   progressColor = "#0353E9",
// }: {
//   value: number;
//   height?: number;
//   icon?: React.ElementType;
//   trackColor?: string;
//   progressColor?: string;
// }) {
//   const clamped = Math.max(0, Math.min(100, Math.round(value)));

//   const getProgressColor = (completionValue: number): string => {
//     if (completionValue === 100) return "#66BB6A"; // Green (Success)
//     if (completionValue >= 75) return "#29B6F6"; // Blue (Near Complete)
//     if (completionValue >= 50) return "#FFB300"; // Amber (Intermediate)
//     return "#EF5350"; // Red (Starting)
//   };
//   const progressColor = getProgressColor(clamped);

//   return (
//     <Box
//       sx={{
//         width: "100%", // Full width
//         display: "flex",
//         alignItems: "center",
//         gap: 1.5, // Spacing between icon and bar
//         padding: 2, // Add padding inside the box
//         borderRadius: 1, // Rounded corners
//         backgroundColor: "grey.50", // Very light grey background
//         border: "1px solid",
//         borderColor: "grey.300", // Light border color
//       }}
//     >
//       {/* 1. Icon at the Beginning */}
//       <IconComponent
//         sx={{
//           fontSize: 20,
//           color: progressColor, // Color the icon to match the progress bar
//         }}
//       />

//       {/* 2. Progress Bar and Label Container */}
//       <Box sx={{ flexGrow: 1 }}>
//         {/* Percentage Label (Above or Next to Bar) */}
//         <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
//           <Typography
//             variant="caption"
//             sx={{ fontWeight: 600, color: "text.secondary" }}
//           >
//             Progress
//           </Typography>
//           <Typography
//             variant="caption"
//             sx={{ fontWeight: 700, color: progressColor }}
//           >
//             {`${clamped}%`}
//           </Typography>
//         </Box>

//         {/* Horizontal Linear Progress Bar */}
//         <LinearProgress
//           variant="determinate"
//           value={clamped}
//           sx={{
//             height: height,
//             borderRadius: 5,
//             backgroundColor: trackColor, // Track color
//             "& .MuiLinearProgress-bar": {
//               backgroundColor: progressColor, // Progress color
//               borderRadius: 5,
//             },
//           }}
//         />
//       </Box>
//     </Box>
//   );
// }

const CompletionLegend = () => (
  <div style={{ padding: "0.5rem" }}>
    <p className="cds--type-label-01" style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
      Profile Completion Tiers
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#da1e28" }} />
        <span className="cds--type-caption-01">0% - 49%: Starting</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f1c21b" }} />
        <span className="cds--type-caption-01">50% - 74%: Developing</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#0f62fe" }} />
        <span className="cds--type-caption-01">75% - 99%: Near Complete</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#24a148" }} />
        <span className="cds--type-caption-01">100%: Complete</span>
      </div>
    </div>
  </div>
);

function HorizontalPercent({
  value,
  height = 8,
  icon: IconComponent = CheckmarkFilled,
}: {
  value: number;
  height?: number;
  icon?: React.ElementType;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  // ⭐️ COLOR LOGIC FUNCTION ⭐️
  const getProgressColor = (completionValue: number): string => {
    if (completionValue === 100) return "#24a148"; // Green (Success)
    if (completionValue >= 75) return "#0f62fe"; // Blue (Near Complete)
    if (completionValue >= 50) return "#f1c21b"; // Amber (Intermediate)
    return "#da1e28"; // Red (Starting)
  };

  const progressColor = getProgressColor(clamped);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        borderRadius: "0.25rem",
        backgroundColor: "#f4f4f4",
        border: "1px solid #e0e0e0",
      }}
    >
      {/* 1. Icon at the Beginning */}
      <IconComponent size={24} fill={progressColor} />
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <span className="cds--type-label-01" style={{ fontWeight: 600, color: "#525252" }}>
            Profile Completion
          </span>
          <span className="cds--type-label-01" style={{ fontWeight: 900, color: progressColor }}>
            {`${clamped}%`}
          </span>
        </div>
        {/* Custom Progress Bar using div to control color easily */}
        <div
          style={{
            width: "100%",
            height: height,
            backgroundColor: "#e0e0e0",
            borderRadius: height / 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${clamped}%`,
              height: "100%",
              backgroundColor: progressColor,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ConsultantProfileTab({
  p,
  role,
  initials,
}: {
  p: ProfileSummary;
  role: string;
  initials: string;
}) {
  const userId = p.userId || p.email;
  const [avatarOpen, setAvatarOpen] = useState(false);

  // progress state (0..100)
  const [completion, setCompletion] = useState<number | null>(null);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingCompletion(true);
      setCompletionError(null);
      try {
        const res = await fetch("/api/profilePercentage/");
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`API ${res.status} ${txt}`);
        }
        const json = await res.json();
        // expect something like { percentage: 72 } or { value: 72 }
        const raw = json?.percentage ?? json?.value ?? json;
        const num = Number(raw);
        if (Number.isNaN(num)) {
          throw new Error("Invalid percentage value from API");
        }
        if (mounted) setCompletion(Math.max(0, Math.min(100, Math.round(num))));
      } catch (err: any) {
        console.error("Failed to fetch completion percentage:", err);
        if (mounted) setCompletionError(err?.message ?? "Failed to load");
      } finally {
        if (mounted) setLoadingCompletion(false);
      }
    };
    // fire once
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // fetched profile details state
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
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
        console.error("Failed to fetch profile details:", err);
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
    Unit: details?.unit || p.Unit,
    manager: details?.manager || p.manager,
  };

  return (
    <>
      {/* Completion progress (SVG) */}
      <div style={{ marginBottom: "1.5rem", padding: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.25rem",
            marginBottom: "1rem",
          }}
        >
          {loadingCompletion ? (
            <span className="cds--type-caption-01" style={{ color: "#525252" }}>
              Loading…
            </span>
          ) : completionError ? (
            <span className="cds--type-caption-01" style={{ color: "#da1e28" }}>
              N/A
            </span>
          ) : completion !== null ? (
            <>
              {/* ⭐️ REPLACED CircularPercent with HorizontalPercent ⭐️ */}
              <HorizontalPercent
                value={completion}
                height={8} // Use height instead of size/stroke
                icon={CheckmarkFilled}  // Use an appropriate icon
              />
              <Tooltip align="bottom-right" label={<CompletionLegend />}>
                <button type="button" className="cds--btn--ghost" style={{ padding: 0, minHeight: 'auto' }}>
                  <Information size={20} style={{ fill: "#525252", cursor: "pointer", marginTop: "0.5rem" }} />
                </button>
              </Tooltip>
            </>
          ) : (
            <span className="cds--type-caption-01" style={{ color: "#525252" }}>
              N/A
            </span>
          )}
        </div>

        <Stack gap={5} orientation="horizontal" style={{ alignItems: "center" }}>
          <div
            onClick={() => setAvatarOpen(true)}
            style={{
              width: 84,
              height: 84,
              backgroundColor: "#0f62fe",
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
            {/* Try to load image, fallback to initials if needed (logic usually in Avatar component but here we use img directly or text) */}
            <img
              src={`/api/profile/image/${userId}`}
              alt={initials}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                // Fallback to showing initials (parent div background)
              }}
            />

          </div>

          <Modal
            open={avatarOpen}
            onRequestClose={() => setAvatarOpen(false)}
            passiveModal
            modalHeading={displayProfile.name ?? "Consultant"}
            size="lg"
          >
            <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
              <img
                src={`/api/profile/image/${userId}`}
                alt={initials}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
          </Modal>

          <div>
            <h4 className="cds--type-heading-04" style={{ fontWeight: 700 }}>
              {displayProfile.name ?? "Consultant"}
            </h4>
            <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.5rem" }}>
              <Tag type="blue" title="Role">
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <User size={16} /> {role}
                </div>
              </Tag>
              {displayProfile.Unit && (
                <Tag type="cyan" title="Unit">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Enterprise size={16} /> {displayProfile.Unit}
                  </div>
                </Tag>
              )}
            </div>
          </div>
        </Stack>
      </div>

      <Tile className="profile-info-tile" style={{ backgroundColor: "#ffffff" }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <h6 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>
              Contact
            </h6>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <User size={20} style={{ marginRight: "0.5rem", fill: "#525252" }} />
                <div>
                  <div className="cds--type-label-01">Name</div>
                  <div className="cds--type-body-short-01">{displayProfile.name ?? "Not available"}</div>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <Email size={20} style={{ marginRight: "0.5rem", fill: "#525252" }} />
                <div>
                  <div className="cds--type-label-01">Email</div>
                  <div className="cds--type-body-short-01">{displayProfile.email ?? "Not available"}</div>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <Phone size={20} style={{ marginRight: "0.5rem", fill: "#525252" }} />
                <div>
                  <div className="cds--type-label-01">Phone</div>
                  <div className="cds--type-body-short-01">{displayProfile.phone ?? "Not available"}</div>
                </div>
              </li>
            </ul>
          </Column>

          <Column lg={8} md={4} sm={4}>
            <h6 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>
              Organization
            </h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <Enterprise size={20} style={{ marginRight: "0.5rem", fill: "#525252" }} />
                <div>
                  <div className="cds--type-label-01">Unit</div>
                  <div className="cds--type-body-short-01">{displayProfile.Unit ?? "Not available"}</div>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <UserMultiple size={20} style={{ marginRight: "0.5rem", fill: "#525252" }} />
                <div>
                  <div className="cds--type-label-01">Manager</div>
                  <div className="cds--type-body-short-01">{displayProfile.manager ?? "Not available"}</div>
                </div>
              </li>
            </ul>
          </Column>
        </Grid>
      </Tile>
    </>
  );
}
