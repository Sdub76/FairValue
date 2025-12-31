
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogTabs, DialogTab } from "@/components/ui/dialog" // Wait, simple Dialog and Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Search } from "lucide-react"
import { deleteItem, addCustomItem, addDatabaseItem } from "@/app/actions/items"
import { cn } from "@/lib/utils"

// We need a way to search baseline items. Server action?
import { searchBaseline } from "@/app/actions/search" // To be created

type Item = {
    id: string
    name: string
    category: string
    quantity: number
    final_value: number
    value_type: string
}

type Props = {
    donationId: string
    taxYearCpi: number
    items: Item[]
    totalValue: number
}

export function ItemsTable({ donationId, taxYearCpi, items, totalValue }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Search Handler
    async function handleSearch(term: string) {
        setSearchTerm(term)
        if (term.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        // Debounce? For MVP just fetch.
        const results = await searchBaseline(term)
        setSearchResults(results)
        setIsSearching(false)
    }

    async function handleAddDatabase(item: any) {
        const formData = new FormData()
        formData.append("name", item.name)
        formData.append("category", item.category)
        formData.append("value_low", item.value_low_2024.toString())
        formData.append("value_high", item.value_high_2024.toString())
        formData.append("quantity", "1") // Default to 1

        await addDatabaseItem(donationId, taxYearCpi, formData)
        setIsOpen(false)
        setSearchTerm("")
    }

    async function handleAddCustom(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        await addCustomItem(donationId, formData)
        setIsOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Itemization</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add Donation Item</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="database" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="database">Database Search</TabsTrigger>
                                <TabsTrigger value="custom">Custom Item</TabsTrigger>
                            </TabsList>
                            <TabsContent value="database" className="space-y-4 pt-4">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search items (e.g. Sweater, Desk)..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                                        {searchResults.length === 0 && searchTerm.length > 2 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                No items found. Try Custom Item.
                                            </div>
                                        ) : (
                                            searchResults.map((res) => (
                                                <div
                                                    key={res.id}
                                                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                                                    onClick={() => handleAddDatabase(res)}
                                                >
                                                    <div>
                                                        <div className="font-medium">{res.name}</div>
                                                        <div className="text-xs text-muted-foreground">{res.category}</div>
                                                    </div>
                                                    <div className="text-sm font-mono">
                                                        ${res.value_low_2024} - ${res.value_high_2024}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="custom" className="space-y-4 pt-4">
                                <form onSubmit={handleAddCustom} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="c_name">Item Name</Label>
                                        <Input id="c_name" name="name" required placeholder="Description..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="c_price">Purchase Price</Label>
                                            <Input id="c_price" name="purchase_price" type="number" step="0.01" required placeholder="$0.00" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="c_qty">Quantity</Label>
                                            <Input id="c_qty" name="quantity" type="number" defaultValue="1" required />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Valuation will be calculated at 30% of Purchase Price.
                                    </p>
                                    <Button type="submit" className="w-full">Add Custom Item</Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Qty</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No items added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.quantity}</TableCell>
                                    <TableCell>
                                        <div>{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.category}</div>
                                    </TableCell>
                                    <TableCell className="text-xs">{item.value_type}</TableCell>
                                    <TableCell className="text-right font-mono">${item.final_value.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end p-4 bg-muted/20 rounded-lg">
                <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground font-medium">Total Estimated Value</span>
                    <span className="text-2xl font-bold font-mono">${totalValue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
}
