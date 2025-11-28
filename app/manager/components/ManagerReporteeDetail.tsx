"use client";

import React from "react";
import {
    Grid,
    Column,
    Tile,
    ProgressBar,
    Tag,
} from "@carbon/react";
import { Certificate, User, ChartLine } from "@carbon/icons-react";
import { ReporteeDetail } from "../services/ReporteeDetails";

import ApprovedItemCard from "./ApprovedItemCard";

interface Props {
    reportee: ReporteeDetail;
    managerId: string;
    onRefresh?: () => void;
}

export default function ManagerReporteeDetail({ reportee, managerId, onRefresh }: Props) {
    // Mock performance/score if missing
    const performance = 70 + (reportee.userId.charCodeAt(reportee.userId.length - 1) % 30);
    const profileScore = 70 + (reportee.userId.charCodeAt(0) % 25);

    // Filter and map pending items
    const getPendingItems = () => {
        const pendingItems: any[] = [];

        // Skills
        reportee.skills?.forEach((skill: any, idx: number) => {
            if (skill.status === 'pending') {
                pendingItems.push({
                    id: skill.id || `skill-${idx}`,
                    status: 'pending',
                    name: `${skill.platform} - ${skill.proficiency_level}`,
                    type: 'Skill',
                    user_id: reportee.userId,
                    user_name: reportee.name,
                    manager_id: managerId,
                    submission_date: skill.submission_date || new Date().toISOString().split('T')[0],
                    request_data: JSON.stringify({ id: skill.id, proficiency: skill.proficiency_level }),
                    proficiency_level: skill.proficiency_level
                });
            }
        });

        // Projects
        reportee.projects?.forEach((proj: any, idx: number) => {
            if (proj.status === 'pending') {
                pendingItems.push({
                    id: proj.id || `proj-${idx}`,
                    status: 'pending',
                    name: proj.project_name,
                    type: 'Project',
                    user_id: reportee.userId,
                    user_name: reportee.name,
                    manager_id: managerId,
                    submission_date: proj.submission_date || new Date().toISOString().split('T')[0],
                    request_data: JSON.stringify({ id: proj.id, role: proj.your_role }),
                    client_name: proj.client_name
                });
            }
        });

        // Certifications
        reportee.certifications?.forEach((cert: any, idx: number) => {
            if (cert.status?.toLowerCase() === 'pending') {
                pendingItems.push({
                    id: cert.id || `cert-${idx}`,
                    status: 'pending',
                    name: cert.cert_name,
                    type: 'Certification',
                    user_id: reportee.userId,
                    user_name: reportee.name,
                    manager_id: managerId,
                    submission_date: cert.submission_date || new Date().toISOString().split('T')[0],
                    request_data: JSON.stringify({ id: cert.id, cert_id: cert.cert_id || cert.id })
                });
            }
        });

        // Assets
        reportee.assets?.forEach((asset: any, idx: number) => {
            if (asset.status === 'pending') {
                pendingItems.push({
                    id: asset.id || `asset-${idx}`,
                    status: 'pending',
                    name: asset.asset_name,
                    type: 'Asset',
                    user_id: reportee.userId,
                    user_name: reportee.name,
                    manager_id: managerId,
                    submission_date: asset.submission_date || new Date().toISOString().split('T')[0],
                    request_data: JSON.stringify({ id: asset.id, asset_desc: asset.asset_desc }),
                    asset_desc: asset.asset_desc
                });
            }
        });

        // // Professional Eminence
        // reportee.professional_eminence?.forEach((em: any, idx: number) => {
        //     // Backend doesn't support status for eminence yet, so treat missing status as pending
        //     if (!em.status || em.status === 'pending') {
        //         pendingItems.push({
        //             id: em.id || `em-${idx}`,
        //             status: 'pending',
        //             name: em.eminence_type,
        //             type: 'Eminence',
        //             user_id: reportee.userId,
        //             user_name: reportee.name,
        //             manager_id: managerId,
        //             submission_date: em.submission_date || new Date().toISOString().split('T')[0],
        //             request_data: JSON.stringify({ id: em.id, description: em.description }),
        //             description: em.description
        //         });
        //     }
        // });

        return pendingItems;
    };

    const pendingItems = getPendingItems();

    return (
        <div className="manager-reportee-detail">
            {/* Header Profile Card */}
            <Tile className="profile-header-tile" style={{ marginBottom: "1.5rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                backgroundColor: "#f4f4f4",
                                border: "1px solid #e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                fontWeight: 600,
                                color: "#525252",
                                overflow: "hidden"
                            }}
                        >
                            {reportee.avatarDataUrl ? (
                                <img src={reportee.avatarDataUrl} alt={reportee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                (reportee.name || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className="cds--type-heading-03" style={{ marginBottom: "0.25rem" }}>{reportee.name}</h3>
                            <Tag type="blue">{reportee.designation || "Consultant"}</Tag>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span className="cds--type-label-01">Profile Completion</span>
                        <span className="cds--type-label-01" style={{ fontWeight: 600 }}>{performance}%</span>
                    </div>
                    <ProgressBar
                        value={performance}
                        max={100}
                        size="big"
                        label=""
                        hideLabel
                    />
                </div>

                <Grid style={{ marginTop: "1.5rem", borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                    <Column lg={8} md={4} sm={4}>
                        <div style={{ marginBottom: "0.5rem" }} className="cds--type-label-01">Email</div>
                        <div className="cds--type-body-01">{reportee.email || "—"}</div>
                    </Column>
                    {/* <Column lg={8} md={4} sm={4}>
                        <div style={{ marginBottom: "0.5rem" }} className="cds--type-label-01">Phone</div>
                        <div className="cds--type-body-01">{reportee.phone || "—"}</div>
                    </Column> */}
                </Grid>
            </Tile>

            {/* Pending Approvals Section */}
            {pendingItems.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h4 className="cds--type-heading-03" style={{ marginBottom: "1rem" }}>Pending Approvals</h4>
                    {pendingItems.map((item) => (
                        <ApprovedItemCard
                            key={item.id}
                            item={item}
                            onDecision={onRefresh}
                        />
                    ))}
                </div>
            )}

            {/* Primary Skills Section */}
            <Tile style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <h4 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>Primary Skills</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {reportee.skills && reportee.skills.filter((s: any) => s.skill_type?.toLowerCase() === 'primary').length > 0 ? (
                        reportee.skills.filter((s: any) => s.skill_type?.toLowerCase() === 'primary').map((skill: any, idx: number) => (
                            <Tag key={idx} type="blue">
                                {skill.platform}
                            </Tag>
                        ))
                    ) : (
                        <p className="cds--type-body-01" style={{ color: "#525252" }}>No primary skills listed.</p>
                    )}
                </div>
            </Tile>

            {/* Secondary Skills Section */}
            <Tile style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <h4 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>Secondary Skills</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {reportee.skills && reportee.skills.filter((s: any) => s.skill_type?.toLowerCase() === 'secondary').length > 0 ? (
                        reportee.skills.filter((s: any) => s.skill_type?.toLowerCase() === 'secondary').map((skill: any, idx: number) => (
                            <Tag key={idx} type="gray">
                                {skill.platform}
                            </Tag>
                        ))
                    ) : (
                        <p className="cds--type-body-01" style={{ color: "#525252" }}>No secondary skills listed.</p>
                    )}
                </div>
            </Tile>

            {/* Professional Certifications Section */}
            <Tile style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <h4 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>Professional Certifications</h4>
                {reportee.certifications && reportee.certifications.filter((c: any) => (c.cert_type === 'Professional' || c.cert_type === 'Certification') && c.status?.toLowerCase() === 'approved').length > 0 ? (
                    <Grid>
                        {reportee.certifications.filter((c: any) => (c.cert_type === 'Professional' || c.cert_type === 'Certification') && c.status?.toLowerCase() === 'approved').map((cert: any, idx: number) => (
                            <Column lg={16} md={8} sm={4} key={idx} style={{ marginBottom: "1rem" }}>
                                <div style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{cert.cert_name}</div>
                                    <div className="cds--type-caption-01" style={{ color: "#525252" }}>{cert.issue_date || "No date"}</div>
                                </div>
                            </Column>
                        ))}
                    </Grid>
                ) : (
                    <p className="cds--type-body-01" style={{ color: "#525252" }}>No approved professional certifications listed.</p>
                )}
            </Tile>

            {/* Projects Section */}
            <Tile style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <h4 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>Recent Projects</h4>
                {reportee.projects && reportee.projects.length > 0 ? (
                    <Grid>
                        {reportee.projects.map((proj: any, idx: number) => (
                            <Column lg={16} md={8} sm={4} key={idx} style={{ marginBottom: "1rem" }}>
                                <div style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{proj.project_name}</div>
                                    <div className="cds--type-body-01" style={{ marginBottom: "0.5rem" }}>
                                        <span style={{ color: "#525252" }}>Client: </span>{proj.client_name}
                                        <span style={{ margin: "0 0.5rem", color: "#e0e0e0" }}>|</span>
                                        <span style={{ color: "#525252" }}>Role: </span>{proj.your_role}
                                    </div>
                                </div>
                            </Column>
                        ))}
                    </Grid>
                ) : (
                    <p className="cds--type-body-01" style={{ color: "#525252" }}>No projects listed.</p>
                )}
            </Tile>

            {/* Professional Eminence Section */}
            <Tile style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <h4 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>Professional Eminence</h4>
                {reportee.professional_eminence && reportee.professional_eminence.length > 0 ? (
                    <Grid>
                        {reportee.professional_eminence.map((em: any, idx: number) => (
                            <Column lg={16} md={8} sm={4} key={idx} style={{ marginBottom: "1rem" }}>
                                <div style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{em.eminence_type}</div>
                                    <div className="cds--type-body-01" style={{ marginBottom: "0.5rem" }}>
                                        {em.description}
                                    </div>
                                    {em.url && (
                                        <a href={em.url} target="_blank" rel="noopener noreferrer" className="cds--link">
                                            View Evidence
                                        </a>
                                    )}
                                </div>
                            </Column>
                        ))}
                    </Grid>
                ) : (
                    <p className="cds--type-body-01" style={{ color: "#525252" }}>No eminence records listed.</p>
                )}
            </Tile>
            {/* Assets Section */}
            <Tile style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <h4 className="cds--type-heading-02" style={{ marginBottom: "1rem" }}>Assets</h4>
                {reportee.assets && reportee.assets.length > 0 ? (
                    <Grid>
                        {reportee.assets.map((asset: any, idx: number) => (
                            <Column lg={16} md={8} sm={4} key={idx} style={{ marginBottom: "1rem" }}>
                                <div style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{asset.asset_name}</div>
                                    <div className="cds--type-body-01" style={{ marginBottom: "0.5rem" }}>
                                        {asset.asset_desc}
                                    </div>
                                </div>
                            </Column>
                        ))}
                    </Grid>
                ) : (
                    <p className="cds--type-body-01" style={{ color: "#525252" }}>No assets listed.</p>
                )}
            </Tile>
        </div>
    );
}
