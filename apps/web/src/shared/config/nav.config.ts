export interface NavItem {
  href:  string;
  label: string;
  icon:  string;
}

export const NAV_CONFIG: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    { href: "/super-admin",        label: "Overview", icon: "LayoutDashboard" },
    { href: "/super-admin/admins", label: "Admins",   icon: "Users" },
    { href: "/super-admin/system", label: "System",   icon: "Settings" },
  ],
  ADMIN: [
    { href: "/admin",       label: "Overview", icon: "LayoutDashboard" },
    { href: "/admin/users", label: "Users",    icon: "Users" },
  ],
  USER: [
    { href: "/user", label: "Dashboard", icon: "LayoutDashboard" },
  ],
};
