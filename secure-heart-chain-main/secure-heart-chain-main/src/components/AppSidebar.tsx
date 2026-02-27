import { ShieldCheck, Users, BarChart3, Link, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Validators", url: "/validators", icon: ShieldCheck },
  { title: "Blockchain", url: "/blockchain", icon: Link },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarContent className="pt-4">
        {/* Logo */}
        <div className="px-4 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary flex-shrink-0">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold tracking-tight font-display text-glow">DFLN</div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Control</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      activeClassName="text-primary bg-primary/10 border-glow"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Network status at bottom */}
        {!collapsed && (
          <div className="mt-auto px-4 pb-4">
            <div className="gradient-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
                <span className="text-[10px] font-mono text-success uppercase">Network Active</span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                <div>Round: <span className="text-foreground">47</span></div>
                <div>Uptime: <span className="text-foreground">99.7%</span></div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
