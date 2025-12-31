
'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2, Plus, Search, Edit2 } from "lucide-react"
import { deleteItem, addCustomItem, addDatabaseItem, updateItemQuantity, updateItemValue, addCashItem } from "@/app/actions/items"
import { cn, formatCurrency } from "@/lib/utils"
import { searchBaseline, getBaselineCategories, getItemsByCategory } from "@/app/actions/search"

type Item = {
    id: string
    name: string
    category: string
    quantity: number
    final_value: number
    value_type: string
    custom_value?: number
    value_note?: string
    quality?: string
    value_mode?: string
}

type Props = {
    donationId: string
    taxYearCpi: number
    items: Item[]
    totalValue: number
    locked?: boolean
    deleteAction?: React.ReactNode
}

export function ItemsTable({ donationId, taxYearCpi, items, totalValue, locked, deleteAction }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Dropdown state
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const [categoryItems, setCategoryItems] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any>(null)

    // Quality selector
    const [selectedQuality, setSelectedQuality] = useState<"medium" | "high">("high")

    // Value edit dialog
    const [editValueDialogOpen, setEditValueDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Item | null>(null)

    // Load categories on mount
    useEffect(() => {
        async function loadCategories() {
            const cats = await getBaselineCategories()
            setCategories(cats as string[])
        }
        loadCategories()
    }, [])

    // Load items when category changes
    useEffect(() => {
        async function loadItems() {
            if (selectedCategory) {
                const items = await getItemsByCategory(selectedCategory)
                setCategoryItems(items)
            } else {
                setCategoryItems([])
            }
        }
        loadItems()
    }, [selectedCategory])


    // Calculate inflation factor (2024 Base CPI = 313.689)
    const inflationFactor = taxYearCpi / 313.689

    // Helper to get displayed value
    const getInflatedValue = (baselineVal: number) => {
        return (baselineVal * inflationFactor).toFixed(2)
    }

    // Search Handler
    async function handleSearch(term: string) {
        setSearchTerm(term)
        if (term.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        const results = await searchBaseline(term)
        setSearchResults(results)
        setIsSearching(false)
    }

    async function handleAddDatabase(item: any, quality: "medium" | "high") {
        const formData = new FormData()
        // Don't append quality to name - store it separately
        formData.append("name", item.name)

        formData.append("category", item.category)
        // Use selected quality to determine which baseline value to use
        const baselineValue = quality === "high" ? item.value_high_2024 : item.value_low_2024
        formData.append("value_low", item.value_low_2024.toString())
        formData.append("value_high", quality === "high" ? item.value_high_2024.toString() : item.value_low_2024.toString())
        formData.append("quantity", "1")
        formData.append("quality", quality === "high" ? "High" : "Medium") // Map to schema values

        await addDatabaseItem(donationId, taxYearCpi, formData)
        setIsOpen(false)
        setSearchTerm("")
        setSelectedCategory("")
        setSelectedItem(null)
        setSelectedQuality("medium")
    }

    async function handleAddCustom(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        await addCustomItem(donationId, formData)
        setIsOpen(false)
    }

    async function handleQuantityChange(itemId: string, newQuantity: number) {
        if (newQuantity > 0) {
            await updateItemQuantity(itemId, newQuantity)
        }
    }

    async function handleValueEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!editingItem) return

        const formData = new FormData(e.currentTarget)
        const customValue = parseFloat(formData.get("custom_value") as string)
        const valueNote = formData.get("value_note") as string

        await updateItemValue(editingItem.id, customValue, valueNote)
        setEditValueDialogOpen(false)
        setEditingItem(null)
    }

    async function handleAddCash(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const amount = parseFloat(formData.get('cash_amount') as string)
        const description = formData.get('cash_description') as string

        await addCashItem(donationId, amount, description)
        setIsOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <h3 className="text-lg font-medium self-center md:self-auto">Itemization</h3>
                <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        {!locked && (
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                            </DialogTrigger>
                        )}
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add Donation Item</DialogTitle>
                            </DialogHeader>
                            <Tabs defaultValue="database" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="database">Database Search</TabsTrigger>
                                    <TabsTrigger value="custom">Custom Item</TabsTrigger>
                                    <TabsTrigger value="cash">Cash</TabsTrigger>
                                </TabsList>
                                <TabsContent value="database" className="space-y-4 pt-4">
                                    <div className="space-y-4">
                                        {/* Quality Selector */}
                                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                            <Label className="text-sm font-medium">Quality:</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={selectedQuality === "high" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setSelectedQuality("high")}
                                                >
                                                    High
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={selectedQuality === "medium" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setSelectedQuality("medium")}
                                                >
                                                    Medium
                                                </Button>
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span tabIndex={0} className="cursor-not-allowed">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled
                                                                    className="opacity-50 pointer-events-none"
                                                                >
                                                                    Low
                                                                </Button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Low quality items are not deductible per IRS guidelines</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        {/* Search Box */}
                                        <div>
                                            <Label className="text-sm mb-2 block">Search by Name</Label>
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search items (e.g. Sweater, Desk)..."
                                                    className="pl-8"
                                                    value={searchTerm}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                />
                                            </div>
                                            {searchResults.length > 0 && (
                                                <div className="mt-2 max-h-[200px] overflow-y-auto border rounded-md">
                                                    {searchResults.map((res) => {
                                                        const baseline = selectedQuality === "high" ? res.value_high_2024 : res.value_low_2024
                                                        return (
                                                            <div
                                                                key={res.id}
                                                                className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                                                                onClick={() => handleAddDatabase(res, selectedQuality)}
                                                            >
                                                                <div>
                                                                    <div className="font-medium">{res.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{res.category}</div>
                                                                </div>
                                                                <div className="text-sm font-mono">
                                                                    ${getInflatedValue(baseline)}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background px-2 text-muted-foreground">Or browse by category</span>
                                            </div>
                                        </div>

                                        {/* Category/Item Dropdown Selectors */}
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm mb-2 block">Category</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    value={selectedCategory}
                                                    onChange={(e) => {
                                                        setSelectedCategory(e.target.value)
                                                        setSelectedItem(null)
                                                    }}
                                                >
                                                    <option value="">Select a category...</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {selectedCategory && (
                                                <div>
                                                    <Label className="text-sm mb-2 block">Item</Label>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        value={selectedItem?.id || ""}
                                                        onChange={(e) => {
                                                            const item = categoryItems.find(i => i.id === e.target.value)
                                                            setSelectedItem(item)
                                                        }}
                                                    >
                                                        <option value="">Select an item...</option>
                                                        {categoryItems.map((item: any) => {
                                                            const baseline = selectedQuality === "high" ? item.value_high_2024 : item.value_low_2024
                                                            return (
                                                                <option key={item.id} value={item.id}>
                                                                    {item.name} (${getInflatedValue(baseline)})
                                                                </option>
                                                            )
                                                        })}
                                                    </select>
                                                </div>
                                            )}

                                            {selectedItem && (
                                                <Button
                                                    type="button"
                                                    className="w-full"
                                                    onClick={() => handleAddDatabase(selectedItem, selectedQuality)}
                                                >
                                                    Add {selectedItem.name}
                                                </Button>
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
                                            Valuation is estimated at 30% of Purchase Price. Please verify this against resale outlets (e.g. thrift stores) to ensure accuracy.
                                        </p>
                                        <Button type="submit" className="w-full">Add Custom Item</Button>
                                    </form>
                                </TabsContent>
                                <TabsContent value="cash" className="space-y-4 pt-4">
                                    <form onSubmit={handleAddCash} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="cash_description">Description (optional)</Label>
                                            <Input id="cash_description" name="cash_description" placeholder="e.g., Cash donation" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="cash_amount">Amount</Label>
                                            <Input id="cash_amount" name="cash_amount" type="number" step="0.01" required placeholder="$0.00" />
                                        </div>
                                        <Button type="submit" className="w-full">Add Cash Donation</Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                    {deleteAction}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] md:w-[8%] px-2 text-center">Qty</TableHead>
                            <TableHead className="w-full md:w-[40%]">Item</TableHead>
                            <TableHead className="text-right whitespace-nowrap px-2 md:w-[20%]">Unit Value</TableHead>
                            <TableHead className="text-right whitespace-nowrap px-2 md:w-[20%]">Total Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No items added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium p-2 w-[50px]">
                                        <Input
                                            type="number"
                                            min="1"
                                            defaultValue={item.quantity}
                                            className="w-10 h-7 text-xs px-1 text-center"
                                            onBlur={(e) => {
                                                const newQty = parseInt(e.target.value)
                                                if (newQty !== item.quantity && newQty > 0) {
                                                    handleQuantityChange(item.id, newQty)
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>{item.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.category}{item.quality ? `, Qual: ${item.quality}` : ''}
                                        </div>
                                        {item.value_note && (
                                            <div className="text-xs text-muted-foreground italic mt-1">
                                                Note: {item.value_note}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-mono text-muted-foreground">
                                            {formatCurrency(item.quantity > 0 ? item.final_value / item.quantity : 0, false)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground capitalize leading-tight">
                                            {item.value_mode}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right p-2">
                                        <div className="flex items-center justify-end gap-0">
                                            <span className="font-mono text-xs mr-1">{formatCurrency(item.final_value, false)}</span>
                                            {!locked && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => {
                                                            setEditingItem(item)
                                                            setEditValueDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteItem(item.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end p-4 bg-muted/20 rounded-lg">
                <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground font-medium text-sm sm:text-base">Total Estimated Value</span>
                    <span className="text-xl sm:text-2xl font-bold font-mono">{formatCurrency(totalValue)}</span>
                </div>
            </div>

            {/* Value Edit Dialog */}
            <Dialog open={editValueDialogOpen} onOpenChange={setEditValueDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Item Value</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleValueEdit} className="space-y-4">
                        <div>
                            <Label htmlFor="custom_value">Unit Value ($)</Label>
                            <Input
                                id="custom_value"
                                name="custom_value"
                                type="number"
                                step="0.01"
                                defaultValue={editingItem ? (editingItem.final_value / editingItem.quantity).toFixed(2) : 0}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="value_note">Valuation Note (Required for IRS)</Label>
                            <Textarea
                                id="value_note"
                                name="value_note"
                                placeholder="Explain why you adjusted the value..."
                                defaultValue={editingItem?.value_note || ""}
                                rows={3}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Save</Button>
                            <Button type="button" variant="outline" onClick={() => setEditValueDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
