
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Archive,
  BarChart3,
  Cog,
  DollarSign,
  Gem,
  ShieldCheck,
  Wrench,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    href: "/admin",
    icon: ShieldCheck,
    title: "Admin",
  },
  {
    href: "/production",
    icon: BarChart3,
    title: "Production",
  },
  {
    href: "/machine",
    icon: Cog,
    title: "Machine",
  },
  {
    href: "/operator",
    icon: Wrench,
    title: "Operator",
  },
  {
    href: "/finance",
    icon: DollarSign,
    title: "Finance",
  },
  {
    href: "/store",
    icon: Archive,
    title: "Store",
  },
  {
    href: "/quality",
    icon: Gem,
    title: "Quality",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <SidebarMenuItem key={index}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                tooltip={{
                  children: item.title,
                }}
              >
                <Icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
