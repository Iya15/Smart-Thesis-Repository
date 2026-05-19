"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../hooks/useAuth";

// Client-side providers wrapper — keeps app/layout.tsx as a Server Component.
// ThemeProvider wraps AuthProvider so the theme is available to all components.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
