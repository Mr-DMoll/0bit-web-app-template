export interface NavItem {
  href:  string;
  label: string;
  icon:  string;
}

export const NAV_CONFIG: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    { href: "/super-admin",        label: "Overview", icon: "LayoutDashboard" },
    { href: "/super-admin/admins", label: "Admins",   icon: "Users"           },
    { href: "/super-admin/audit",  label: "Audit Log", icon: "ScrollText"     },
    { href: "/super-admin/system", label: "System",   icon: "Settings"        },
  ],
  ADMIN: [
    { href: "/admin",           label: "Overview",  icon: "LayoutDashboard" },
    { href: "/admin/managers",  label: "Managers",  icon: "UsersRound"      },
    { href: "/admin/team",      label: "All Users", icon: "Users"           },
    { href: "/admin/activity",  label: "Activity",  icon: "Activity"        },
  ],
  MANAGER: [
    { href: "/manager",          label: "Overview",  icon: "LayoutDashboard" },
    { href: "/manager/projects", label: "Projects",  icon: "FolderKanban"    },
  ],
  USER: [
    { href: "/user", label: "Dashboard", icon: "LayoutDashboard" },
  ],
};
