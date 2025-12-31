'use server'

import { getAdminPb } from "@/lib/pocketbase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- Tax Years ---

export async function createTaxYear(formData: FormData) {
    const year = formData.get("year") as string
    const target_cpi = formData.get("target_cpi") as string

    if (!year || !target_cpi) {
        throw new Error("Year and CPI are required")
    }

    try {
        const pb = await getAdminPb()
        await pb.collection("tax_years").create({
            year: parseInt(year),
            target_cpi: parseFloat(target_cpi),
        })
    } catch (error) {
        console.error("Create tax year failed", error)
        throw new Error("Failed to create tax year")
    }

    revalidatePath("/")
    redirect("/")
}

// --- Donations (Events) ---

export async function createDonation(taxYearId: string, year: string, formData: FormData) {
    const name = formData.get("name") as string
    const date = formData.get("date") as string
    const charityId = formData.get("charityId") as string

    if (!name || !date || !charityId) {
        throw new Error("Missing required fields")
    }

    let record;
    try {
        const pb = await getAdminPb()
        record = await pb.collection("donations").create({
            name,
            date,
            charity: charityId,
            tax_year: taxYearId,
        })
    } catch (error) {
        console.error("Create donation failed", error)
        throw new Error("Failed to create donation")
    }

    revalidatePath(`/donations/${year}`)
    redirect(`/donations/${year}/${record.id}`)
}

export async function deleteDonation(year: string, id: string) {
    try {
        const pb = await getAdminPb()
        await pb.collection("donations").delete(id)
        revalidatePath(`/donations/${year}`)
    } catch (error) {
        console.error("Delete donation failed", error)
        throw new Error("Failed to delete donation")
    }
}
