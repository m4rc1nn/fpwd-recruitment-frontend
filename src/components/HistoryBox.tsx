"use client"

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { HistoryIcon } from "lucide-react";

export default function HistoryBox() {

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const getTransactions = async () => {
            const response = await axiosInstance.get("/transactions", {});
            setTransactions(response.data.transactions);
        }

        const fetchInterval = setInterval(async () => {
            getTransactions();
        }, 1000);

        getTransactions();
        return () => clearInterval(fetchInterval);
    }, []);

    return (
        <Card className="w-full max-w-md mx-auto mt-12">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">Exchange history</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground">No exchange history.</p>
                ) : (
                    <ScrollArea className="max-h-64 w-full rounded-md border overflow-y-scroll">
                        <div className="p-4">
                            {transactions.map((transaction: Transaction, index: number) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                    <div>
                                        <p className="font-medium">{transaction.amountEUR} EUR → {transaction.amountPLN} PLN</p>
                                        <p className="text-sm text-muted-foreground">Rate: 1 EUR = {transaction.rate} PLN</p>
                                        <p className="text-xs text-muted-foreground">{new Date(transaction.timestamp).toLocaleString()}</p>
                                    </div>
                                    <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}