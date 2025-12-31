
import { MainNav } from "@/components/layout/main-nav"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-auto py-4 items-center justify-between">
                <div className="flex items-center">
                    <a className="mr-6 flex items-center space-x-2" href="/">
                        <img src="/logo.png" alt="FairValue" className="h-20 md:h-24 w-auto object-contain rounded-lg" />
                    </a>
                </div>
                <MainNav />
            </div>
        </header>
    )
}
