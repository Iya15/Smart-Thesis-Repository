"use client";

import { AuthProvider } from "../hooks/useAuth";

// Client-side providers wrapper — keeps app/layout.tsx as a Server Component
// while still giving the full tree access to React context
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
