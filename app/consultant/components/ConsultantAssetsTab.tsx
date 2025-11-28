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
import type { AssetForm } from "../types";

export default function ConsultantAssetsTab({
  onAddToPending,
  initial,
  userId,
}: {
  onAddToPending?: (payload: AssetForm) => void;
  initial?: AssetForm;
  userId?: string;
}) {
  const [form, setForm] = useState<AssetForm>(
    initial ?? {
      name: "",
      description: "",
      usedInProject: "",
      aiAdoption: "",
      yourContribution: "",
      status: "draft",
    }
  );

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // Don't fetch if no userId
      if (!userId) {
        console.warn('No userId provided to ConsultantAssetsTab');
        setAssets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/asset?user_id=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`API returned ${res.status}: ${text}`);
        }
        const data = (await res.json()) as AssetForm[] | AssetForm;
        const arr = Array.isArray(data) ? data : [data];
        setAssets(arr);
        if (!mounted) return;
      } catch (e: any) {
        console.error("Failed to load assets:", e);
        if (mounted) setErr(e?.message ?? "Failed to load assets");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [reloadKey, userId]);

  const updateField = (k: keyof AssetForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      usedInProject: "",
      aiAdoption: "",
      yourContribution: "",
      status: "draft",
    });

  const addToPending = () => {
    if (!form.name.trim() || !form.description.trim()) {
      alert("Please provide asset name and description.");
      return;
    }
    const payload: AssetForm = { ...form, status: "draft" };
    if (onAddToPending) onAddToPending(payload);
    resetForm();
  };

  return (
    <div>
      <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
        Manage Assets & Accelerators
      </h4>
      <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
        Add assets and accelerators you have built and track their usage in
        projects.
      </p>

      <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff" }}>
        <Grid>
          <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
            <TextInput
              id="asset-name"
              labelText="Asset / Accelerator name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Migration Accelerator Toolkit"
            />
          </Column>

          <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
            <Select
              id="used-in-project"
              labelText="Used in project"
              value={form.usedInProject}
              onChange={(e) =>
                updateField(
                  "usedInProject",
                  e.target.value as AssetForm["usedInProject"]
                )
              }
            >
              <SelectItem value="" text="Select" />
              <SelectItem value="yes" text="Yes" />
              <SelectItem value="no" text="No" />
            </Select>
          </Column>

          <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
            <Select
              id="ai-adoption"
              labelText="AI adoption in asset"
              value={form.aiAdoption}
              onChange={(e) =>
                updateField(
                  "aiAdoption",
                  e.target.value as AssetForm["aiAdoption"]
                )
              }
            >
              <SelectItem value="" text="Select" />
              <SelectItem value="yes" text="Yes" />
              <SelectItem value="no" text="No" />
            </Select>
          </Column>

          <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
            <TextArea
              id="asset-description"
              labelText="Description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the asset or accelerator and how it is used."
              rows={3}
            />
          </Column>

          <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
            <TextArea
              id="your-contribution"
              labelText="Your Contribution"
              value={form.yourContribution}
              onChange={(e) => updateField("yourContribution", e.target.value)}
              placeholder="Describe your specific contribution to this asset."
              rows={2}
            />
          </Column>
        </Grid>
      </Tile>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <Button kind="secondary" onClick={resetForm}>
          Reset
        </Button>
        <Button kind="primary" onClick={addToPending}>
          Add to submit
        </Button>
      </div>

      {/* Your Assets Collection */}
      <div style={{ marginTop: "2rem" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Your Assets
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
            Assets fetched from the server for your review.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Renew}
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Refresh
            </Button>
            <Button kind="ghost" size="sm">
              View all
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <Loading />
          </div>
        ) : err ? (
          <p className="cds--type-body-01" style={{ color: "#da1e28", marginTop: "1rem" }}>
            {err}
          </p>
        ) : !assets || assets.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252", marginTop: "1rem" }}>
            No assets found. After adding assets they will appear here.
          </p>
        ) : (
          <Grid>
            {assets.map((a) => (
              <Column key={a.id} lg={5} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h6 className="cds--type-heading-03" style={{ margin: 0 }}>
                        {a.asset_name || `Asset ${a.id}`}
                      </h6>
                      <Tag
                        type={
                          (a.status || "").toLowerCase() === "approved"
                            ? "green"
                            : (a.status || "").toLowerCase() === "pending"
                              ? "magenta"
                              : (a.status || "").toLowerCase() === "rejected"
                                ? "red"
                                : "gray"
                        }
                        size="sm"
                      >
                        {a.status || "Draft"}
                      </Tag>
                    </div>

                    <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
                      {a.asset_desc && a.asset_desc.length > 80
                        ? a.asset_desc.substring(0, 80) + "..."
                        : a.asset_desc || "No description provided."}
                    </p>

                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Usage</span>
                          <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                            {a.used_in_project === "yes" ? "Used in project" : "Not used"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>AI Adoption</span>
                          <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                            {a.ai_adoption === "yes" ? "AI-powered" : "No AI"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Your Contribution</span>
                          <Tag type="gray" size="sm">
                            {a.your_contribution
                              ? a.your_contribution.substring(0, 20) + "..."
                              : "N/A"}
                          </Tag>
                        </div>
                      </div>
                    </div>

                    {a.url && (
                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "0.75rem" }}>
                        <CarbonLink
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Link
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
