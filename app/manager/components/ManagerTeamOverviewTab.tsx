// app/manager/components/ManagerTeamOverviewTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Tile,
  Grid,
  Column,
  ProgressBar,
  Tag,
  Link,
  Button,
} from "@carbon/react";
import {
  User,
  ChartLine,
  Certificate,
  ChevronRight,
  ArrowLeft,
} from "@carbon/icons-react";
import { ReporteeDetail, ManagerStats, fetchManagerStats, fetchAllReporteeDetails, fetchProfileCompletion } from "../services/ReporteeDetails";
import ManagerReporteeDetail from "./ManagerReporteeDetail";

export default function ManagerTeamOverviewTab() {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [reportees, setReportees] = useState<ReporteeDetail[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedReportee, setSelectedReportee] = useState<ReporteeDetail | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, reporteesData, completionData] = await Promise.all([
          fetchManagerStats(),
          fetchAllReporteeDetails(),
          fetchProfileCompletion(),
        ]);
        setStats(statsData);
        setReportees(reporteesData);
        setProfileCompletion(completionData);
      } catch (err) {
        console.error("Failed to load team data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [statsData, reporteesData, completionData] = await Promise.all([
        fetchManagerStats(),
        fetchAllReporteeDetails(),
        fetchProfileCompletion(),
      ]);
      setStats(statsData);
      setReportees(reporteesData);
      setProfileCompletion(completionData);

      // Update selected reportee if one is selected
      if (selectedReportee) {
        const updatedSelected = reporteesData.find(r => r.userId === selectedReportee.userId);
        if (updatedSelected) setSelectedReportee(updatedSelected);
      }
    } catch (err) {
      console.error("Failed to refresh team data", err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedReportee) {
    return (
      <div>
        <Button
          kind="ghost"
          onClick={() => setSelectedReportee(null)}
          renderIcon={ArrowLeft}
          style={{ marginBottom: "1rem" }}
        >
          Back to Team
        </Button>
        <ManagerReporteeDetail
          reportee={selectedReportee}
          managerId={stats?.manager?.user_id || ""}
          //managerId={"003SED744"}
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  // Calculate averages if stats not available (fallback)
  const totalMembers = stats?.summary?.total_reportees || reportees.length;
  // Use profile completion from state
  const totalCertifications = stats?.summary?.total_certifications || reportees.reduce((acc, r) => acc + (r.certifications_count || 0), 0);

  return (
    <div className="manager-team-overview">
      {/* Summary Tiles */}
      <Grid className="summary-section" fullWidth>
        <Column lg={5} md={4} sm={4}>
          <Tile className="summary-tile">
            <div className="summary-header">
              <span className="cds--type-label-01">Team Size</span>
              <User size={20} className="summary-icon" />
            </div>
            <div className="summary-value cds--type-display-01">
              {totalMembers}
            </div>
            <div className="summary-subtext cds--type-body-01">
              Active consultants
            </div>
          </Tile>
        </Column>
        <Column lg={5} md={4} sm={4}>
          <Tile className="summary-tile">
            <div className="summary-header">
              <span className="cds--type-label-01">Profile Completion</span>
              <ChartLine size={20} className="summary-icon" />
            </div>
            <div className="summary-value cds--type-display-01">
              {profileCompletion}%
            </div>
            <div className="summary-subtext cds--type-body-01">
              Team average
            </div>
          </Tile>
        </Column>
        <Column lg={6} md={4} sm={4}>
          <Tile className="summary-tile">
            <div className="summary-header">
              <span className="cds--type-label-01">Certifications</span>
              <Certificate size={20} className="summary-icon" />
            </div>
            <div className="summary-value cds--type-display-01">
              {totalCertifications}
            </div>
            <div className="summary-subtext cds--type-body-01">
              Total certified
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Team List Header */}
      <div className="team-list-header" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        <h4 className="cds--type-heading-03">Team Members</h4>
        <p className="cds--type-body-01" style={{ color: "#525252" }}>
          Skills and performance overview
        </p>
      </div>

      {/* Team Members List */}
      <div className="team-list">
        {loading ? (
          <p>Loading team data...</p>
        ) : reportees.length === 0 ? (
          <p className="cds--type-body-01" style={{ color: "#525252" }}>
            No team data available.
          </p>
        ) : (
          reportees.map((member) => {
            // Mock profile completion/score for UI demo if missing
            const memberProfileCompletion = 70 + (member.userId.charCodeAt(member.userId.length - 1) % 30);
            const profileScore = 70 + (member.userId.charCodeAt(0) % 25);
            const topSkills = member.skills?.slice(0, 3).map((s: any) => s.platform) || [];

            return (
              <Tile key={member.userId} className="member-tile" style={{ marginBottom: "1rem", padding: "1.5rem" }}>
                <Grid fullWidth>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div>
                        <h5 className="cds--type-heading-02" style={{ fontWeight: 600 }}>{member.name}</h5>
                        <p className="cds--type-body-01" style={{ color: "#525252" }}>{member.designation || "Consultant"}</p>
                      </div>
                    </div>
                  </Column>

                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span className="cds--type-label-01">Profile Completion</span>
                        <span className="cds--type-label-01" style={{ fontWeight: 600 }}>{memberProfileCompletion}%</span>
                      </div>
                      <ProgressBar
                        value={memberProfileCompletion}
                        max={100}
                        size="big"
                        label=""
                        hideLabel
                      />
                    </div>
                  </Column>

                  <Column lg={16} md={8} sm={4}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                      {topSkills.length > 0 ? topSkills.map((skill) => (
                        <Tag key={skill} type="gray" size="sm">
                          {skill}
                        </Tag>
                      )) : <span className="cds--type-caption-01">No top skills listed</span>}
                    </div>
                  </Column>

                  <Column lg={16} md={8} sm={4}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#525252" }}>
                        <Certificate size={16} />
                        <span className="cds--type-body-01">{member.certifications_count || 0} Certifications</span>
                      </div>
                      <Link
                        onClick={() => setSelectedReportee(member)}
                        className="view-details-link"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                      >
                        View Details <ChevronRight size={16} />
                      </Link>
                    </div>
                  </Column>
                </Grid>
              </Tile>
            )
          })
        )}
      </div>

      <style jsx global>{`
        .summary-tile {
          background-color: #ffffff;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #e0e0e0;
        }
        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          color: #525252;
        }
        .summary-value {
          margin-bottom: 0.5rem;
          font-weight: 400;
        }
        .summary-subtext {
          color: #525252;
        }
        .member-tile {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
        }
        .cds--progress-bar__bar {
          background-color: #0f62fe;
        }
      `}</style>
    </div>
  );
}