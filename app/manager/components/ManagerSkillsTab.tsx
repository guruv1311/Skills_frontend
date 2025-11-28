// app/manager/components/ManagerSkillsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Tile,
  Grid,
  Column,
  TextInput,
  Select,
  SelectItem,
  Button,
  Tag,
  InlineNotification,
} from "@carbon/react";

type SkillMetadata = {
  skill_id: number;
  platform: string;
  segment: string;
  product_portfolio: string;
  speciality_area: string;
};

type ManagerSkillForm = {
  skillType: "primary" | "secondary" | "";
  skillId: string; // To store selected skill ID
  platform: string;
  segment: string;
  product_portfolio: string;
  speciality_area: string;
  product_line: string;
  proficiency: "beginner" | "intermediate" | "expert";
  years: string;
  status?: "draft" | "submitted" | "pending";
};

export default function ManagerSkillsTab({ userId, managerId }: { userId: string; managerId: string }) {
  const [availableSkills, setAvailableSkills] = useState<SkillMetadata[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState<ManagerSkillForm>({
    skillType: "",
    skillId: "",
    platform: "",
    segment: "",
    product_portfolio: "",
    speciality_area: "",
    product_line: "",
    proficiency: "beginner",
    years: "",
    status: "draft",
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/skills/metadata");
        if (res.ok) {
          const data = await res.json();
          setAvailableSkills(data);
        } else {
          console.error("Failed to fetch skills metadata");
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const updateField = <K extends keyof ManagerSkillForm>(
    key: K,
    value: ManagerSkillForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const skill = availableSkills.find((s) => s.skill_id === selectedId);

    if (skill) {
      setForm((prev) => ({
        ...prev,
        skillId: skill.skill_id.toString(),
        platform: skill.platform,
        segment: skill.segment,
        product_portfolio: skill.product_portfolio,
        speciality_area: skill.speciality_area,
      }));
    } else {
      // Reset if cleared
      setForm((prev) => ({
        ...prev,
        skillId: "",
        platform: "",
        segment: "",
        product_portfolio: "",
        speciality_area: "",
      }));
    }
  };

  const handleReset = () => {
    setForm({
      skillType: "",
      skillId: "",
      platform: "",
      segment: "",
      product_portfolio: "",
      speciality_area: "",
      product_line: "",
      proficiency: "beginner",
      years: "",
      status: "draft",
    });
    setSubmitStatus(null);
  };

  const handleSubmit = async () => {
    if (!form.skillType || !form.platform || !form.years) {
      setSubmitStatus({ type: "error", message: "Please fill all required fields." });
      return;
    }

    setSubmitStatus(null);

    try {

      const payload = {
        user_id: userId || "current", // Use prop or fallback
        proficiency_level: form.proficiency,
        platform: form.platform,
        segment: form.segment,
        product_portfolio: form.product_portfolio,
        speciality_area: form.speciality_area,
        product_line: form.product_line || "N/A",
        manager_id: managerId || null, // Use prop or null
        status: "pending",
        skill_type: form.skillType,
        yoe: form.years,
        date: new Date().toISOString().split('T')[0]
      };

      const res = await fetch("/api/user-skills/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setForm((prev) => ({ ...prev, status: "submitted" }));
        setSubmitStatus({ type: "success", message: "Skill submitted successfully!" });
      } else {
        const errData = await res.json();
        setSubmitStatus({ type: "error", message: `Submission failed: ${errData.detail || "Unknown error"}` });
      }
    } catch (err) {
      console.error("Error submitting skill:", err);
      setSubmitStatus({ type: "error", message: "An error occurred during submission." });
    }
  };

  return (
    <Grid>
      {/* LEFT: Skill form */}
      <Column lg={8} md={8} sm={4}>
        <h4 className="cds--type-heading-04" style={{ marginBottom: "0.5rem" }}>
          Register New Skill
        </h4>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
          Add your own skills and proficiency levels. Your manager will be notified for approval.
        </p>

        {submitStatus && (
          <div style={{ marginBottom: "1rem" }}>
            <InlineNotification
              kind={submitStatus.type}
              title={submitStatus.type === "success" ? "Success" : "Error"}
              subtitle={submitStatus.message}
              onClose={() => setSubmitStatus(null)}
            />
          </div>
        )}

        <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff" }}>
          <Grid>
            {/* Skill type */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="skill-type"
                labelText="Skill type"
                value={form.skillType}
                onChange={(e) =>
                  updateField(
                    "skillType",
                    e.target.value as ManagerSkillForm["skillType"]
                  )
                }
              >
                <SelectItem value="" text="Select type" />
                <SelectItem value="primary" text="Primary" />
                <SelectItem value="secondary" text="Secondary" />
              </Select>
            </Column>

            {/* Skill Name (Platform) - Dynamic Dropdown */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="skill-name"
                labelText="Skill Name (Platform)"
                value={form.skillId}
                onChange={handleSkillChange}
                disabled={loadingSkills}
              >
                <SelectItem value="" text={loadingSkills ? "Loading skills..." : "Select a skill"} />
                {availableSkills.map((skill) => (
                  <SelectItem key={skill.skill_id} value={skill.skill_id} text={skill.platform} />
                ))}
              </Select>
            </Column>

            {/* Read-only fields populated from selection */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="segment"
                labelText="Segment"
                value={form.segment}
                readOnly
                placeholder="Auto-filled"
              />
            </Column>
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="speciality"
                labelText="Speciality Area"
                value={form.speciality_area}
                readOnly
                placeholder="Auto-filled"
              />
            </Column>

            {/* Product Line - Manual Input */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="product-line"
                labelText="Product Line"
                value={form.product_line}
                onChange={(e) => updateField("product_line", e.target.value)}
                placeholder="e.g. Cloud Pak for Data"
              />
            </Column>

            {/* Proficiency */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <Select
                id="proficiency"
                labelText="Proficiency level"
                value={form.proficiency}
                onChange={(e) =>
                  updateField(
                    "proficiency",
                    e.target.value as ManagerSkillForm["proficiency"]
                  )
                }
              >
                <SelectItem value="beginner" text="Beginner" />
                <SelectItem value="intermediate" text="Intermediate" />
                <SelectItem value="expert" text="Expert" />
              </Select>
            </Column>

            {/* Years of experience */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: "1.5rem" }}>
              <TextInput
                id="years"
                labelText="Years of experience"
                type="number"
                min={0}
                value={form.years}
                onChange={(e) => updateField("years", e.target.value)}
                placeholder="e.g. 5"
              />
            </Column>
          </Grid>
        </Tile>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <Button kind="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button kind="primary" onClick={handleSubmit} disabled={form.status === "submitted"}>
            Submit
          </Button>
        </div>
      </Column>

      {/* RIGHT: Summary */}
      <Column lg={8} md={8} sm={4}>
        <h6 className="cds--type-heading-03" style={{ marginBottom: "0.5rem" }}>
          Skill Summary
        </h6>
        <p className="cds--type-body-01" style={{ color: "#525252", marginBottom: "1rem" }}>
          Review your details before or after submission.
        </p>

        <Tile style={{ padding: "1.5rem", width: "100%", backgroundColor: "#ffffff", minHeight: "200px" }}>
          {!form.platform && !form.skillType && !form.years ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p className="cds--type-body-01" style={{ color: "#525252" }}>
                Fill the form on the left to see a summary here.
              </p>
            </div>
          ) : (
            <Tile style={{ padding: "1rem", backgroundColor: "#f4f4f4", border: "1px solid #e0e0e0" }}>
              <div className="cds--type-heading-02" style={{ fontWeight: 600 }}>
                {form.platform || "Skill not selected"}
              </div>

              <p className="cds--type-body-01" style={{ color: "#525252", marginTop: "0.25rem" }}>
                {form.years
                  ? `${form.years} year(s) of experience`
                  : "Years of experience not specified"}
              </p>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <Tag type={form.skillType === "primary" ? "blue" : "gray"} size="sm">
                  {form.skillType
                    ? form.skillType === "primary"
                      ? "Primary"
                      : "Secondary"
                    : "Type not selected"}
                </Tag>
                <Tag type="cool-gray" size="sm">
                  {form.segment ? form.segment : "Segment not loaded"}
                </Tag>
                <Tag
                  type={
                    form.proficiency === "expert"
                      ? "green"
                      : form.proficiency === "intermediate"
                        ? "cyan"
                        : "gray"
                  }
                  size="sm"
                >
                  {form.proficiency}
                </Tag>
              </div>

              {form.status && (
                <div style={{ marginTop: "1rem" }}>
                  <Tag
                    type={form.status === "submitted" ? "warm-gray" : "gray"}
                    size="sm"
                  >
                    {form.status === "submitted"
                      ? "Submitted"
                      : "Draft"}
                  </Tag>
                </div>
              )}
            </Tile>
          )}
        </Tile>
      </Column>
    </Grid>
  );
}
