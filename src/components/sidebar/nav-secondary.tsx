"use client";

import * as React from "react";
import { IconBrightness, type Icon } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { HelpDialog } from "../help/help-dialog";

interface NavItem {
  title: string;
  url?: string;
  icon: Icon;
}

export function NavSecondary({
  items,
  ...props
}: {
  items: NavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url &&
              (pathname === item.url || pathname.startsWith(`${item.url}/`));
            if (item.title === "Få hjelp") {
              return (
                <SidebarMenuItem key={item.title}>
                  <HelpDialog
                    trigger={
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    }
                  />
                </SidebarMenuItem>
              );
            }
            return (
              <SidebarMenuItem
                key={item.title}
                className={
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : ""
                }
              >
                <SidebarMenuButton asChild isActive={!!isActive}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuButton asChild>
              <label>
                <IconBrightness />
                <span>Dark Mode</span>
                {mounted ? (
                  <Switch
                    className="ml-auto"
                    checked={resolvedTheme !== "light"}
                    onCheckedChange={() =>
                      setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    }
                  />
                ) : (
                  <Skeleton className="ml-auto h-4 w-8 rounded-full" />
                )}
              </label>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
