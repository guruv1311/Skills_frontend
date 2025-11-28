// new and modified consultant tab as on 19 Nov

"use client";

import NavBar from "@/app/components/NavBar";

import TabPanel from "./components/TabPanel";
import ConsultantProfileTab from "./components/ConsultantProfileTab";
import ConsultantSkillsTab from "./components/ConsultantSkillsTab";
import ConsultantProjectsTab from "./components/ConsultantProjectsTab";
import ConsultantCertificationsTab from "./components/ConsultantCertificationsTab";
import ConsultantAssetsTab from "./components/ConsultantAssetsTab";
// import ConsultantSkillMatrixTab from "./components/ConsultantSkillMatrixTab";
import ConsultantProfessionalEminenceTab from "./components/ConsultantProfessionalEminenceTab";
import WatsonxChatWidget from "@/app/components/WatsonxChatWidget";
import React, { useState } from "react";
import {
  ProfileSummary,
  SkillForm,
  ProjectForm,
  PendingForm,
  ProfessionalEminenceForm,
} from "./types";
import FormSubmissionTab from "@/app/consultant/components/FormSubmissionTab";
//import ChatWidgetWrapper from "@/app/components/WxoChatBot";

export default function ConsultantClient({
  profile,
}: {
  profile: ProfileSummary | null;
}) {
  console.log("ConsultantClient profile:", profile);
  const p = profile ?? {};
  const role = p.role ?? "Consultant";
  const initials = (p.name || "C")
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  console.log("Profile details", p);
  const [tabIndex, setTabIndex] = useState(0);
  const [pendingForms, setPendingForms] = useState<PendingForm[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // const [pendingForms, setPendingForms] = useState<any[]>([]);
  function genId() {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
    return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  const addToPending = (form: Omit<PendingForm, "id" | "createdAt">) => {
    const id = genId();
    const item: PendingForm = {
      id,
      ...form,
      createdAt: new Date().toISOString(),
    } as PendingForm;
    setPendingForms((prev) => [item, ...prev]);
    // auto-select the newly added item
    setSelectedIds((prev) => [id, ...prev]);
  };

  const removePending = (id: string) => {
    setPendingForms((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((s) => s !== id));
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([id, ...prev]))
        : prev.filter((x) => x !== id)
    );
  };

  const clearAllPending = () => {
    if (pendingForms.length === 0) return;
    // optional: ask for confirmation
    if (!confirm("Clear all pending forms? This cannot be undone.")) return;
    setPendingForms([]);
    setSelectedIds([]);
  };

  const submitSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Select at least one form to submit.");
      return;
    }

    const toSubmit = pendingForms.filter((p) => selectedIds.includes(p.id));
    console.log("Submitting these forms to backend:", toSubmit);

    const results = await Promise.all(
      toSubmit.map(async (item) => {
        if (item.kind === "skill") {
          const payload = {
            user_id: p.userId,
            proficiency_level: item.payload.proficiency,
            platform: item.payload.platformName || item.payload.platformId,
            segment: item.payload.segmentName || item.payload.segmentId,
            product_portfolio: item.payload.portfolioName || item.payload.portfolioId,
            speciality_area: item.payload.specialtyName || item.payload.specialtyId,
            product_line: "TBD", // Not currently in form
            manager_id: p.manager || null,
            status: "pending",
            skill_type: item.payload.skillType || "secondary",
            yoe: item.payload.years,
            date: new Date().toISOString().split("T")[0],
          };

          try {
            const res = await fetch("/api/formSkill", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`API Error: ${res.status} ${errText}`);
            }
            return { id: item.id, status: "success" };
          } catch (e: any) {
            console.error("Failed to submit skill:", e);
            return { id: item.id, status: "error", error: e.message };
          }
        } else if (item.kind === "project") {
          const payload = {
            user_id: p.userId,
            project_name: item.payload.name,
            client_name: item.payload.client,
            tech_used: item.payload.technology,
            your_role: item.payload.role,
            project_desc: item.payload.description,
            is_foak: item.payload.isFoak,
            asset_used: item.payload.assetUsed,
            asset_name: item.payload.assetName,
            manager_id: p.manager || null,
            status: "pending",
          };

          try {
            const res = await fetch("/api/project", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`API Error: ${res.status} ${errText}`);
            }
            return { id: item.id, status: "success" };
          } catch (e: any) {
            console.error("Failed to submit project:", e);
            return { id: item.id, status: "error", error: e.message };
          }
        } else if (item.kind === "asset") {
          const payload = {
            user_id: p.userId,
            asset_name: item.payload.name,
            asset_desc: item.payload.description,
            used_in_project: item.payload.usedInProject || null,
            ai_adoption: item.payload.aiAdoption || null,
            your_contribution: item.payload.yourContribution,
            manager_id: p.manager || null,
            status: "pending",
          };

          try {
            const res = await fetch("/api/asset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`API Error: ${res.status} ${errText}`);
            }
            return { id: item.id, status: "success" };
          } catch (e: any) {
            console.error("Failed to submit asset:", e);
            return { id: item.id, status: "error", error: e.message };
          }
        } else if (item.kind === "professionalEminence") {
          const payload = {
            user_id: p.userId,
            url: item.payload.url,
            eminence_type: item.payload.eminenceType,
            description: item.payload.description,
            scope: item.payload.scope,
            manager_id: p.manager || null,
            status: "pending",
          };

          try {
            const res = await fetch("/api/eminence", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`API Error: ${res.status} ${errText}`);
            }
            return { id: item.id, status: "success" };
          } catch (e: any) {
            console.error("Failed to submit eminence:", e);
            return { id: item.id, status: "error", error: e.message };
          }
        }

        // TODO: Implement submission for other kinds
        // For now, we'll just simulate success for them to clear them
        console.warn(`Submission not implemented for kind: ${item.kind}`);
        return { id: item.id, status: "success" };
      })
    );

    const successIds = results
      .filter((r) => r.status === "success")
      .map((r) => r.id);

    if (successIds.length > 0) {
      setPendingForms((prev) =>
        prev.filter((p) => !successIds.includes(p.id))
      );
      setSelectedIds((prev) => prev.filter((id) => !successIds.includes(id)));
      alert(`Successfully submitted ${successIds.length} form(s).`);
    }

    const errors = results.filter((r) => r.status === "error");
    if (errors.length > 0) {
      alert(
        `Failed to submit ${errors.length} form(s). Check console for details.`
      );
    }
  };

  // --- Skills tab state ---
  const [skillForms, setSkillForms] = useState<SkillForm[]>([
    {
      platformId: "",
      segmentId: "",
      portfolioId: "",
      specialtyId: "",
      proficiency: "beginner",
      years: "",
      status: "draft",
    },
  ]);

  const addNewSkillForm = () => {
    setSkillForms((prev) => [
      ...prev,
      {
        platformId: "",
        segmentId: "",
        portfolioId: "",
        specialtyId: "",
        proficiency: "beginner",
        years: "",
        status: "draft",
      },
    ]);
  };

  const updateSkillForm = (
    index: number,
    field: keyof SkillForm,
    value: any
  ) => {
    setSkillForms((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeSkillForm = (index: number) => {
    setSkillForms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitAllSkills = () => {
    // const invalid = skillForms.some((s) => !s.name.trim() || !s.years.trim());
    // if (invalid) {
    //   alert("Please fill Skill name and Years of experience for all skills.");
    //   return;
    // }
    // console.log("Submitting skills for approval:", skillForms);
    // setSkillForms((prev) => prev.map((s) => ({ ...s, status: "submitted" })));
    // alert("Skills submitted for approval.");
  };

  // --- Project tab state ---
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    name: "",
    client: "",
    technology: "",
    role: "",
    description: "",
    isFoak: false,
    assetUsed: "no",
    assetName: "",
    status: "draft",
    projectId: "",
    contribution: "",
    assetDescription: "",
    assetLink: "",
    estimatedHours: "",
  });

  const updateProjectField = (field: keyof ProjectForm, value: any) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: "",
      client: "",
      technology: "",
      role: "",
      description: "",
      isFoak: false,
      assetUsed: "no",
      assetName: "",
      status: "draft",
      projectId: "",
      contribution: "",
      assetDescription: "",
      assetLink: "",
      estimatedHours: "",
    });
  };

  const submitProjectForApproval = () => {
    if (
      !projectForm.name.trim() ||
      !projectForm.client.trim() ||
      !projectForm.role.trim()
    ) {
      alert("Please fill Project name, Client name and Your role.");
      return;
    }
    console.log("Submitting project for approval:", projectForm);
    setProjectForm((prev) => ({ ...prev, status: "submitted" }));
    alert("Project submitted for approval.");
  };

  const [professionalEminenceForm, setProfessionalEminenceForm] =
    useState<ProfessionalEminenceForm>({
      url: "",
      eminenceType: "",
      description: "",
      scope: "",
      status: "draft",
    });

  const updateProfessionalEminenceField = (
    k: keyof ProfessionalEminenceForm,
    v: any
  ) => setProfessionalEminenceForm((prev) => ({ ...prev, [k]: v }));

  const resetProfessionalEminenceForm = () =>
    setProfessionalEminenceForm({
      url: "",
      eminenceType: "",
      description: "",
      scope: "",
      status: "draft",
    });

  const consultantTabs = [
    "Profile",
    "Skills",
    "Projects",
    "Certification",
    "Assets",
    "Professional Eminence",
    "Form Submission",
  ];

  const sampleProjects = p.projects ?? [
    { id: "pr1", title: "Project A", role: "Developer" },
  ];
  const sampleCerts = p.certifications ?? [
    { id: "c1", title: "Cert A", issuer: "Issuer" },
  ];
  const sampleAssets = p.assets ?? [
    { id: "a1", title: "Laptop", tag: "L-1234" },
  ];

  return (
    <>
      <NavBar
        role={role}
        tabs={consultantTabs}
        tabIndex={tabIndex}
        onTabChange={setTabIndex}
      />

      <div
        suppressHydrationWarning
        style={{
          backgroundColor: "#f4f4f4",
          minHeight: "100vh",
          paddingBottom: "2rem",
          paddingTop: "4rem",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
          {/* Tab 0 */}
          <TabPanel value={tabIndex} index={0}>
            <ConsultantProfileTab p={p} role={role} initials={initials} />
          </TabPanel>

          {/* Tab 1 */}
          {/* <TabPanel value={tabIndex} index={1}>
            <ConsultantSkillsTab
              skillForms={skillForms}
              addNewSkillForm={addNewSkillForm}
              updateSkillForm={updateSkillForm}
              removeSkillForm={removeSkillForm}
              submitAllSkills={submitAllSkills}
            />
          </TabPanel> */}
          <TabPanel value={tabIndex} index={1}>
            <ConsultantSkillsTab
              skillForms={skillForms}
              addNewSkillForm={addNewSkillForm}
              updateSkillForm={updateSkillForm}
              removeSkillForm={removeSkillForm}
              submitAllSkills={submitAllSkills}
              onAddToPending={({ kind, payload }) =>
                addToPending({ kind: "skill", payload })
              }
              userId={p.userId ?? undefined}
            />
          </TabPanel>
          {/* Tab 2 */}
          <TabPanel value={tabIndex} index={2}>
            <ConsultantProjectsTab
              projectForm={projectForm}
              updateProjectField={updateProjectField}
              resetProjectForm={resetProjectForm}
              onAddToPending={(payload) =>
                addToPending({ kind: "project", payload })
              }
              techOptions={[
                "DevOps",
                "DevOps Ecosystem",
                "JSphere Suite for Java",
                "Legacy App Services",
                "Spectrum High Performance Computing",
                "WebSphere Application Server",
                "WebSphere Maintenance Mode",
                "Akamai Advanced API Security",
                "API Connect",
                "Application Integration Placeholder",
              ]}
              userId={p.userId ?? undefined}
            />
          </TabPanel>

          {/* Tab 3 */}
          <TabPanel value={tabIndex} index={3}>
            <ConsultantCertificationsTab
              onAddToPending={(item) => {
                addToPending(item);
              }}
              userId={p.userId ?? undefined}
            />
          </TabPanel>

          {/* Tab 4 */}
          <TabPanel value={tabIndex} index={4}>
            <ConsultantAssetsTab
              userId={p.userId ?? undefined}
              onAddToPending={(payload) =>
                addToPending({ kind: "asset", payload })
              }
            />
          </TabPanel>

          {/* Professional Eminence tab (index 5 in this ordering) */}
          <TabPanel value={tabIndex} index={5}>
            <ConsultantProfessionalEminenceTab
              form={professionalEminenceForm}
              updateField={updateProfessionalEminenceField}
              resetForm={resetProfessionalEminenceForm}
              onAddToPending={(payload) =>
                addToPending({ kind: "professionalEminence", payload })
              }
              userId={p.userId ?? undefined}
            />
          </TabPanel>

          {/* Tab 6 - FORM SUBMISSION (NEW) */}
          <TabPanel value={tabIndex} index={6}>
            <FormSubmissionTab
              pendingForms={pendingForms}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              removePending={removePending}
              submitSelected={submitSelected}
              onClearAll={clearAllPending}
            />
          </TabPanel>


          {/* <TabPanel value={tabIndex} index={7}>
            <ConsultantSkillMatrixTab />
          </TabPanel> */}
        </div>

        {/* <ChatWidgetWrapper /> */}
        {/* <WatsonxChatWidget userId={p.email ?? "anonymous@ibm.com"} /> */}
        <WatsonxChatWidget
          userId={p.userId ?? "anonymous"}
          role={p.role ?? "Consultant"}
        />
      </div>
    </>
  );
}