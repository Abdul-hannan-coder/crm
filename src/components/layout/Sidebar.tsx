"use client";

import { useState } from "react";
import {
  LayoutGrid,
  UserSquare2,
  Users,
  Building2,
  Target,
  CheckSquare,
  Briefcase,
  Sparkles,
  BarChart2,
  Activity,
  Mail,
  Settings,
  ChevronLeft,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@/types";

const mainTabs: { id: string; icon: LucideIcon; label: string }[] = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
  { id: "candidates", icon: UserSquare2, label: "Candidates" },
  { id: "contacts", icon: Users, label: "Contacts" },
  { id: "companies", icon: Building2, label: "Companies" },
  { id: "opportunities", icon: Target, label: "Opportunities" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "deals", icon: Briefcase, label: "Deals" },
];

const toolTabs: { id: string; icon: LucideIcon; label: string }[] = [
  { id: "aiparser", icon: Sparkles, label: "AI Parser" },
  { id: "reports", icon: BarChart2, label: "Reports" },
  { id: "automations", icon: Activity, label: "Automations" },
  { id: "emailsettings", icon: Mail, label: "Email Settings" },
  { id: "customFields", icon: Settings, label: "Custom Fields" },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  setSelectedItem: (item: unknown) => void;
  setShowForm: (show: boolean) => void;
  onLogout: () => void;
  user: User | null;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  setSelectedItem,
  setShowForm,
  onLogout,
  user,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const getInitials = () => {
    const meta = user?.user_metadata as { full_name?: string } | undefined;
    if (meta?.full_name) {
      return meta.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return (user?.email?.[0] ?? "U").toUpperCase();
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_active_tab", tabId);
    }
    setShowForm(false);
    setSelectedItem(null);
  };

  const renderTab = (tab: (typeof mainTabs)[0]) => {
    const isActive = activeTab === tab.id;
    const isHovered = hoveredTab === tab.id;
    const TabIcon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        onMouseEnter={() => setHoveredTab(tab.id)}
        onMouseLeave={() => setHoveredTab(null)}
        title={collapsed ? tab.label : ""}
        className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative group ${
          collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
        } ${
          isActive
            ? "bg-white text-gray-900 shadow-md shadow-black/5 font-semibold"
            : "text-gray-500 hover:bg-white/60 hover:text-gray-800"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
            isActive
              ? "bg-blue-50 text-blue-600"
              : isHovered
                ? "bg-gray-100 text-gray-700"
                : "text-gray-400"
          }`}
        >
          <TabIcon size={18} />
        </div>
        {!collapsed && (
          <span
            className={`text-[13px] truncate ${isActive ? "font-semibold" : "font-medium"}`}
          >
            {tab.label}
          </span>
        )}
        {collapsed && isHovered && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl">
            {tab.label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      className={`${
        collapsed ? "w-[72px]" : "w-[260px]"
      } bg-gray-50/80 backdrop-blur-sm border-r border-gray-200/80 flex flex-col z-20 shrink-0 hidden md:flex transition-all duration-300 ease-in-out`}
    >
      <div
        className={`px-3 py-4 border-b border-gray-200/60 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } gap-2`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <span className="text-white font-black text-sm">LLG</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-black text-gray-900 tracking-tight">
                LLG CRM
              </h1>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200/80 hover:text-gray-600"
        >
          <ChevronLeft
            size={18}
            className={collapsed ? "rotate-180" : ""}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="space-y-1">
          {mainTabs.map(renderTab)}
        </div>
        <div className="pt-4 border-t border-gray-200/60 mt-2">
          <div className="px-2 py-1.5">
            {!collapsed && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Tools
              </span>
            )}
          </div>
          <div className="space-y-1 mt-1">
            {toolTabs.map(renderTab)}
          </div>
        </div>
      </nav>

      {!collapsed && user && (
        <div className="p-3 border-t border-gray-200/60">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/60">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {getInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 text-sm font-medium"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
