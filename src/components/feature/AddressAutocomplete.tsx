"use client";

import * as React from "react";
import Radar from "radar-sdk-js";
import { useDebounce } from "use-debounce";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
    value?: string
    /**
     * Called when the user types OR selects an address.
     * This component is now fully controlled.
     */
    onSelect: (address: string) => void
    disabled?: boolean
    apiKey?: string
}

export function AddressAutocomplete({ value, onSelect, disabled, apiKey }: AddressAutocompleteProps) {
    const [open, setOpen] = React.useState(false);

    // We debounce the *value* prop to avoid searching on every keystroke
    const [debouncedSearchTerm] = useDebounce(value, 300);

    const [suggestions, setSuggestions] = React.useState<Radar.RadarAutocompleteAddress[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Initialize Radar
    React.useEffect(() => {
        if (!apiKey || apiKey === "your_key_here") return;
        try {
            // @ts-ignore
            Radar.initialize(apiKey);
        } catch (e) {
            console.error("Radar initialization failed", e);
        }
    }, [apiKey]);

    // Fetch suggestions when debounced value changes
    React.useEffect(() => {
        // Don't search if the dropdown shouldn't be open, or if the value is empty/too short
        // We allow searching if 'open' is true (user typing)
        if (!open || !debouncedSearchTerm || debouncedSearchTerm.length < 3) {
            return;
        }

        const fetchSuggestions = async () => {
            if (!apiKey || apiKey === "your_key_here") return;

            setLoading(true);
            try {
                // @ts-ignore
                const result = await Radar.autocomplete({
                    query: debouncedSearchTerm,
                    limit: 5,
                    layers: ['address'],
                });

                if (result && result.addresses) {
                    setSuggestions(result.addresses);
                }
            } catch (error) {
                console.error("Error fetching address suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm, apiKey, open]); // Dependency on 'open' ensures we don't search if closed

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Input
                        placeholder={
                            (!apiKey || apiKey === "your_key_here")
                                ? "e.g. 123 Charity Dr."
                                : "Search address..."
                        }
                        value={value || ""}
                        onChange={(e) => {
                            // Fully controlled: update parent immediately
                            onSelect(e.target.value);
                            // Open dropdown when user types
                            if (!open) setOpen(true);
                        }}
                        disabled={disabled}
                        className="w-full"
                        autoComplete="off"
                    />
                </div>
            </PopoverTrigger>
            {/* Only render content if we have suggestions or loading state, to avoid empty box */}
            {(loading || suggestions.length > 0) && (
                <PopoverContent
                    className="w-[300px] p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
                        <ul className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                            {loading && <li className="py-6 text-center text-sm text-muted-foreground">Loading...</li>}

                            {!loading && suggestions.length === 0 && debouncedSearchTerm && debouncedSearchTerm.length > 2 && (
                                <li className="py-6 text-center text-sm text-muted-foreground">No address found.</li>
                            )}

                            {suggestions.map((address, idx) => (
                                <li
                                    key={`${address.formattedAddress}-${idx}`}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                        value === address.formattedAddress && "bg-accent text-accent-foreground"
                                    )}
                                    onMouseDown={(e) => {
                                        // Prevent input blur when clicking an item
                                        e.preventDefault();
                                    }}
                                    onClick={() => {
                                        onSelect(address.formattedAddress);
                                        setOpen(false); // Close on selection
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === address.formattedAddress ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {address.formattedAddress}
                                </li>
                            ))}
                        </ul>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    )
}
