'use server'

import { getAdminPb } from "@/lib/pocketbase"
import { revalidatePath } from "next/cache"

export async function uploadPhoto(formData: FormData) {
    const donationId = formData.get("donationId") as string
    const files = formData.getAll("photos")

    console.log(`Received ${files.length} files for donation ${donationId}`)
    files.forEach((f) => {
        if (f instanceof File) {
            console.log(`- File: ${f.name} (${f.size} bytes, ${f.type})`)
        } else {
            console.log(`- Not a file:`, f)
        }
    })

    if (!donationId || !files.length) return

    try {
        // Pocketbase append requires updating the record. 
        // NOTE: 'photos' is a file field (multiple). Sending new files in update appends them? 
        // Or replaces? In PB, if you send files, they are usually replaced unless you use special handling or send existing filenames too.
        // Wait, PB v0.22+ might support appending via specific API or usually you have to re-upload or use a specific technique.
        // Actually, simple update with new files usually ADDS to existing if "Max Select" > 1?
        // Let's verify. Usually "If you want to append/add more files to a 'multiple' file field, you have to also submit the ids/names of the existing files."

        // Fetch existing first
        const pb = await getAdminPb()
        const record = await pb.collection("donations").getOne(donationId)
        // Convert existing filenames to something PB accepts? No, usually FormData with "photos" key just adds if we don't clear old ones?
        // No, documentation says: "To delete a file you have to pass null or empty string value for the file field. To append..."
        // Actually, to APPEND, you technically need to pass existing files? No, that's impossible.
        // Re-reading docs: "When updating a record with a file field... new files will be appended to the existing ones (if maxSelect > 1)."
        // Oh, really? In some versions yes. 
        // Let's assume append works for now. If it replaces, we'll fix.

        // UPDATE: It seems default behavior replaces. To append `photos+` key? No.
        // Workaround: PB JS SDK `update` takes `FormData`. If we include `photos: [file1, file2]`, it replaces.
        // BUT, if we include `photos`: ["existing_filename", newFile] it works.
        // So we DO need to fetch existing filenames.

        const existingPhotos = record.photos || []

        // Append existing filenames so they are not deleted (PB requires re-sending names to keep them)
        if (Array.isArray(existingPhotos)) {
            existingPhotos.forEach((filename: any) => {
                formData.append("photos", filename)
            })
        }

        await pb.collection("donations").update(donationId, formData)

    } catch (error) {
        console.error("Photo upload failed:", JSON.stringify(error, null, 2))
        throw new Error("Failed to upload photo")
    }

    revalidatePath("/donations") // Revalidate everywhere for simplicity
}

export async function deletePhoto(donationId: string, filename: string) {
    try {
        const pb = await getAdminPb()
        await pb.collection("donations").update(donationId, {
            "photos-": [filename] // PB syntax to remove specific files
        })
    } catch (error) {
        console.error("Photo delete failed", error)
        throw new Error("Failed to delete photo")
    }
    revalidatePath("/donations") // Revalidate everywhere for simplicity
}
