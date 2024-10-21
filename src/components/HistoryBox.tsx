"use client";

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { HistoryIcon } from "lucide-react";
import { Transaction } from "@/models/Transaction";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryBox() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const getTransactions = async () => {
            const response = await axiosInstance.get("/transactions", {});
            setTransactions(response.data.transactions); // limited to last 10 transactions
        };

        getTransactions();

        const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "new_transaction") {
                setTransactions((prevTransactions) => [message.data, ...prevTransactions]);
            }
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <Card className="w-full max-w-md mx-auto mt-12">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">Global Exchange History</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground">No exchange history.</p>
                ) : (
                    <ScrollArea className="max-h-64 w-full rounded-md border overflow-y-scroll">
                        <div className="p-4">
                            <AnimatePresence mode="wait" initial={false}>
                                {transactions.map((transaction: Transaction) => (
                                    <motion.div
                                        key={transaction.timestamp.toString()}
                                        variants={{
                                            hidden: {
                                                opacity: 0,
                                                y: -20,
                                            },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    y: { type: "spring", stiffness: 500, damping: 30 },
                                                },
                                            },
                                        }}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex justify-between items-center py-2 border-b last:border-b-0">
                                        <div>
                                            <p className="font-medium">
                                                {transaction.amountEUR} EUR → {transaction.amountPLN} PLN
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Rate: 1 EUR = {transaction.rate} PLN
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(transaction.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
