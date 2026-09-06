import type { ReactNode } from "react";
import "../../globals.css";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export const metadata = {
  title: "Artosphere Admin",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-bg text-fg antialiased" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-10 flex items-center justify-between border-b border-line pb-6">
            <div className="flex items-center gap-8">
              <span className="text-lg font-semibold">Artosphere Admin</span>
              <nav className="flex gap-6 text-sm text-muted">
                <Link href="/admin" className="hover:text-fg">
                  Messages
                </Link>
                <Link href="/admin/projects" className="hover:text-fg">
                  Projects
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
