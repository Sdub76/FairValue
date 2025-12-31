'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getAdminPb } from '@/lib/pocketbase'
import { formatCurrency } from '@/lib/utils'

// Reuse types or define them here
type TaxYearData = {
    year: number
    targetCpi: number
    totalValue: number
    donationCount: number
    itemCount: number
    charities: any[]
}

export default function PrintPage() {
    const params = useParams()
    const year = params.year
    const [data, setData] = useState<TaxYearData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/export/year/${year}`)
                if (!res.ok) throw new Error('Failed to load')
                const jsonData = await res.json()
                setData(jsonData)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        if (year) fetchData()
    }, [year])

    useEffect(() => {
        if (data) {
            // Small delay to ensure images render
            setTimeout(() => {
                window.print()
            }, 1000)
        }
    }, [data])

    if (loading) return <div className="p-8 text-center">Loading Report...</div>
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load report data.</div>

    return (
        <div className="print-container bg-white min-h-screen text-black p-8 max-w-[210mm] mx-auto">
            <style jsx global>{`
                @media print {
                    @page { margin: 20mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                    .page-break { page-break-before: always; }
                    .avoid-break { page-break-inside: avoid; }
                }
            `}</style>

            {/* Cover Section */}
            <div className="mb-12 border-b-2 border-black pb-8">
                <h1 className="text-4xl font-bold mb-4">Tax Year {data.year}</h1>
                <h2 className="text-2xl text-gray-600 mb-2">Charitable Donation Record</h2>
                <p className="text-sm text-gray-500">Generated {new Date().toLocaleDateString()}</p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-8 mb-12 bg-gray-50 p-6 rounded-lg">
                <div className="text-center">
                    <div className="text-3xl font-bold">{data.totalValue ? formatCurrency(data.totalValue, false) : '$0.00'}</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide mt-2">Total Donated</div>
                </div>
                <div className="text-center border-l border-gray-200">
                    <div className="text-3xl font-bold">{data.donationCount}</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide mt-2">Donation Events</div>
                </div>
                <div className="text-center border-l border-gray-200">
                    <div className="text-3xl font-bold">{data.itemCount}</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide mt-2">Total Items</div>
                </div>
            </div>

            {/* Charity Summary List */}
            <div className="mb-12">
                <h3 className="text-xl font-bold border-b-2 border-black mb-4 pb-2">Summary by Charity</h3>
                <div className="space-y-2">
                    {data.charities.map((charity) => {
                        const charityTotal = charity.donations.reduce((sum: number, d: any) =>
                            sum + d.items.reduce((s: number, i: any) => s + i.final_value, 0), 0)
                        return (
                            <div key={charity.id} className="flex justify-between text-lg">
                                <span>{charity.name}</span>
                                <span className="font-bold font-mono">{formatCurrency(charityTotal, false)}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>Consumer Price Index (CPI) Adjustment Factor: {data.targetCpi} / 313.689</p>
                <p>Baseline Comparison Year: 2024</p>
            </div>

            {/* Detailed Charity Sections */}
            {data.charities.map((charity) => (
                <div key={charity.id} className="page-break mt-8">
                    {/* Charity Header */}
                    <div className="bg-gray-100 p-6 rounded-lg mb-8 avoid-break">
                        <h2 className="text-2xl font-bold mb-2">{charity.name}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-semibold block">EIN:</span> {charity.ein}
                            </div>
                            <div>
                                <span className="font-semibold block">Address:</span> {charity.address}
                            </div>
                        </div>
                        {charity.description && (
                            <div className="mt-4 text-sm border-t border-gray-200 pt-2 italic">
                                {charity.description}
                            </div>
                        )}
                    </div>

                    {/* Donation Events */}
                    {charity.donations.map((donation: any) => (
                        <div key={donation.id} className="mb-12 pl-4 border-l-4 border-gray-200 avoid-break">
                            <h3 className="text-xl font-bold mb-2">
                                {donation.name}
                                <span className="font-normal text-gray-500 text-base ml-2">
                                    — {new Date(donation.date).toLocaleDateString()}
                                </span>
                            </h3>
                            {donation.location && (
                                <p className="text-sm text-gray-600 mb-4">Location: {donation.location}</p>
                            )}

                            {/* Photos */}
                            {donation.photos?.length > 0 && (
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {donation.photos.map((photo: string, idx: number) => {
                                        const isPdf = photo.startsWith('data:application/pdf');
                                        if (isPdf) {
                                            return (
                                                <div key={idx} className="w-[48%] h-96 border border-gray-300 relative">
                                                    <object data={photo} type="application/pdf" className="w-full h-full">
                                                        <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500 p-4 text-center">
                                                            PDF items are attached but may not display in all print previews.
                                                        </div>
                                                    </object>
                                                </div>
                                            )
                                        }
                                        return (
                                            <img
                                                key={idx}
                                                src={photo}
                                                className="w-[48%] h-auto object-contain border border-gray-300 rounded"
                                                alt="Evidence"
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Itemization Table */}
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 font-bold border-b-2 border-black">
                                    <tr>
                                        <th className="py-2 px-2 w-[10%]">Qty</th>
                                        <th className="py-2 px-2 w-[40%]">Item</th>
                                        <th className="py-2 px-2 w-[15%]">Type</th>
                                        <th className="py-2 px-2 w-[15%] text-right">Unit Value</th>
                                        <th className="py-2 px-2 w-[20%] text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donation.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-2 px-2 font-mono">{item.quantity}</td>
                                            <td className="py-2 px-2">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.category}{item.quality ? `, Qual: ${item.quality}` : ''}
                                                </div>
                                                {item.value_note && (
                                                    <div className="text-xs italic text-gray-600 mt-0.5">Note: {item.value_note}</div>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 capitalize text-gray-600">{item.value_mode}</td>
                                            <td className="py-2 px-2 text-right font-mono">{formatCurrency(item.unit_value, false)}</td>
                                            <td className="py-2 px-2 text-right font-bold font-mono">{formatCurrency(item.final_value, false)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                        <td className="py-2 px-2"></td>
                                        <td className="py-2 px-2">Total ({donation.items.reduce((s: number, i: any) => s + i.quantity, 0)} items)</td>
                                        <td className="py-2 px-2"></td>
                                        <td className="py-2 px-2"></td>
                                        <td className="py-2 px-2 text-right">{formatCurrency(donation.items.reduce((s: number, i: any) => s + i.final_value, 0), false)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
