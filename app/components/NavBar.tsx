"use client";

import { Button } from "@carbon/react";
import { Logout } from "@carbon/icons-react";
import "./navbar.css";

import { useAuth } from "../context/AuthContext";

type NavBarProps = {
  role: string;
  tabs: string[];
  tabIndex: number;
  onTabChange: (index: number) => void;
};

export default function NavBar({
  role,
  tabs,
  tabIndex,
  onTabChange,
}: NavBarProps) {
  const { logout } = useAuth();
  const dashboardLabel =
    role === "Manager" ? "Manager Dashboard" : "Consultant Dashboard";

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* LEFT: Logo + title + subtitle */}
        <div className="navbar-brand">
          <div className="navbar-brand-content">
            <h1 className="navbar-title">Skills Profile</h1>
            <p className="navbar-subtitle">{dashboardLabel}</p>
          </div>
        </div>

        {/* CENTER: Tabs as pill buttons */}
        <nav className="navbar-tabs">
          {tabs.map((label, index) => {
            const active = index === tabIndex;
            return (
              <Button
                key={label}
                kind={active ? "primary" : "ghost"}
                size="sm"
                onClick={() => onTabChange(index)}
                className="navbar-tab-button"
              >
                {label}
              </Button>
            );
          })}
        </nav>

        {/* RIGHT: Logout */}
        <div className="navbar-actions">
          <Button
            kind="tertiary"
            size="sm"
            onClick={handleLogout}
            renderIcon={Logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
