
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Archive,
  BarChart3,
  Building2,
  Cog,
  DollarSign,
  Gem,
  LayoutDashboard,
  LineChart,
  Phone,
  ShieldCheck,
  Target,
  Wrench,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const departmentLinks = [
  { href: "/admin", icon: ShieldCheck, title: "Admin" },
  { href: "/production", icon: BarChart3, title: "Production" },
  { href: "/machine", icon: Cog, title: "Machine" },
  { href: "/operator", icon: Wrench, title: "Operator" },
  { href: "/finance", icon: DollarSign, title: "Finance" },
  { href: "/store", icon: Archive, title: "Store" },
  { href: "/quality", icon: Gem, title: "Quality" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="#">
          <SidebarMenuButton
            tooltip={{ children: "Organization" }}
          >
            <Building2 />
            <span>Organization</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={{ children: "Departments" }}
              isActive={departmentLinks.some((item) => pathname.startsWith(item.href))}
            >
              <LayoutDashboard />
              <span>Departments</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {departmentLinks.map((item, index) => (
                <SidebarMenuSubItem key={index}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuSubButton
                      isActive={pathname.startsWith(item.href)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link href="#">
          <SidebarMenuButton tooltip={{ children: "Reports" }}>
            <LineChart />
            <span>Reports</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link href="#">
          <SidebarMenuButton tooltip={{ children: "KPI" }}>
            <Target />
            <span>KPI</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link href="#">
          <SidebarMenuButton tooltip={{ children: "Contact Us" }}>
            <Phone />
            <span>Contact Us</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
