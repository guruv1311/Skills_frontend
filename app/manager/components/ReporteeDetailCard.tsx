// app/manager/components/ReporteeDetailCard.tsx
import React from "react";
import { Tile } from "@carbon/react";
import { User, Phone, Email, Identification } from "@carbon/icons-react";
import type { ReporteeDetail } from "../services/ReporteeDetails";

export default function ReporteeDetailCard({
  reportee,
}: {
  reportee: ReporteeDetail;
}) {
  const initials = reportee.name
    ? reportee.name
      .split(" ")
      .map((n) => n[0])
      .join("")
    : "R";

  return (
    <Tile
      style={{
        padding: "1.5rem",
        height: "100%",
        backgroundColor: "#ffffff",
        border: "1px solid #e0e0e0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Avatar */}
        <div
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: "#0353E9",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: "1.125rem",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={`/api/profile/image/${reportee.userId}`}
            alt={reportee.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span style={{ position: "absolute" }}>{initials}</span>
        </div>
        <div>
          <div className="cds--type-heading-01" style={{ fontWeight: 600 }}>
            {reportee.name ?? "Not available"}
          </div>
          <div className="cds--type-body-01" style={{ color: "#525252" }}>
            {reportee.userId ?? "Not available"}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#525252" }}>
            <Email size={16} />
            <span className="cds--type-label-01">Email</span>
          </div>
          <span className="cds--type-body-01" style={{ textAlign: "right", wordBreak: "break-all", maxWidth: "60%" }}>
            {reportee.email ?? "—"}
          </span>
        </div>

        {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#525252" }}>
            <Phone size={16} />
            <span className="cds--type-label-01">Mobile</span>
          </div>
          <span className="cds--type-body-01" style={{ textAlign: "right" }}>
            {reportee.phone ?? "—"}
          </span>
        </div> */}
      </div>
    </Tile>
  );
}
