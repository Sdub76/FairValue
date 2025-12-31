
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Image as ImageIcon, X } from "lucide-react"
import { uploadPhoto, deletePhoto } from "@/app/actions/photos"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type Props = {
    donationId: string
    existingPhotos: string[] // filenames
    pocketbaseUrl: string
    collectionId: string // donations collection ID or name?
}

export function PhotoGallery({ donationId, existingPhotos, pocketbaseUrl, collectionId }: Props) {
    const [isUploading, setIsUploading] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

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
                        <div
                            key={photo}
                            className="relative aspect-square rounded-md overflow-hidden group border bg-muted cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <Image
                                src={`${pocketbaseUrl}/api/files/${collectionId}/${donationId}/${photo}?thumb=200x200`}
                                alt="Evidence"
                                fill
                                className="object-cover transition-transform hover:scale-105"
                                unoptimized
                            />
                            <div
                                className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end"
                                onClick={(e) => e.stopPropagation()}
                            >
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

            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative w-full h-[80vh] flex items-center justify-center pointer-events-none">
                        <div className="relative w-full h-full pointer-events-auto">
                            {selectedPhoto && (
                                <Image
                                    src={`${pocketbaseUrl}/api/files/${collectionId}/${donationId}/${selectedPhoto}`}
                                    alt="Evidence Full Size"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            )}
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full opacity-70 hover:opacity-100"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
