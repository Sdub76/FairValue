
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Image as ImageIcon } from "lucide-react"
import { uploadPhoto, deletePhoto } from "@/app/actions/photos" // We need to create this
import Image from "next/image"

type Props = {
    donationId: string
    existingPhotos: string[] // filenames
    pocketbaseUrl: string
    collectionId: string // donations collection ID or name?
}

export function PhotoGallery({ donationId, existingPhotos, pocketbaseUrl, collectionId }: Props) {
    const [isUploading, setIsUploading] = useState(false)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("donationId", donationId)
        Array.from(e.target.files).forEach((file) => {
            formData.append("photos", file)
        })

        try {
            await uploadPhoto(formData)
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed")
        } finally {
            setIsUploading(false)
            // Reset input
            e.target.value = ""
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Evidence Gallery</h3>
                <div className="relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <Button disabled={isUploading} variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Photos"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingPhotos.length === 0 ? (
                    <div className="col-span-4 border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-sm">No photos uploaded</span>
                    </div>
                ) : (
                    existingPhotos.map((photo) => (
                        <div key={photo} className="relative aspect-square rounded-md overflow-hidden group border bg-muted">
                            <Image
                                src={`${pocketbaseUrl}/api/files/${collectionId}/${donationId}/${photo}?thumb=200x200`}
                                alt="Evidence"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deletePhoto(donationId, photo)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
