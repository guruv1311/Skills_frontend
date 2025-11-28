// app/manager/components/ApprovedItemCard.tsx
import React, { useState } from "react";
import { Tile, Tag, Button, InlineNotification } from "@carbon/react";
import {
  CheckmarkOutline,
  Folder,
  Certificate,
  Checkmark,
  Close,
  Chat,
} from "@carbon/icons-react";
import { submitRequestDecision } from "../services/ReporteeDetails";

interface SubmissionItem {
  id: string | number;
  status: "pending" | "Approved" | "Rejected" | "draft" | "approved" | "rejected"; // Allow both for compatibility
  name: string;
  type: string;
  user_id: string;
  manager_id: string;
  submission_date: string;
  request_data: string;
  [key: string]: any;
}

const getItemIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "skill": return <Certificate size={16} />;
    case "project": return <Folder size={16} />;
    case "asset": return <CheckmarkOutline size={16} />;
    case "certification": return <Certificate size={16} />;
    default: return <CheckmarkOutline size={16} />;
  }
};

export default function ApprovedItemCard({ item, onDecision }: { item: SubmissionItem, onDecision?: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecision = async (status: "Approved" | "Rejected") => {
    setProcessing(true);
    setError(null);
    const success = await submitRequestDecision({
      manager_id: item.manager_id,
      user_id: item.user_id,
      submission_date: item.submission_date,
      status: status,
      request_data: item.request_data,
      section_type: item.type,
      item_name: item.name
    });

    if (success) {
      if (onDecision) onDecision();
    } else {
      setError("Failed to submit decision");
    }
    setProcessing(false);
  };

  const primaryLabel =
    item.type === "Skill"
      ? `Level: ${item.proficiency_level || "N/A"}`
      : item.type === "Project"
        ? `Client: ${item.client_name || "N/A"}`
        : item.type;

  return (
    <Tile style={{ padding: "1rem", backgroundColor: "#ffffff", border: "1px solid #e0e0e0", marginBottom: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="cds--type-label-01" style={{ marginBottom: "0.25rem" }}>
              {item.user_name || "Unknown User"} <Tag type="gray" size="sm">{item.type}</Tag>
            </div>
            <div className="cds--type-heading-02" style={{ fontWeight: 600 }}>{item.name}</div>
            <div className="cds--type-caption-01" style={{ color: "#525252", marginTop: "0.25rem" }}>
              Submitted: {item.submission_date}
            </div>
            <div className="cds--type-body-01" style={{ marginTop: "0.5rem" }}>
              {primaryLabel}
            </div>
          </div>
        </div>

        {error && <InlineNotification kind="error" title="Error" subtitle={error} lowContrast hideCloseButton />}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Button
            kind="primary"
            size="sm"
            renderIcon={Checkmark}
            onClick={() => handleDecision("Approved")}
            disabled={processing}
            style={{ flex: 1 }}
          >
            Approve
          </Button>
          <Button
            kind="danger"
            size="sm"
            renderIcon={Close}
            onClick={() => handleDecision("Rejected")}
            disabled={processing}
            style={{ flex: 1 }}
          >
            Reject
          </Button>
          {/* <Button
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={Chat}
            iconDescription="Comment"
            tooltipPosition="bottom"
          /> */}
        </div>
      </div>
    </Tile>
  );
}
