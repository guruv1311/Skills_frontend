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
  Grid,
  Column,
  Stack,
} from "@carbon/react";
import { TrashCan } from "@carbon/icons-react";
// nov 21
import { SkillForm } from "../types";
import {
  fetchSkillMetadata,
  SkillMetadata,
  getSegmentsForPlatform,
  getPortfoliosForSegment,
  getSpecialtiesForPortfolio,
} from "../services/skillMetadataService";

export default function ConsultantSkillsTab({
  skillForms,
  addNewSkillForm,
  updateSkillForm,
  removeSkillForm,
  submitAllSkills,
  onAddToPending,
  userId,
}: {
  skillForms: SkillForm[];
  addNewSkillForm: () => void;
  updateSkillForm: (
    index: number,
    field: keyof SkillForm,
    value: any
  ) => void;
  removeSkillForm: (index: number) => void;
  submitAllSkills: () => void;
  onAddToPending?: (item: { kind: "skill"; payload: SkillForm }) => void;
  userId?: string;
}) {
  const [metadata, setMetadata] = useState<SkillMetadata | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  // fetched "your skills" collection from /api/skills nov 21
  const [fetchedSkills, setFetchedSkills] = useState<any[]>([]);
  const [loadingFetched, setLoadingFetched] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // if true => hide Primary option in form nov 21
  const [hidePrimaryOption, setHidePrimaryOption] = useState(false);

  // Load metadata once on mount
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoadingMeta(true);
        setMetaError(null);
        const data = await fetchSkillMetadata();
        if (isMounted) setMetadata(data);
      } catch (err) {
        console.error("Failed to load skill metadata", err);
        if (isMounted) setMetaError("Unable to load skill options.");
      } finally {
        if (isMounted) setLoadingMeta(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch the user's existing skills collection when this component mounts
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!userId) {
        console.warn('No userId provided to ConsultantSkillsTab');
        setFetchedSkills([]);
        return;
      }

      setLoadingFetched(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/formSkill?user_id=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          const body = await res.text().catch(() => "<no body>");
          throw new Error(`API returned ${res.status}: ${body}`);
        }
        const data = await res.json();
        // normalize to array
        const arr = Array.isArray(data) ? data : [data];
        if (!isMounted) return;
        setFetchedSkills(arr);
        // detect primary presence
        const hasPrimary = arr.some(
          (it: any) =>
            (it.skill_type || it.skillType || "").toString().toLowerCase() ===
            "primary"
        );
        setHidePrimaryOption(hasPrimary);
        // If primary is present and some form entries currently have primary,
        // convert them to secondary so user can't choose primary after fetch rule.
        if (hasPrimary) {
          skillForms.forEach((sf, idx) => {
            // some older code used "skillType" etc so check both
            const cur = (sf as any).skillType || (sf as any).skill_type || "";
            if (cur === "primary") {
              updateSkillForm(idx, "skillType" as any, "secondary");
            }
          });
        }
      } catch (err: any) {
        console.error("Failed loading skills collection:", err);
        if (isMounted) setFetchError(err.message || "Unable to fetch skills.");
      } finally {
        if (isMounted) setLoadingFetched(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
    // NOTE: intentionally not depending on skillForms or updateSkillForm to keep single-load-on-mount behavior
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const hasNoMetadata = !metadata || (metadata.platforms?.length ?? 0) === 0;

  // helper validator for a single skill
  const validateSkill = (s: SkillForm) =>
    !!(
      s &&
      (s.years?.toString().trim() ?? "") !== "" &&
      ((s as any).skillType ||
        s.specialtyId ||
        s.platformId ||
        s.portfolioId ||
        s.segmentId ||
        s.years)
    );
  // add one skill to pending (calls parent)
  const addSkillToPending = (s: SkillForm) => {
    if (!onAddToPending) {
      alert("Add to Submit handler not configured.");
      return;
    }
    // Minimal validation: require years and at least a selection or speciality
    if (!s.years?.toString().trim()) {
      alert("Please provide Years of experience before adding.");
      return;
    }
    const payload: SkillForm = { ...s, status: (s.status as any) || "draft" };
    onAddToPending({ kind: "skill", payload });
  };
  // add all current skill forms to pending
  const addAllToPending = () => {
    if (!onAddToPending) {
      alert("Add to Submit handler not configured.");
      return;
    }
    // validate each
    const invalidIndex = skillForms.findIndex((s) => !validateSkill(s));
    if (invalidIndex !== -1) {
      alert(
        `Please fill required fields for Skill ${invalidIndex + 1
        } before adding all.`
      );
      return;
    }
    skillForms.forEach((s) =>
      onAddToPending({
        kind: "skill",
        payload: { ...s, status: (s.status as any) || "draft" },
      })
    );
    alert(`Added ${skillForms.length} skill(s) to Form Submission.`);
  };
  // Reset all skill forms to defaults by calling updateSkillForm for each index
  const resetAllForms = () => {
    skillForms.forEach((_, idx) => {
      updateSkillForm(idx, "platformId" as keyof SkillForm, "");
      updateSkillForm(idx, "segmentId" as keyof SkillForm, "");
      updateSkillForm(idx, "portfolioId" as keyof SkillForm, "");
      updateSkillForm(idx, "specialtyId" as keyof SkillForm, "");
      updateSkillForm(idx, "proficiency" as keyof SkillForm, "beginner");
      updateSkillForm(idx, "years" as keyof SkillForm, "");
      // skillType may not exist in your type — cast to avoid TS error
      const shouldBePrimary = idx === 0 && !hidePrimaryOption;
      updateSkillForm(
        idx,
        "skillType" as keyof SkillForm,
        shouldBePrimary ? "primary" : "secondary"
      );
    });
  };

  return (
    <div style={{ display: "grid", gap: "2rem", alignItems: "flex-start" }}>
      {/* LEFT: skill forms */}
      <div style={{ width: "100%" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Register New Skill
        </h4>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
          Add one or more skills to your profile. Use "Add to Submit" to queue
          them for manager approval.
        </p>

        {loadingMeta && (
          <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
            Loading skill options…
          </p>
        )}
        {metaError && (
          <p className="cds--type-body-01" style={{ color: "#da1e28", marginBottom: "1rem" }}>
            {metaError}
          </p>
        )}

        <Stack gap={5}>
          {skillForms.map((form, index) => {
            // ensure controlled values (avoid undefined)
            const fetchedHasPrimary = hidePrimaryOption;
            const otherFormHasPrimary = skillForms.some(
              (s, i) => i !== index && (s as any).skillType === "primary"
            );
            const isPrimaryAllowed = !fetchedHasPrimary && !otherFormHasPrimary;

            const skillType =
              (form as any).skillType ?? (isPrimaryAllowed ? "primary" : "secondary");
            const platformId = form.platformId ?? "";
            const segmentId = form.segmentId ?? "";
            const portfolioId = form.portfolioId ?? "";
            const specialtyId = form.specialtyId ?? "";
            const proficiency = form.proficiency ?? "beginner";
            const years = form.years ?? "";

            const platformOptions = metadata?.platforms ?? [];
            const segmentOptions = getSegmentsForPlatform(metadata, platformId);
            const portfolioOptions = getPortfoliosForSegment(
              metadata,
              platformId,
              segmentId
            );
            const specialtyOptions = getSpecialtiesForPortfolio(
              metadata,
              platformId,
              segmentId,
              portfolioId
            );

            return (
              <Tile key={index} style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h6 className="cds--type-heading-02">Skill {index + 1}</h6>
                  {/* <Typography variant="subtitle2" fontWeight={600}>
                      Skill {index + 1}
                    </Typography> */}
                  {skillForms.length > 1 && (
                    <Button
                      kind="danger--ghost"
                      size="sm"
                      renderIcon={TrashCan}
                      onClick={() => removeSkillForm(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {/* Skill Type (new) */}
                <Grid>
                  <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
                    <Select
                      id={`skill-type-${index}`}
                      labelText="Skill type"
                      value={skillType}
                      onChange={(e) =>
                        updateSkillForm(
                          index,
                          "skillType" as keyof SkillForm,
                          e.target.value
                        )
                      }
                    >

                      {(() => {
                        return (
                          <>
                            {(isPrimaryAllowed || skillType === "primary") && (
                              <SelectItem value="primary" text="Primary" />
                            )}
                            <SelectItem value="secondary" text="Secondary" />
                          </>
                        );
                      })()}
                    </Select>
                  </Column>
                  {/* Platform */}
                  <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
                    <Select
                      id={`platform-${index}`}
                      labelText="Platform"
                      value={platformId}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSkillForm(index, "platformId", value);
                        const selected = platformOptions.find((p) => p.id === value);
                        if (selected) {
                          updateSkillForm(index, "platformName", selected.name);
                        }
                        // reset dependent fields
                        updateSkillForm(index, "segmentId", "");
                        updateSkillForm(index, "segmentName", "");
                        updateSkillForm(index, "portfolioId", "");
                        updateSkillForm(index, "portfolioName", "");
                        updateSkillForm(index, "specialtyId", "");
                        updateSkillForm(index, "specialtyName", "");
                        updateSkillForm(index, "skillId", undefined);
                      }}
                      disabled={hasNoMetadata}
                    >
                      <SelectItem value="" text="Select platform" />
                      {platformOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id} text={p.name} />
                      ))}
                    </Select>
                  </Column>

                  <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
                    <Select
                      id={`segment-${index}`}
                      labelText="Segment"
                      value={segmentId}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSkillForm(index, "segmentId", value);
                        const selected = segmentOptions.find((s) => s.id === value);
                        if (selected) {
                          updateSkillForm(index, "segmentName", selected.name);
                        }
                        updateSkillForm(index, "portfolioId", "");
                        updateSkillForm(index, "portfolioName", "");
                        updateSkillForm(index, "specialtyId", "");
                        updateSkillForm(index, "specialtyName", "");
                        updateSkillForm(index, "skillId", undefined);
                      }}
                      disabled={!platformId || segmentOptions.length === 0}
                    >
                      <SelectItem value="" text="Select segment" />
                      {segmentOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id} text={s.name} />
                      ))}
                    </Select>
                  </Column>
                  {/* Product portfolio */}
                  <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
                    <Select
                      id={`portfolio-${index}`}
                      labelText="Product portfolio"
                      value={portfolioId}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSkillForm(index, "portfolioId", value);
                        const selected = portfolioOptions.find((p) => p.id === value);
                        if (selected) {
                          updateSkillForm(index, "portfolioName", selected.name);
                        }
                        updateSkillForm(index, "specialtyId", "");
                        updateSkillForm(index, "specialtyName", "");
                        updateSkillForm(index, "skillId", undefined);
                      }}
                      disabled={!segmentId || portfolioOptions.length === 0}
                    >
                      <SelectItem value="" text="Select portfolio" />
                      {portfolioOptions.map((pf) => (
                        <SelectItem key={pf.id} value={pf.id} text={pf.name} />
                      ))}
                    </Select>
                  </Column>
                  {/* Specialty area */}
                  <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
                    <Select
                      id={`specialty-${index}`}
                      labelText="Specialty area"
                      value={specialtyId}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSkillForm(index, "specialtyId", value);
                        const selected = specialtyOptions.find((s) => s.id === value);
                        if (selected) {
                          updateSkillForm(index, "specialtyName", selected.name);
                          updateSkillForm(index, "skillId", (selected as any).skill_id);
                        }
                      }}
                      disabled={!portfolioId || specialtyOptions.length === 0}
                    >
                      <SelectItem value="" text="Select specialty" />
                      {specialtyOptions.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id} text={sp.name} />
                      ))}
                    </Select>
                  </Column>
                  {/* Proficiency */}
                  <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
                    <Select
                      id={`proficiency-${index}`}
                      labelText="Proficiency level"
                      value={proficiency}
                      onChange={(e) =>
                        updateSkillForm(
                          index,
                          "proficiency",
                          e.target.value as SkillForm["proficiency"]
                        )
                      }
                    >
                      <SelectItem value="beginner" text="Beginner" />
                      <SelectItem value="intermediate" text="Intermediate" />
                      <SelectItem value="expert" text="Expert" />
                    </Select>
                  </Column>
                  {/* Years of experience */}
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id={`years-${index}`}
                      labelText="Years of experience"
                      type="number"
                      min={0}
                      value={years}
                      onChange={(e) =>
                        updateSkillForm(index, "years", e.target.value)
                      }
                      placeholder="e.g. 3"
                    />
                  </Column>
                </Grid>
              </Tile>
            );
          })}
        </Stack>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Button kind="secondary" onClick={resetAllForms}>
            Reset
          </Button>
          <Button kind="primary" onClick={addAllToPending}>
            Add to Submit
          </Button>
        </div>
      </div>

      {/* RIGHT: "Your Skills" collection rendered as cards (2-3 per row) */}
      <div style={{ marginTop: "2rem" }}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Your Skills
        </h4>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
          Skills fetched from the server for your review.
        </p>

        {loadingFetched ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <Loading />
          </div>
        ) : fetchError ? (
          <p className="cds--type-body-01" style={{ color: "#da1e28" }}>{fetchError}</p>
        ) : fetchedSkills.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>No skills yet.</p>
        ) : (
          <Grid>
            {fetchedSkills.map((s: any, i: number) => (
              <Column key={i} lg={5} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Tile style={{ padding: "1.5rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h6 className="cds--type-heading-03" style={{ margin: 0 }}>
                        {s.speciality_area ||
                          s.speciality ||
                          s.product_portfolio ||
                          `Skill ${i + 1}`}
                      </h6>
                      <Tag
                        type={
                          (s.status || s.state) === "approved"
                            ? "green"
                            : (s.status || s.state) === "pending"
                              ? "magenta"
                              : (s.status || s.state) === "rejected"
                                ? "red"
                                : "gray"
                        }
                        size="sm"
                      >
                        {s.status || s.state || "—"}
                      </Tag>
                    </div>
                    {/* Platform and Segment */}
                    <p className="cds--type-body-01" style={{ color: "#525252", margin: 0 }}>
                      {s.platform || s.platformId || "Platform not set"} •{" "}
                      {s.segment || s.segmentId || "Segment not set"}
                    </p>
                    {/* Details Grid */}
                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Portfolio</span>
                          <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                            {s.product_portfolio || s.portfolio || "—"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Type</span>
                          <span className="cds--type-body-01" style={{ fontWeight: 500 }}>
                            {s.skill_type || s.skillType || "—"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="cds--type-body-01" style={{ color: "#525252" }}>Proficiency</span>
                          <Tag
                            type={
                              (s.proficiency_level || s.proficiency) === "expert"
                                ? "green"
                                : (s.proficiency_level || s.proficiency) === "intermediate"
                                  ? "blue"
                                  : "gray"
                            }
                            size="sm"
                          >
                            {s.proficiency_level || s.proficiency || "—"}
                          </Tag>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
                      <span className="cds--type-caption-01" style={{ color: "#525252" }}>
                        {s.yoe
                          ? `${s.yoe} years`
                          : s.years
                            ? `${s.years} years`
                            : "Years not specified"}
                      </span>
                      {s.date && (
                        <>
                          <span className="cds--type-caption-01" style={{ color: "#525252" }}>•</span>
                          <span className="cds--type-caption-01" style={{ color: "#525252" }}>
                            {new Date(s.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </>
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
  );
}
