"use client"

import Link from "next/link"
import { LayoutDashboard, Heart, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
// Use client hook in a client component wrapper or directly here if "use client"
import { usePathname } from "next/navigation"

export function MainNav() {
    const pathname = usePathname()

    const routes = [
        {
            href: "/",
            label: "Overview",
            icon: LayoutDashboard,
            active: pathname === "/",
        },
        {
            href: "/charities",
            label: "Charities",
            icon: Heart,
            active: pathname.startsWith("/charities"),
        },
        {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            active: pathname.startsWith("/settings"),
        },
    ]

    return (
        <nav className="flex items-center space-x-1 md:space-x-4 lg:space-x-6">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 px-2 md:px-3 py-2 rounded-md",
                        route.active
                            ? "text-primary bg-secondary/50"
                            : "text-muted-foreground"
                    )}
                >
                    <route.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{route.label}</span>
                </Link>
            ))}
        </nav>
    )
}
