'use server'

import { getAdminPb } from "@/lib/pocketbase"
import { revalidatePath } from "next/cache"

// Constants
const BASELINE_CPI = 313.689

export async function addDatabaseItem(donationId: string, taxYearCpi: number, formData: FormData) {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const quantity = parseInt(formData.get("quantity") as string) || 1
    const quality = formData.get("quality") as string || "Good"
    const value_low = parseFloat(formData.get("value_low") as string) || 0
    const value_high = parseFloat(formData.get("value_high") as string) || 0

    // value_high already contains the selected quality's baseline value
    const baseline_value = value_high

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
            quality,  // Store quality in database
            baseline_value,
            value_mode: "database",
            unit_value: unitValue,
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

export async function addCashItem(donationId: string, amount: number, description: string) {
    try {
        const pb = await getAdminPb()
        await pb.collection("donation_items").create({
            donation: donationId,
            name: description || "Cash Donation",
            category: "Cash",
            quantity: 1,
            value_mode: "cash",
            unit_value: amount,
            final_value: amount.toFixed(2),
        })
    } catch (e) {
        console.error("Add cash item failed", e)
        throw new Error("Failed to add cash item")
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

export async function updateItemQuantity(itemId: string, quantity: number) {
    try {
        const pb = await getAdminPb()
        const item = await pb.collection('donation_items').getOne(itemId)

        // Recalculate final value based on new quantity
        const unitValue = parseFloat(item.final_value) / item.quantity
        const new_final_value = unitValue * quantity

        await pb.collection('donation_items').update(itemId, {
            quantity,
            final_value: new_final_value.toFixed(2)
        })
    } catch (e) {
        console.error('Update quantity failed', e)
        throw new Error('Failed to update quantity')
    }

    revalidatePath(`/donations`)
}

export async function updateItemValue(itemId: string, customValue: number, valueNote: string) {
    try {
        const pb = await getAdminPb()
        const item = await pb.collection('donation_items').getOne(itemId)

        // Calculate new final value
        const new_final_value = customValue * item.quantity

        await pb.collection('donation_items').update(itemId, {
            unit_value: customValue,
            final_value: new_final_value.toFixed(2),
            value_note: valueNote,
            value_mode: "custom"  // Mark as custom when manually edited
        })
    } catch (e) {
        console.error("Update value failed", e)
        throw new Error("Failed to update value")
    }
    revalidatePath("/donations")
}
