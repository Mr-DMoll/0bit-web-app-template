export interface NavItem {
  href:  string;
  label: string;
  icon:  string;
}

export interface NavGroup {
  label?: string;
  items:  NavItem[];
}

export const NAV_CONFIG: Record<string, NavGroup[]> = {
  SUPER_ADMIN: [
    {
      label: "Overview",
      items: [
        { href: "/super-admin",          label: "Dashboard",     icon: "LayoutDashboard" },
        { href: "/super-admin/activity", label: "Activity Logs", icon: "Activity"        },
      ],
    },
    {
      label: "Platform",
      items: [
        { href: "/super-admin/admins",       label: "Admin Accounts", icon: "Shield"       },
        { href: "/super-admin/flags",        label: "Feature Flags",  icon: "ToggleLeft"   },
        { href: "/super-admin/integrations", label: "Integrations",   icon: "Plug"         },
      ],
    },
    {
      label: "Configuration",
      items: [
        { href: "/super-admin/system", label: "Settings", icon: "Settings" },
      ],
    },
  ],
  ADMIN: [
    {
      items: [
        { href: "/admin",          label: "Overview",  icon: "LayoutDashboard" },
        { href: "/admin/managers", label: "Managers",  icon: "UsersRound"      },
        { href: "/admin/team",     label: "All Users", icon: "Users"           },
        { href: "/admin/activity", label: "Activity",  icon: "Activity"        },
      ],
    },
  ],
  MANAGER: [
    {
      items: [
        { href: "/manager",          label: "Overview", icon: "LayoutDashboard" },
        { href: "/manager/projects", label: "Projects", icon: "FolderKanban"    },
      ],
    },
  ],
  USER: [
    {
      items: [
        { href: "/user", label: "Dashboard", icon: "LayoutDashboard" },
      ],
    },
  ],
};
