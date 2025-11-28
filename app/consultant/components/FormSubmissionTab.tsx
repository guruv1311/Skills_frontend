"use client";

import React from "react";
import {
  Tile,
  Button,
  Checkbox,
  Tag,
  Grid,
  Column,
} from "@carbon/react";
import {
  TrashCan,
  Launch,
  Copy,
  SkillLevel,
  TaskComplete,
  Certificate,
  DataBase,
  Trophy,
} from "@carbon/icons-react";

import type {
  PendingForm,
  SkillForm,
  ProjectForm,
  CertificationEntry,
  AssetForm,
  ProfessionalEminenceForm,
} from "@/app/consultant/types";

export default function FormSubmissionTab({
  pendingForms,
  selectedIds,
  toggleSelect,
  removePending,
  submitSelected,
  onClearAll,
}: {
  pendingForms: PendingForm[];
  selectedIds: string[];
  toggleSelect: (id: string, checked: boolean) => void;
  removePending: (id: string) => void;
  submitSelected: () => void;
  onClearAll: () => void;
}) {
  const kindInfo = (kind: PendingForm["kind"]) => {
    switch (kind) {
      case "skill":
        return { label: "Skill", Icon: SkillLevel, color: "blue" };
      case "project":
        return { label: "Project", Icon: TaskComplete, color: "green" };
      case "certification":
        return { label: "Certification", Icon: Certificate, color: "magenta" };
      case "asset":
        return { label: "Asset", Icon: DataBase, color: "cyan" };
      case "professionalEminence":
        return { label: "Professional Eminence", Icon: Trophy, color: "purple" };
      default:
        return { label: "Item", Icon: TaskComplete, color: "gray" };
    }
  };

  const shortSummary = (f: PendingForm) => {
    switch (f.kind) {
      case "skill": {
        const p = f.payload as SkillForm;
        const label =
          p.specialtyId ||
          p.portfolioId ||
          p.segmentId ||
          p.platformId ||
          `Skill (${p.proficiency})`;
        return `${label} · ${p.years || "N/A"} yr`;
      }
      case "project": {
        const p = f.payload as ProjectForm;
        const idPart = p.projectId ? `${p.projectId} · ` : "";
        return `${idPart}${p.name || "Project"} · ${p.client || ""}`;
      }
      case "certification": {
        const p = f.payload as CertificationEntry;
        return `${p.name || "Certification"} · ${p.issueDate || ""}`;
      }
      case "asset": {
        const p = f.payload as AssetForm;
        return `${p.name || "Asset"} · ${p.usedInProject === "yes" ? "Used" : "Not used"
          }`;
      }
      case "professionalEminence": {
        const p = f.payload as ProfessionalEminenceForm;
        const label = p.eminenceType || "Eminence";
        return `${label} · ${p.scope || "—"}`;
      }
      default:
        return "Unknown";
    }
  };

  const openPayloadInNewTab = (f: PendingForm) => {
    const payloadJson = JSON.stringify(f.payload, null, 2);
    const blob = new Blob([payloadJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  // Render a structured details area (no JSON) similar to Skills summary cards
  const DetailsCardContent = ({ f }: { f: PendingForm }) => {
    switch (f.kind) {
      case "skill": {
        const s = f.payload as SkillForm;
        return (
          <div>
            <h6 className="cds--type-heading-03" style={{ marginBottom: "0.5rem" }}>
              {s.specialtyId ? `Specialty: ${s.specialtyId}` : "Skill"}
            </h6>
            <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "0.5rem" }}>
              {s.years ? `${s.years} year(s) experience` : "Years not specified"}
            </p>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <Tag type="outline" size="sm">Platform: {s.platformId || "—"}</Tag>
              <Tag type="outline" size="sm">Segment: {s.segmentId || "—"}</Tag>
              <Tag type="outline" size="sm">Portfolio: {s.portfolioId || "—"}</Tag>
              <Tag
                type={
                  s.proficiency === "expert"
                    ? "green"
                    : s.proficiency === "intermediate"
                      ? "blue"
                      : "gray"
                }
                size="sm"
              >
                {s.proficiency}
              </Tag>
            </div>
          </div>
        );
      }

      case "project": {
        const p = f.payload as ProjectForm;
        return (
          <div>
            <h6 className="cds--type-heading-03">{p.name || "Project"}</h6>
            <p className="cds--type-body-01" style={{ color: "#525252", marginTop: "0.25rem" }}>
              {p.client ? `${p.client} · ${p.technology || "—"}` : p.technology || "—"}
            </p>

            <div style={{ marginTop: "0.75rem" }}>
              <p className="cds--type-label-01" style={{ color: "#525252" }}>Role</p>
              <p className="cds--type-body-01">{p.role || "—"}</p>

              {p.contribution && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p className="cds--type-label-01" style={{ color: "#525252" }}>Contribution</p>
                  <p className="cds--type-body-01" style={{ whiteSpace: "pre-line" }}>
                    {p.contribution}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {p.projectId && <Tag size="sm">ID: {p.projectId}</Tag>}
              {p.assetUsed && <Tag type="outline" size="sm">Asset used: {p.assetUsed}</Tag>}
              {p.assetName && <Tag type="outline" size="sm">{p.assetName}</Tag>}
            </div>

            {p.assetDescription && (
              <div style={{ marginTop: "0.5rem" }}>
                <p className="cds--type-label-01" style={{ color: "#525252" }}>Asset description</p>
                <p className="cds--type-body-01">{p.assetDescription}</p>
              </div>
            )}

            {p.assetLink && (
              <div style={{ marginTop: "0.5rem" }}>
                <p className="cds--type-label-01" style={{ color: "#525252" }}>Asset link</p>
                <a
                  href={p.assetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="cds--type-body-01"
                  style={{ color: "#0f62fe" }}
                >
                  {p.assetLink}
                </a>
              </div>
            )}
          </div>
        );
      }

      case "certification": {
        const c = f.payload as CertificationEntry;
        return (
          <div>
            <h6 className="cds--type-heading-03">{c.name || "Certification"}</h6>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <Tag size="sm">Type: {c.type || "—"}</Tag>
              <Tag type="outline" size="sm">Issued: {c.issueDate || "—"}</Tag>
              {c.fileName && <Tag type="outline" size="sm">{c.fileName}</Tag>}
            </div>
          </div>
        );
      }

      case "asset": {
        const a = f.payload as AssetForm;
        return (
          <div>
            <h6 className="cds--type-heading-03">{a.name || "Asset / Accelerator"}</h6>
            <p className="cds--type-body-01" style={{ color: "#525252", marginTop: "0.25rem" }}>
              {a.description || "No description provided"}
            </p>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <Tag type="outline" size="sm">Used in Project: {a.usedInProject || "—"}</Tag>
              <Tag type="outline" size="sm">AI Adoption: {a.aiAdoption || "—"}</Tag>
            </div>
          </div>
        );
      }

      case "professionalEminence": {
        const pe = f.payload as ProfessionalEminenceForm;
        return (
          <div>
            <h6 className="cds--type-heading-03">
              {pe.url ? "Professional Eminence" : "Eminence Item"}
            </h6>
            {/* Achievement URL */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {pe.url && (
                <Tag
                  type="blue"
                  size="sm"
                  as="a"
                  href={pe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: "pointer" }}
                >
                  Visit Link
                </Tag>
              )}
              {/* Type */}
              <Tag type="outline" size="sm">Type: {pe.eminenceType || "—"}</Tag>
              {/* Scope */}
              <Tag size="sm">Scope: {pe.scope || "—"}</Tag>
            </div>
            {/* Description */}
            {pe.description && (
              <p
                className="cds--type-body-01"
                style={{ color: "#525252", marginTop: "0.5rem", whiteSpace: "pre-line" }}
              >
                {pe.description}
              </p>
            )}
          </div>
        );
      }

      default:
        return (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>
            No details available.
          </p>
        );
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h4 className="cds--type-heading-04">Form Submission</h4>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            kind="secondary"
            size="sm"
            onClick={() => {
              if (typeof onClearAll === "function") onClearAll();
            }}
          >
            Clear All
          </Button>

          <Button
            kind="primary"
            size="sm"
            onClick={() => submitSelected()}
            disabled={selectedIds.length === 0}
          >
            Submit selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      {pendingForms.length === 0 ? (
        <Tile style={{ backgroundColor: "#ffffff" }}>
          <p className="cds--type-body-01" style={{ color: "#525252" }}>
            No forms added to submit.
          </p>
        </Tile>
      ) : (
        <Grid>
          {pendingForms.map((f) => {
            const info = kindInfo(f.kind);
            const checked = selectedIds.includes(f.id);
            const IconComponent = info.Icon;

            return (
              <Column key={f.id} lg={8} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        backgroundColor: `var(--cds-${info.color}-50)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={24} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div>
                          <h6 className="cds--type-heading-03" style={{ margin: 0 }}>
                            {shortSummary(f)}
                          </h6>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                            <Tag size="sm">{info.label}</Tag>
                            <span className="cds--type-caption-01" style={{ color: "#525252" }}>
                              {new Date(f.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Checkbox
                          id={`checkbox-${f.id}`}
                          checked={checked}
                          onChange={(e) => toggleSelect(f.id, e.target.checked)}
                          labelText=""
                        />
                      </div>

                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem", marginTop: "1rem" }}>
                        <DetailsCardContent f={f} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid #e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Launch}
                            iconDescription="Open JSON in new tab"
                            hasIconOnly
                            onClick={() => openPayloadInNewTab(f)}
                          />

                          <Button
                            kind="danger--ghost"
                            size="sm"
                            renderIcon={TrashCan}
                            iconDescription="Remove from queue"
                            hasIconOnly
                            onClick={() => removePending(f.id)}
                          />
                        </div>

                        <Button
                          kind="tertiary"
                          size="sm"
                          renderIcon={Copy}
                          onClick={() => {
                            // copy a concise JSON or key fields if needed
                            try {
                              const toCopy = JSON.stringify(f.payload);
                              navigator.clipboard.writeText(toCopy);
                              // eslint-disable-next-line no-alert
                              alert("Payload copied to clipboard");
                            } catch {
                              // eslint-disable-next-line no-alert
                              alert("Unable to copy");
                            }
                          }}
                        >
                          Copy
                        </Button>
                        {/* <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          // ensure it's selected, then submit
                          if (!selectedIds.includes(f.id))
                            toggleSelect(f.id, true);
                          submitSelected();
                        }}
                      >
                        Submit
                      </Button> */}
                      </div>
                    </div>
                  </div>
                </Tile>
              </Column>
            );
          })}
        </Grid>
      )}
    </div>
  );
}
