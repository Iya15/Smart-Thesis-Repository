"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";

// Route group layout — wraps every page under (dashboard)/ with the
// authenticated sidebar+navbar shell. Auth check lives in DashboardLayout.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
