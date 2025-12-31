
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCharity } from "@/app/actions/charities"
import { ChevronLeft } from "lucide-react"

import { getConfig } from '@/lib/config'
import NewCharityForm from '@/components/feature/NewCharityForm'

export default function NewCharityPage() {
    const config = getConfig()
    const radarKey = config.app?.RADAR_KEY

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/charities">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Add Charity</h2>
            </div>

            <NewCharityForm apiKey={radarKey} />
        </div>
    )
}
