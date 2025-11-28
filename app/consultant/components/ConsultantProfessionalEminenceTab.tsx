"use client";

import React, { useEffect, useState } from "react";
import {
  Tile,
  Button,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Tag,
  Loading,
  Grid,
  Column,
  Link as CarbonLink,
} from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import type { ProfessionalEminenceForm } from "../types";

interface EminenceItem {
  id: number;
  user_id: string;
  manager_id: string;
  url: string;
  eminence_type: string;
  description: string;
  scope: string;
}

export default function ConsultantProfessionalEminenceTab({
  form,
  updateField,
  resetForm,
  onAddToPending,
  userId,
}: {
  form: ProfessionalEminenceForm;
  updateField: (k: keyof ProfessionalEminenceForm, v: any) => void;
  resetForm: () => void;
  onAddToPending: (payload: ProfessionalEminenceForm) => void;
  userId?: string;
}) {
  // enforce description length in UI (not strict enforcement server-side)
  const handleDescriptionChange = (v: string) => {
    if (v.length > 200) {
      // optionally you can trim or show an error; here we trim to 200 chars
      updateField("description", v.slice(0, 200));
    } else {
      updateField("description", v);
    }
  };

  const [eminenceItems, setEminenceItems] = useState<EminenceItem[]>([]);
  const [loadingEminence, setLoadingEminence] = useState(false);
  const [eminenceError, setEminenceError] = useState<string | null>(null);

  // 🔹 NEW: fetch from /api/eminence on mount
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!userId) {
        console.warn("No userId provided to ConsultantProfessionalEminenceTab");
        return;
      }

      try {
        setLoadingEminence(true);
        setEminenceError(null);

        const res = await fetch(`/api/eminence?user_id=${encodeURIComponent(userId)}`, { method: "GET" });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(
            `Failed to load professional eminence data: ${res.status} ${body}`
          );
        }

        const data = (await res.json()) as EminenceItem[] | EminenceItem;

        // API might return a single object or an array – normalize to array
        const arr = Array.isArray(data) ? data : [data];

        if (isMounted) {
          setEminenceItems(arr);
        }
      } catch (err: any) {
        console.error("Error loading eminence items:", err);
        if (isMounted) {
          setEminenceError(
            err?.message || "Unable to load professional eminence items."
          );
          setEminenceItems([]);
        }
      } finally {
        if (isMounted) setLoadingEminence(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <div style={{ padding: "0.75rem", width: "100%" }}>
      {/* Form Section */}
      <div>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Professional Eminence
        </h4>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
          Add an achievement, publication or recognition that shows professional
          eminence. Submissions will be reviewed.
        </p>

        <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff" }}>
          <Grid>
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="eminence-url"
                labelText="Achievement / Contribution URL"
                value={form.url || ""}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://..."
                helperText="Provide a public or internal URL to the item (optional)."
              />
            </Column>

            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="eminence-type"
                labelText="Type of Eminence"
                value={form.eminenceType || ""}
                onChange={(e) =>
                  updateField(
                    "eminenceType",
                    e.target.value as ProfessionalEminenceForm["eminenceType"]
                  )
                }
              >
                <SelectItem value="" text="Select" />
                <SelectItem
                  value="Thought Leadership"
                  text="Thought Leadership (e.g., articles, blogs)"
                />
                <SelectItem
                  value="Speaking Engagements"
                  text="Speaking Engagements"
                />
                <SelectItem
                  value="Awards & Recognitions"
                  text="Awards & Recognitions"
                />
                <SelectItem
                  value="Patents / Innovations"
                  text="Patents / Innovations"
                />
                <SelectItem
                  value="Community Contributions"
                  text="Community Contributions"
                />
              </Select>
            </Column>

            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextArea
                id="eminence-description"
                labelText="Description"
                value={form.description || ""}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Brief summary (max ~200 characters)"
                helperText={`${(form.description || "").length}/200`}
                rows={3}
              />
            </Column>

            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="eminence-scope"
                labelText="Scope"
                value={form.scope || ""}
                onChange={(e) =>
                  updateField(
                    "scope",
                    e.target.value as ProfessionalEminenceForm["scope"]
                  )
                }
              >
                <SelectItem value="" text="Select" />
                <SelectItem value="IBM Internal" text="IBM Internal" />
                <SelectItem value="External" text="External" />
                <SelectItem value="Both" text="Both" />
              </Select>
            </Column>
          </Grid>
        </Tile>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Button kind="secondary" onClick={resetForm}>
            Reset
          </Button>

          <Button
            kind="primary"
            onClick={() => {
              // basic validation: description or url required (choose your rules)
              if (!form.description?.trim() && !form.url?.trim()) {
                alert(
                  "Please provide a description or a URL for the achievement."
                );
                return;
              }
              onAddToPending({ ...form, status: "draft" });
            }}
          >
            Add to submission
          </Button>
        </div>
      </div>

      {/* Your Professional Eminence Section */}
      <div style={{ marginTop: "3rem" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Your Professional Eminence
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
            Entries fetched from the system for your professional eminence
            contributions.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button kind="ghost" size="sm">
              View all
            </Button>
          </div>
        </div>

        {/* Loading/Error/Empty States */}
        {loadingEminence ? (
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <Loading />
          </div>
        ) : eminenceError ? (
          <p className="cds--type-body-01" style={{ color: "#da1e28", marginTop: "1rem" }}>
            {eminenceError}
          </p>
        ) : eminenceItems.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252", marginTop: "1rem" }}>
            No professional eminence records found.
          </p>
        ) : (
          /* Grid of Eminence Items */
          <Grid>
            {eminenceItems.map((item) => (
              <Column key={item.id} lg={5} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Header */}
                    <div>
                      <h6 className="cds--type-heading-03" style={{ margin: 0, marginBottom: "0.5rem" }}>
                        {item.eminence_type || "Eminence item"}
                      </h6>
                      <p
                        className="cds--type-body-01"
                        style={{
                          color: "#525252",
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {item.description || "No description provided."}
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {/* Scope Detail */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Scope</span>
                          <Tag type="gray" size="sm">
                            {item.scope || "Scope not set"}
                          </Tag>
                        </div>

                        {/* ID Detail */}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Reference ID</span>
                          <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Link */}
                    {item.url && (
                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "0.75rem" }}>
                        <CarbonLink
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Contribution
                        </CarbonLink>
                      </div>
                    )}
                  </div>
                </Tile>
              </Column>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
}
