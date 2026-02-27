import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background bg-grid">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-11 flex items-center border-b border-border/50 px-4 flex-shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-success/30 bg-success/5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
                <span className="text-[10px] font-mono text-success">LIVE</span>
              </div>
              <div className="px-3 py-1 rounded border border-border bg-muted/30">
                <span className="text-[10px] font-mono text-muted-foreground">R<span className="text-foreground font-semibold">47</span></span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
