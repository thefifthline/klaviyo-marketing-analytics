"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Mail,
  GitBranch,
  ArrowUpRight,
  FlaskConical,
} from "lucide-react";
import type { Dataset, DateRange } from "@/lib/data/types";
import { preset } from "@/lib/data/analytics";
const Context = createContext<{
  data: Dataset;
  range: DateRange;
  setRange: (range: DateRange) => void;
} | null>(null);
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Missing analytics workspace");
  return context;
}
export function Workspace({
  data,
  children,
}: {
  data: Dataset;
  children: ReactNode;
}) {
  const [range, setRange] = useState(preset(data.end, 30));
  const pathname = usePathname();
  return (
    <Context.Provider value={{ data, range, setRange }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <Link href="/" className="brand">
            <span className="brand-icon">
              <Activity size={22} />
            </span>
            <span className="brand-wordmark">
              thefifthline<span className="brand-period">.D</span>
            </span>
          </Link>
          <div className="brand-sub">MARKETING INTELLIGENCE</div>
          <div className="nav-label">WORKSPACE</div>
          <nav aria-label="Main navigation">
            {[
              { href: "/", label: "Overview", icon: LayoutDashboard },
              { href: "/campaigns", label: "Campaigns", icon: Mail },
              { href: "/flows", label: "Flows", icon: GitBranch },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  (href === "/" ? pathname === href : pathname.startsWith(href))
                    ? "page"
                    : undefined
                }
                className={
                  "nav-item " +
                  ((
                    href === "/" ? pathname === href : pathname.startsWith(href)
                  )
                    ? "selected"
                    : "")
                }
              >
                <Icon size={19} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="demo-card">
              <FlaskConical size={19} />
              <strong>A space to explore.</strong>
              <p>
                Fictional store. Realistic insights.
                <br />
                No connected accounts.
              </p>
              <span>
                PORTFOLIO DEMO <ArrowUpRight size={13} />
              </span>
            </div>
            <div className="profile">
              <span className="avatar">FL</span>
              <div>
                <strong>thefifthline.D workspace</strong>
                <small>Sample data environment</small>
              </div>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>
                {pathname.startsWith("/campaigns")
                  ? "Campaigns"
                  : pathname.startsWith("/flows")
                    ? "Flows"
                    : "Overview"}
              </strong>
            </div>
            <div className="topbar-right">
              <span className="demo-pill">
                <FlaskConical size={13} /> Demo data
              </span>
              <span className="avatar small">FL</span>
            </div>
          </header>
          <main id="main">{children}</main>
          <footer>
            <span>
              © Ramin · thefifthline.D · Klaviyo Marketing Intelligence
            </span>
            <span>
              Independent portfolio demo · All figures are fictional · USD / UTC
            </span>
          </footer>
        </div>
      </div>
    </Context.Provider>
  );
}
