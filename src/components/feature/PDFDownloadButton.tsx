'use client'

import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PDFDownloadButton({ year }: { year: string | number }) {
    const handleDownload = () => {
        // Open the print page in a new tab
        // The print page will automatically trigger window.print()
        window.open(`/donations/${year}/print`, '_blank')
    }

    return (
        <Button variant="outline" onClick={handleDownload}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
        </Button>
    )
}
