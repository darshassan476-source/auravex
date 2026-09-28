export const ADMIN_USER = {
  name: "Admin",
  role: "Owner Access",
  initials: "AD",
  email: "admin@auravex.com",
} as const;

/**
 * The seeded demo account, created on first start when ADMIN_PASSWORD is not
 * set. The login screen offers these only while that password is still in
 * force; the portal insists on changing it.
 */
export const DEMO_CREDENTIALS = {
  email: "admin@auravex.com",
  password: "auravex2024",
} as const;

export const ADMIN_NAV = [
  {
    group: "Content",
    items: [
      { label: "Dashboard", href: "/admin", icon: "home" },
      { label: "Add Software", href: "/admin/products/new", icon: "plus" },
      { label: "Manage Products", href: "/admin/products", icon: "box" },
      { label: "Case Studies", href: "/admin/case-studies", icon: "file" },
      { label: "Page Builder", href: "/admin/pages", icon: "layers" },
      { label: "Media Library", href: "/admin/media", icon: "image" },
      { label: "Manage Links", href: "/admin/links", icon: "link" },
    ],
  },
  {
    group: "Growth",
    items: [
      { label: "Messages", href: "/admin/messages", icon: "message" },
      { label: "Bookings", href: "/admin/bookings", icon: "calendar" },
      { label: "Demo Requests", href: "/admin/demo-requests", icon: "mail" },
      { label: "Analytics", href: "/admin/analytics", icon: "chart" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "AI Studio", href: "/admin/ai", icon: "sparkles" },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Backgrounds & Images", href: "/admin/appearance", icon: "image" },
      { label: "Site Content", href: "/admin/content", icon: "pencil" },
      { label: "Themes & Colours", href: "/admin/theme", icon: "palette" },
      { label: "Website Settings", href: "/admin/settings", icon: "settings" },
      { label: "Activity Logs", href: "/admin/activity", icon: "clock" },
    ],
  },
];
