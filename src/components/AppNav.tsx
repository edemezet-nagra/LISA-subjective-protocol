// Copyright (c) 2026 Nagravision SARL
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart2,
  Layers,
  BarChart,
  Menu,
  X,
} from "lucide-react";
import { useNavVisibility } from "@/contexts/NavVisibilityContext";

const ROUTES = [
  { path: "/v2", label: "LISA", icon: Layers },
  { path: "/v2/results", label: "LISA Results", icon: BarChart },
];

const NAV_VISIBLE_PATHS = ["/v2", "/v2/results"];

export function AppNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { navHidden } = useNavVisibility();

  if (!NAV_VISIBLE_PATHS.includes(location.pathname)) return null;
  if (navHidden) return null;

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg">
      {!collapsed &&
        ROUTES.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        title={collapsed ? "Show navigation" : "Hide navigation"}
      >
        {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </button>
    </nav>
  );
}
