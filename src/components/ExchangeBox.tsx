"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EuroIcon, Loader2 } from "lucide-react"
import { changeCurrency } from "@/actions/action"
import { useActionState, useEffect, useState } from "react"
import axiosInstance from "@/lib/axios"

export default function ExchangeBox() {

    const [currentRate, setCurrentRate] = useState<number>(0);

    const [data, action, isPending] = useActionState(changeCurrency, { success: false, error: null, data: null });

    useEffect(() => {
        (async () => {
            const response = await axiosInstance.get("/exchange-rate");
            setCurrentRate(response.data.exchange_rate??0);
        })();
    }, [data]);

    return (
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">EUR to PLN Converter</h2>
            <form action={action}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="eur-input">Euro (EUR)</Label>
                        <div className="flex mt-1">
                            <div className="relative flex-grow">
                                <EuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="eur-input"
                                    name="eurAmount"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={1000000}
                                    placeholder="Enter EUR amount"
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <Button type="submit" className="ml-2" disabled={isPending}>
                                Convert
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
            {isPending && <div className="mt-4 p-4 bg-primary/10 rounded-md">
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Converting...</span>
                </div>
            </div>}
            {(data.success && !data.error && data.data && !isPending) && (
                <div className="mt-4 p-4 bg-primary/10 rounded-md">
                    <p className="text-center">
                        <span className="font-semibold">{data.data.amountEUR} EUR</span> is equal to
                    </p>
                    <p className="text-3xl font-bold text-center text-primary">
                        {data.data.amountPLN} PLN
                    </p>
                </div>
            )}
            {(data.error && !isPending) && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-md">
                    <p className="text-center text-destructive">{data.error}</p>
                </div>
            )}
            <p className="mt-6 text-sm text-muted-foreground text-center">
                Exchange Rate: 1 EUR = {currentRate.toFixed(4)} PLN
            </p>
        </div>
    )
}