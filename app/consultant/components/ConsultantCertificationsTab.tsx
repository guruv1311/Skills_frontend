"use client";

import React, { useEffect, useState } from "react";
import {
  Tile,
  Button,
  Select,
  SelectItem,
  TextInput,
  Tag,
  Loading,
  Modal,
  Grid,
  Column,
  FileUploader,
} from "@carbon/react";
import { Upload, View } from "@carbon/icons-react";
import Link from "next/link";
import type { YourLearningCredentialSummary } from "../types";
import type { CertificationEntry } from "../types";
/**
 * Props:
 *  - onAddToPending: function that parent provides to add an item to the Form Submission queue.
 *      We call: onAddToPending({ kind: "certification", payload: CertificationEntry })
 */
export default function ConsultantCertificationsTab({
  onAddToPending,
  userId,
}: {
  onAddToPending: (item: {
    kind: "certification";
    payload: CertificationEntry;
  }) => void;
  userId?: string;
}) {
  // controlled cert form with explicit defaults to avoid controlled/uncontrolled issues
  const [certForm, setCertForm] = useState<CertificationEntry>({
    id: "",
    type: "" as CertificationEntry["type"],
    name: "",
    issueDate: "",
    fileName: "",
    fileDataUrl: undefined,
    status: "draft",
  });
  // state to hold yourLearning response nov 21
  const [ylLoading, setYlLoading] = useState(false);
  const [ylError, setYlError] = useState<string | null>(null);
  const [ylCredentials, setYlCredentials] = useState<
    YourLearningCredentialSummary[]
  >([]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // state for professional certifications
  const [profCerts, setProfCerts] = useState<any[]>([]);
  const [profLoading, setProfLoading] = useState(false);

  // Fetch professional certifications
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const loadProfCerts = async () => {
      try {
        setProfLoading(true);
        // Fetch from proxy endpoint which calls GET /api/user-cert/{user_id}
        const res = await fetch(`/api/user-cert/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            // Filter for Professional type if needed, or just display all returned
            // The user example showed "cert_type": "Professional"
            // We can filter or display all. The request said "display them as Professional certificates"
            // I'll assume the endpoint returns all, and I should filter/display them.
            setProfCerts(data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch professional certs", e);
      } finally {
        if (isMounted) setProfLoading(false);
      }
    };

    loadProfCerts();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // fetch on mount (or you can trigger only when Certification tab is active) nov 21
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setYlLoading(true);
        setYlError(null);
        const res = await fetch("/api/yourlearning");
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          const msg = json?.error || `YourLearning API returned ${res.status}`;
          throw new Error(msg);
        }
        const j = await res.json();
        if (!isMounted) return;
        // j.data.credentials is what your service returns
        setYlCredentials(j?.data?.credentials ?? []);
      } catch (err: any) {
        console.error("Failed loading YourLearning from client:", err);
        if (!isMounted) return;
        setYlError(err?.message || "Failed to load YourLearning data");
      } finally {
        if (isMounted) setYlLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = <K extends keyof CertificationEntry>(
    key: K,
    value: CertificationEntry[K]
  ) => {
    setCertForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    updateField("fileName", file.name);

    const reader = new FileReader();
    reader.onload = () => {
      // reader.result can be string (dataURL)
      updateField("fileDataUrl", reader.result as string | undefined);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setCertForm({
      id: "",
      type: "" as CertificationEntry["type"],
      name: "",
      issueDate: "",
      fileName: "",
      fileDataUrl: undefined,
      status: "draft",
    });
  };

  const handleAddToPending = () => {
    // validation
    if (!certForm.name.trim() || !certForm.type || !certForm.issueDate) {
      alert("Please fill Certification Type, Name, and Issue Date.");
      return;
    }
    // create a normalized CertificationEntry payload (parent will attach id/createdAt)
    const payload: CertificationEntry = {
      id: certForm.id || "",
      type: certForm.type || "",
      name: certForm.name || "",
      issueDate: certForm.issueDate || "",
      fileName: certForm.fileName || "",
      fileDataUrl: certForm.fileDataUrl,
      status: "draft", // add as draft to pending queue
    };
    // call parent
    onAddToPending({ kind: "certification", payload });
    // clear local form (optional)
    resetForm();
  };

  return (
    <>
      <Modal
        open={!!previewUrl}
        onRequestClose={() => setPreviewUrl(null)}
        modalHeading="Certification Preview"
        passiveModal
      >
        {previewUrl ? (
          previewUrl.startsWith("data:application/pdf") ? (
            <iframe src={previewUrl} width="100%" height="500px" title="PDF Preview" />
          ) : (
            <img
              src={previewUrl}
              alt="Certification preview"
              style={{ width: "100%", borderRadius: 8 }}
            />
          )
        ) : (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>No preview available</p>
        )}
      </Modal>

      
      {/* FORM */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ width: "100%" }}>
          <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
            Add Certification
          </h4>
          <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
            Submit your professional or product certifications for verification.
          </p>

          <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff" }}>
            <Grid>
              <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
                <Select
                  id="cert-type"
                  labelText="Certification type"
                  value={certForm.type ?? ""}
                  onChange={(e) =>
                    updateField(
                      "type",
                      e.target.value as CertificationEntry["type"]
                    )
                  }
                >
                  <SelectItem value="" text="Select" />
                  <SelectItem value="Professional" text="Professional" />
                  <SelectItem value="Product" text="Product" />
                </Select>
              </Column>

              <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
                <TextInput
                  id="cert-issue-date"
                  type="date"
                  labelText="Issue date"
                  value={certForm.issueDate ?? ""}
                  onChange={(e) => updateField("issueDate", e.target.value)}
                />
              </Column>

              <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
                <TextInput
                  id="cert-name"
                  labelText="Certification name"
                  value={certForm.name ?? ""}
                  placeholder="e.g. AWS Solutions Architect"
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </Column>

              <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
                <div style={{ marginTop: "0.5rem" }}>
                  <label className="cds--label" style={{ display: "block", marginBottom: "0.5rem" }}>Upload Certificate</label>
                  <Button
                    kind="tertiary"
                    renderIcon={Upload}
                    as="label"
                    style={{ width: "100%" }}
                  >
                    {certForm.fileName || "Choose file"}
                    <input
                      type="file"
                      hidden
                      accept="application/pdf,image/*"
                      onChange={handleFileUpload}
                    />
                  </Button>

                  {certForm.fileName && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <span className="cds--type-caption-01" style={{ color: "#525252" }}>
                        Selected: {certForm.fileName}
                      </span>
                      {certForm.fileDataUrl && (
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={View}
                          onClick={() =>
                            setPreviewUrl(certForm.fileDataUrl as string)
                          }
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Preview
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Column>
            </Grid>
          </Tile>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <Button kind="secondary" onClick={resetForm}>
              Reset
            </Button>
            {/* NOTE: Add-to-pending rather than direct submit */}
            <Button kind="primary" onClick={handleAddToPending}>
              Add to submit
            </Button>
          </div>
        </div>
      </div>
      {/* Professional Certifications Section */}
      <div style={{ marginBottom: "3rem" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Professional Certifications
        </h4>
        {profLoading ? (
          <Loading />
        ) : profCerts.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>No professional certifications found.</p>
        ) : (
          <Grid>
            {profCerts.map((cert, i) => (
              <Column key={cert.id || i} lg={5} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{cert.cert_name}</div>
                  <div className="cds--type-caption-01" style={{ color: "#525252", marginBottom: "0.5rem" }}>
                    {cert.issue_date}
                  </div>
                  <Tag type={cert.status === 'Approved' ? 'green' : cert.status === 'Rejected' ? 'red' : 'gray'}>
                    {cert.status || 'Pending'}
                  </Tag>
                </Tile>
              </Column>
            ))}
          </Grid>
        )}
      </div>

      {/* YourLearning / Credly credentials (below cert form) */}
      <div style={{ marginTop: "3rem" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          YourLearning Credentials
        </h4>
        {ylLoading ? (
          // <Typography color="text.secondary">Loading credentials…</Typography>
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <Loading />
          </div>
        ) : ylError ? (
          <p className="cds--type-body-01" style={{ color: "#da1e28" }}>{ylError}</p>
        ) : ylCredentials.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>No credentials found.</p>
        ) : (
          <Grid>
            {ylCredentials.map((c, i) => (
              <Column key={c.indexID ?? `cred-${i}`} lg={5} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
                        {c.iconUrl && (
                          <img
                            src={c.iconUrl}
                            alt={c.title ?? "cred"}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 4,
                              backgroundColor: "#f4f4f4",
                            }}
                          />
                        )}
                        <div>
                          <h6 className="cds--type-heading-03" style={{ margin: 0 }}>
                            {c.title ?? "Untitled"}
                          </h6>
                          <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
                            {c.presentationTypeId ?? "—"}
                          </p>
                        </div>
                      </div>
                      {c.iconUrl && (
                        <a
                          href={c.iconUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0f62fe" }}
                        >
                          <View size={20} />
                        </a>
                      )}
                    </div>
                    {/* Description */}
                    {/* {c.description && (
                      <Typography variant="body2" color="text.secondary">
                        {c.description}
                      </Typography>
                    )} */}

                    {/* Divider */}

                    {/* Details */}
                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Level</span>
                          <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                            {c.level ?? "—"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Status</span>
                          <Tag type={c.isActive ? "green" : "gray"} size="sm">
                            {c.isActive ? "Active" : "Inactive"}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tile>
              </Column>
            ))}
          </Grid>
        )}
      </div>
    </>
  );
}
