import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Car,
  AlertTriangle,
  Stethoscope,
  Code,
  Cpu,
  Cog,
  Layers,
  Wrench as WrenchIcon,
  BookOpen,
  Hammer,
  GitBranch,
  Shield,
  DollarSign,
  Search,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Diagnostic Search", url: "/search", icon: Search },
];

const dataManagementItems = [
  { title: "Vehicle Models", url: "/vehicles", icon: Car },
  { title: "Problems", url: "/problems", icon: AlertTriangle },
  { title: "Symptoms", url: "/symptoms", icon: Stethoscope },
  { title: "DTC Codes", url: "/dtc-codes", icon: Code },
  { title: "Sensors", url: "/sensors", icon: Cpu },
  { title: "Actuators", url: "/actuators", icon: Cog },
  { title: "Parts & Factors", url: "/parts", icon: Layers },
];

const solutionItems = [
  { title: "Solutions", url: "/solutions", icon: WrenchIcon },
  { title: "Technical Theory", url: "/theory", icon: BookOpen },
  { title: "Tools Required", url: "/tools", icon: Hammer },
  { title: "Problem Relations", url: "/relations", icon: GitBranch },
];

const safetyItems = [
  { title: "Safety Precautions", url: "/safety", icon: Shield },
  { title: "Cost Estimation", url: "/costs", icon: DollarSign },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Check if user is admin
  const { data: userRole } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return data?.role;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRole === "admin";

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: { title: string; url: string; icon: React.ElementType } }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive(item.url) && "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sidebar-primary/20 rounded-lg shrink-0">
            <WrenchIcon className="h-5 w-5 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sidebar-foreground truncate">AutoDiag Pro</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">Vehicle Diagnostics</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", collapsed && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", collapsed && "sr-only")}>
            Data Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataManagementItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", collapsed && "sr-only")}>
            Solutions & Theory
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {solutionItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", collapsed && "sr-only")}>
            Safety & Costs
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {safetyItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn("px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", collapsed && "sr-only")}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <NavItem key={item.url} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center gap-3", collapsed && "hidden")}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <div className="flex items-center gap-1">
                <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-[10px] px-1 py-0">
                  {userRole || "..."}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
