"use client";

import React, { useEffect, useState } from "react";
import {
  Tile,
  Button,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Checkbox,
  Tag,
  Loading,
  Grid,
  Column,
} from "@carbon/react";
import { Renew, Launch } from "@carbon/icons-react";
import { ProjectForm } from "../types";

// type ProjectItem = {
//   projectId?: string;
//   name?: string;
//   client?: string;
//   technology?: string;
//   role?: string;
//   description?: string;
//   contribution?: string;
//   isFoak?: boolean;
//   assetUsed?: string;
//   assetName?: string;
//   assetDescription?: string;
//   assetLink?: string;
//   status?: string;
//   id?: number | string;
// };
export default function ConsultantProjectsTab({
  projectForm,
  updateProjectField,
  resetProjectForm,
  /**
   * Called when the user clicks "Add to Submit".
   * Parent should accept the ProjectForm and add it to the pending queue.
   */
  onAddToPending,
  techOptions = [],
  userId,
}: {
  projectForm: ProjectForm;
  updateProjectField: (field: keyof ProjectForm, value: any) => void;
  resetProjectForm: () => void;
  onAddToPending: (payload: ProjectForm) => void;
  techOptions?: string[];
  userId?: string;
}) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Fetch projects from /api/project (array or single object)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) {
        console.warn('No userId provided to ConsultantProjectsTab');
        setProjects([]);
        return;
      }

      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/project?user_id=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`API returned ${res.status}: ${txt}`);
        }
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [data];
        if (mounted) setProjects(arr);
      } catch (e: any) {
        console.error("Failed to load projects:", e);
        if (mounted) setErr(e?.message ?? "Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [reloadKey, userId]);

  const handleAddToPending = () => {
    // Basic validation
    if (
      !projectForm.name.trim() ||
      !projectForm.client.trim() ||
      !projectForm.role.trim()
    ) {
      alert(
        "Please fill Project name, Client name and Your role before adding to submission."
      );
      return;
    }
    // Normalize empty optional fields to "" to avoid controlled/uncontrolled issues
    const normalized: ProjectForm = {
      name: projectForm.name ?? "",
      client: projectForm.client ?? "",
      technology: projectForm.technology ?? "",
      role: projectForm.role ?? "",
      description: projectForm.description ?? "",
      isFoak: !!projectForm.isFoak,
      assetUsed: projectForm.assetUsed ?? "",
      assetName: projectForm.assetName ?? "",
      status: projectForm.status ?? "draft",
      projectId: projectForm.projectId ?? "",
      contribution: projectForm.contribution ?? "",
      assetDescription: projectForm.assetDescription ?? "",
      assetLink: projectForm.assetLink ?? "",
      estimatedHours: projectForm.estimatedHours ?? "",
    };

    onAddToPending(normalized);
    // Optionally reset form after adding (if desired). Keep behavior consistent with your other forms:
    // resetProjectForm();
  };

  return (
    <div>
      <div style={{ width: "100%" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Add Project Information
        </h4>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
          Document your project experience. Add to submission queue — manager
          approval will be requested later.
        </p>

        <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff" }}>
          <Grid>
            {/* Project ID */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="project-id"
                labelText="Project ID"
                value={projectForm.projectId ?? ""}
                onChange={(e) =>
                  updateProjectField("projectId", e.target.value)
                }
                placeholder="e.g. PRJ-12345"
              />
            </Column>
            {/* Project name */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="project-name"
                labelText="Project name"
                value={projectForm.name ?? ""}
                onChange={(e) => updateProjectField("name", e.target.value)}
                placeholder="e.g. Cloud migration for RetailCo"
              />
            </Column>
            {/* Client */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="client-name"
                labelText="Client name"
                value={projectForm.client ?? ""}
                onChange={(e) => updateProjectField("client", e.target.value)}
                placeholder="e.g. RetailCo"
              />
            </Column>
            {/* Technology */}
            {/* <TextField
                label="Technology used"
                fullWidth
                value={projectForm.technology ?? ""}
                onChange={(e) =>
                  updateProjectField("technology", e.target.value)
                }
                placeholder="e.g. Kubernetes, React, Node.js"
              /> */}
            {/* Technology used -> converted to select */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="technology"
                labelText="Technology used"
                value={projectForm.technology ?? ""}
                onChange={(e) =>
                  updateProjectField("technology", e.target.value)
                }
                helperText="Select primary technology (or choose Other)."
              >
                <SelectItem value="" text="Select" />
                {techOptions.map((t) => (
                  <SelectItem key={t} value={t} text={t} />
                ))}
              </Select>
            </Column>
            {/* Description */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextArea
                id="project-description"
                labelText="Project description"
                value={projectForm.description ?? ""}
                onChange={(e) =>
                  updateProjectField("description", e.target.value)
                }
                placeholder="Describe the project scope, responsibilities, and outcomes."
                rows={2}
              />
            </Column>
            {/* Contribution */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextArea
                id="contribution"
                labelText="Your contribution"
                value={projectForm.contribution ?? ""}
                onChange={(e) =>
                  updateProjectField("contribution", e.target.value)
                }
                placeholder="Describe your individual contribution, responsibilities, and impact."
                rows={2}
              />
            </Column>
            {/* Role */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="role"
                labelText="Your role"
                value={projectForm.role ?? ""}
                onChange={(e) => updateProjectField("role", e.target.value)}
                placeholder="e.g. Lead Developer, Architect"
              />
            </Column>
            {/* FOAK */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Checkbox
                id="is-foak"
                labelText="This is a FOAK (First of a Kind) project"
                checked={!!projectForm.isFoak}
                onChange={(e) =>
                  updateProjectField("isFoak", e.target.checked)
                }
              />
            </Column>
            {/* Asset used select */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="asset-used"
                labelText="Asset/Accelerator used in project"
                value={projectForm.assetUsed ?? ""}
                onChange={(e) =>
                  updateProjectField(
                    "assetUsed",
                    e.target.value as ProjectForm["assetUsed"]
                  )
                }
              >
                <SelectItem value="" text="Select" />
                <SelectItem value="yes" text="Yes" />
                <SelectItem value="no" text="No" />
              </Select>
            </Column>
            {/* Conditional asset fields */}
            {projectForm.assetUsed === "yes" && (
              <>
                <Column lg={16} md={8} sm={4}>
                  <TextInput
                    id="asset-name"
                    labelText="Asset/Accelerator name"
                    value={projectForm.assetName ?? ""}
                    onChange={(e) =>
                      updateProjectField("assetName", e.target.value)
                    }
                    placeholder="e.g. Migration Toolkit, Custom Accelerator Name"
                  />
                </Column>

                <Column lg={16} md={8} sm={4}>
                  <TextArea
                    id="asset-description"
                    labelText="Asset/Accelerator description"
                    value={projectForm.assetDescription ?? ""}
                    onChange={(e) =>
                      updateProjectField("assetDescription", e.target.value)
                    }
                    placeholder="Describe what the asset/accelerator does and how it was used."
                    rows={3}
                  />
                </Column>

                <Column lg={16} md={8} sm={4}>
                  <TextInput
                    id="asset-link"
                    labelText="Asset/Accelerator link"
                    type="url"
                    value={projectForm.assetLink ?? ""}
                    onChange={(e) =>
                      updateProjectField("assetLink", e.target.value)
                    }
                    placeholder="e.g. https://github.com/org/repo or internal link"
                  />
                </Column>
              </>
            )}
          </Grid>
        </Tile>
        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Button kind="secondary" onClick={resetProjectForm}>
            Reset
          </Button>
          {/* Add to submit (push to pending queue in parent) */}
          <Button kind="primary" onClick={handleAddToPending}>
            Add to submit
          </Button>
        </div>
        {/* === Collection: "Your Projects" displayed below form */}
        {/* <Box sx={{ mt: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Your Projects</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : err ? (
          <Typography color="error">{err}</Typography>
        ) : !projects || projects.length === 0 ? (
          <Typography color="text.secondary">
            No projects found. After adding projects they will appear here.
          </Typography>
        ) : (
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {projects.map((p, i) => (
              <Card
                key={p.id ?? `${i}`}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        {p.name || p.projectId || "Untitled project"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {p.client || "Client not specified"}
                      </Typography>

                      {p.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {p.description.length > 180
                            ? `${p.description.slice(0, 180)}…`
                            : p.description}
                        </Typography>
                      )}

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        {p.technology ? (
                          <Chip label={p.technology} size="small" />
                        ) : null}
                        <Chip
                          label={p.isFoak ? "FOAK" : "Standard"}
                          size="small"
                          variant="outlined"
                        />
                        {p.assetUsed ? (
                          <Chip
                            label={
                              p.assetUsed === "yes" ? "Asset used" : "No asset"
                            }
                            size="small"
                          />
                        ) : null}
                        <Chip
                          label={`Status: ${p.status ?? "—"}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>

                    <Stack alignItems="flex-end" spacing={1}>
                      {p.assetLink ? (
                        <IconButton
                          component="a"
                          href={p.assetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="open asset"
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      ) : null}
                      <Typography variant="caption" color="text.secondary">
                        {p.projectId
                          ? `ID ${p.projectId}`
                          : p.id
                          ? `ID ${p.id}`
                          : ""}
                      </Typography>
                    </Stack>
                  </Stack>

                  {p.contribution && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 2 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-line" }}
                      >
                        {p.contribution.length > 220
                          ? `${p.contribution.slice(0, 220)}…`
                          : p.contribution}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box> */}

        {/* NEW HEADER STRUCTURE: Title and Subtitle */}
        <div style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h4 className="cds--type-heading-04" style={{ marginBottom: "0.25rem" }}>
                Your Projects
              </h4>
              <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
                Projects fetched from the server for your review.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                kind="tertiary"
                size="sm"
                renderIcon={Renew}
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Refresh
              </Button>
              <Button kind="ghost" size="sm" onClick={() => {
                // optional: open a page with all assets
              }}
              >
                View all
              </Button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
              <Loading />
            </div>
          ) : err ? (
            <p className="cds--type-body-01" style={{ color: "#da1e28" }}>{err}</p>
          ) : !projects || projects.length === 0 ? (
            <p className="cds--type-body-01" style={{ color: "#525252" }}>
              No projects found. After adding projects they will appear here.
            </p>
          ) : (
            <Grid>
              {/* Header with Title and Status Chip */}
              {projects.map((p, i) => (
                <Column key={p.id ?? `${i}`} lg={5} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                  <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h6 className="cds--type-heading-03" style={{ margin: 0 }}>
                          {p.project_name || p.projectId || "Untitled project"}
                        </h6>
                        {/* Status Chip (Reusing Status Logic from Sample 1) */}
                        <Tag
                          type={
                            (p.status || "").toLowerCase() === "approved"
                              ? "green"
                              : (p.status || "").toLowerCase() === "pending"
                                ? "magenta"
                                : (p.status || "").toLowerCase() === "rejected"
                                  ? "red"
                                  : "gray"
                          }
                          size="sm"
                        >
                          {p.status ?? "—"}
                        </Tag>
                      </div>
                      {/* Client Name / Subtitle */}
                      <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
                        Client: {p.client_name || "Not specified"}
                      </p>
                      {/* Technology Stack */}
                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="cds--type-body-01" style={{ color: "#525252" }}>Technology</span>
                            <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                              {p.tech_used || "N/A"}
                            </span>
                          </div>
                          {/* FOAK Status */}
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="cds--type-body-01" style={{ color: "#525252" }}>Type</span>
                            <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                              {p.isFoak ? "First-of-a-Kind (FOAK)" : "Standard"}
                            </span>
                          </div>
                          {/* Asset Usage */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="cds--type-body-01" style={{ color: "#525252" }}>Assets Used</span>
                            <Tag type={p.asset_used === "yes" ? "blue" : "gray"} size="sm">
                              {p.asset_used === "yes" ? "Asset Used" : "No Asset"}
                            </Tag>
                          </div>
                        </div>
                      </div>
                      {/* Contribution Description (Below Details) */}
                      {p.contribution && (
                        <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                          <p className="cds--type-label-01" style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                            Contribution:
                          </p>
                          <p className="cds--type-caption-01" style={{ color: "#525252", margin: 0 }}>
                            {p.contribution.length > 150
                              ? `${p.contribution.slice(0, 150)}…`
                              : p.contribution}
                          </p>
                        </div>
                      )}

                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="cds--type-caption-01" style={{ color: "#525252" }}>
                          {p.projectId
                            ? `Project ID: ${p.projectId}`
                            : p.id
                              ? `ID: ${p.id}`
                              : "ID not specified"}
                        </span>

                        {p.assetLink && (
                          <Button
                            as="a"
                            href={p.assetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            kind="ghost"
                            size="sm"
                            renderIcon={Launch}
                          >
                            Open Asset
                          </Button>
                        )}
                      </div>
                    </div>
                  </Tile>
                </Column>
              ))}
            </Grid>
          )}
        </div>
      </div>
    </div>
  );
}
