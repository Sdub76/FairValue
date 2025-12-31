
import { MainNav } from "@/components/layout/main-nav"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center">
                    <a className="mr-6 flex items-center space-x-2" href="/">
                        <span className="font-bold">
                            FairValue
                        </span>
                    </a>
                </div>
                <MainNav />
            </div>
        </header>
    )
}
