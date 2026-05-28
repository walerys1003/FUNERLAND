// Standalone layout — nadpisuje SiteHeader/SiteFooter z root layoutu
export default function OrchestratorLayout({ children }: { children: React.ReactNode }) {
  return <div className="orchestrator-shell">{children}</div>;
}
