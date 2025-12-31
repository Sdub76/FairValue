'use server'

import { getAdminPb } from "@/lib/pocketbase"
import { revalidatePath } from "next/cache"

// Constants
const BASELINE_CPI = 313.689

export async function addDatabaseItem(donationId: string, taxYearCpi: number, formData: FormData) {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const quantity = parseInt(formData.get("quantity") as string) || 1
    const value_low = parseFloat(formData.get("value_low") as string) || 0
    const value_high = parseFloat(formData.get("value_high") as string) || 0
    // We store the 2024 baseline value as the average of low/high
    const baseline_value = (value_low + value_high) / 2

    // Calculate final value
    // Formula: Baseline * (YearCPI / BaselineCPI) * Quantity
    const inflationFactor = taxYearCpi / BASELINE_CPI
    const unitValue = baseline_value * inflationFactor
    const final_value = unitValue * quantity

    try {
        const pb = await getAdminPb()
        await pb.collection("donation_items").create({
            donation: donationId,
            name,
            category,
            quantity,
            condition: "Medium", // Default
            baseline_value,
            value_type: "Database",
            final_value: final_value.toFixed(2), // Store as fixed decimals
        })
    } catch (e) {
        console.error("Add item failed", e)
        throw new Error("Failed to add item")
    }

    revalidatePath("/donations")
}

export async function addCustomItem(donationId: string, formData: FormData) {
    const name = formData.get("name") as string
    const purchase_price = parseFloat(formData.get("purchase_price") as string) || 0
    const quantity = parseInt(formData.get("quantity") as string) || 1

    // Formula: 30% of Purchase Price
    const unitValue = purchase_price * 0.30
    const final_value = unitValue * quantity

    try {
        const pb = await getAdminPb()
        await pb.collection("donation_items").create({
            donation: donationId,
            name,
            category: "Custom",
            quantity,
            purchase_price,
            value_type: "Custom",
            final_value: final_value.toFixed(2),
        })
    } catch (e) {
        console.error("Add custom item failed", e)
        throw new Error("Failed to add custom item")
    }

    revalidatePath("/donations")
}

export async function deleteItem(id: string) {
    try {
        const pb = await getAdminPb()
        await pb.collection("donation_items").delete(id)
    } catch (e) {
        console.error("Delete item failed", e)
    }
    revalidatePath("/donations")
}
