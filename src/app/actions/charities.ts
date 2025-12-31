'use server'

import { getAdminPb } from "@/lib/pocketbase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCharity(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const address = formData.get("address") as string
    const ein = formData.get("ein") as string

    if (!name) {
        throw new Error("Name is required")
    }

    try {
        const pb = await getAdminPb()
        await pb.collection("charities").create({
            name,
            description,
            address,
            ein,
        })
    } catch (error) {
        console.error("Create charity failed", error)
        throw new Error("Failed to create charity")
    }

    revalidatePath("/charities")
    redirect("/charities")
}

export async function deleteCharity(id: string) {
    try {
        const pb = await getAdminPb()
        await pb.collection("charities").delete(id)
        revalidatePath("/charities")
    } catch (error) {
        console.error("Delete charity failed", error)
        throw new Error("Failed to delete charity")
    }
}
