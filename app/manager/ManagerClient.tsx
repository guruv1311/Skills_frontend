// app/manager/ManagerClient.tsx
"use client";

import Provider from "@/app/components/Providers";
import NavBar from "@/app/components/NavBar";
import { ProfileSummary } from "./types";
import React, { useEffect, useState } from "react";
import ManagerProfileTab from "./components/ManagerProfileTab";
import ManagerTeamOverviewTab from "./components/ManagerTeamOverviewTab";
import ManagerSkillsTab from "./components/ManagerSkillsTab";
import {
  fetchAllReporteeDetails,
  ReporteeDetail,
} from "./services/ReporteeDetails";
import TabPanel from "@/app/consultant/components/TabPanel";
import WatsonxChatWidget from "@/app/components/WatsonxChatWidget";

export default function ManagerClient({
  profile,
  initialBearerToken,
}: {
  profile: ProfileSummary | null;
  initialBearerToken: string;
}) {
  const p = profile ?? {};
  const role = p.role ?? "Manager";
  const initials = (p.name || "M")
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  console.log("Profile details", p);
  const [tabIndex, setTabIndex] = useState(0);

  // manager-specific tabs
  const managerTabs = ["Profile", "Team Overview", "Skills"];

  const [reportees, setReportees] = useState<ReporteeDetail[] | null>(null);
  const [loadingReportees, setLoadingReportees] = useState(true);
  const [reporteesError, setReporteesError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we haven't already fetched (reportees === null)
    if (reportees === null) {
      setLoadingReportees(true);

      fetchAllReporteeDetails()
        .then((data) => {
          setReportees(data);
          setReporteesError(null);
        })
        .catch((err) => {
          console.error("Failed fetching reportees:", err);
          setReporteesError("Could not load team data.");
          setReportees([]); // Set empty array on error
        })
        .finally(() => setLoadingReportees(false));
    }
  }, [reportees]);

  return (
    <Provider>
      <NavBar
        role={role}
        tabs={managerTabs}
        tabIndex={tabIndex}
        onTabChange={setTabIndex}
      />

      <div
        style={{
          backgroundColor: "#f4f4f4",
          minHeight: "100vh",
          paddingBottom: "2rem",
          paddingTop: "4rem",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
          {/* TAB 0 : Manager Profile */}
          <TabPanel value={tabIndex} index={0}>
            <ManagerProfileTab
              p={p}
              role={role}
              initials={initials}
              reportees={reportees}
              loadingReportees={loadingReportees}
              reporteesError={reporteesError}
            />
          </TabPanel>

          {/* TAB 1 : Team Overview */}
          <TabPanel value={tabIndex} index={1}>
            <ManagerTeamOverviewTab />
          </TabPanel>

          {/* TAB 2 : My Skills */}
          <TabPanel value={tabIndex} index={2}>
            <ManagerSkillsTab userId={p.userId || ""} managerId={p.manager || ""} />
          </TabPanel>
        </div>
      </div>
      {/* <WatsonxChatWidget userId={p.email ?? "anonymous@ibm.com"} /> */}
      <WatsonxChatWidget
        userId={p.userId ?? "anonymous"}
        role={p.role ?? "Manager"}
      />
    </Provider>
  );
}
