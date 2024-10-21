"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    ArrowDown,
    ArrowUp,
    EuroIcon,
    Loader2,
} from "lucide-react";
import { changeCurrency } from "@/actions/action";
import { useActionState, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ExchangeBox() {
    const [currentRate, setCurrentRate] = useState<number>(0);
    const [arrowDirection, setArrowDirection] = useState<"UP" | "DOWN">("UP");

    const [data, action, isPending] = useActionState(changeCurrency, {
        success: false,
        error: null,
        data: null,
    });

    useEffect(() => {
        (async () => {
            try {
                const response = await axiosInstance.get("/exchange-rate");
                setCurrentRate(response.data.exchange_rate ?? 0);
            } catch (error) {
                console.error(error);
            }
        })();

        const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "exchange_rate_changed") {
                changeCurrentRate(message.data.new_exchange_rate ?? 0);
            }
        };

        return () => {
            socket.close();
        };
    }, []);

    const changeCurrentRate = (newRate: number) => {
        setCurrentRate((prevRate) => {
            if (newRate > prevRate) {
                setArrowDirection("UP");
            } else if (newRate < prevRate) {
                setArrowDirection("DOWN");
            }
            return newRate;
        });
    };

    useEffect(() => {
        if (!data.data?.rate) return;
        changeCurrentRate(data.data?.rate ?? 0);
    }, [data]);

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const rateChangeVariants = {
        initial: { scale: 1 },
        changed: {
            scale: [1, 1.1, 1],
            transition: { duration: 0.5 },
        },
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-xl border">
            <h2 className="text-2xl font-bold mb-6 text-center">
                EUR to PLN Converter
            </h2>
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
                                    min={0.1}
                                    max={1000000}
                                    placeholder="Enter EUR amount"
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="ml-2"
                                disabled={isPending}
                            >
                                Convert
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
            <AnimatePresence mode="wait">
                {isPending && (
                    <motion.div
                        key="loading"
                        className="mt-4 p-4 bg-primary/10 rounded-md"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={fadeInUpVariants}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-lg">Converting...</span>
                        </div>
                    </motion.div>
                )}
                {data.success && !data.error && data.data && !isPending && (
                    <motion.div
                        key="success"
                        className="mt-4 p-4 bg-primary/10 rounded-md"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={fadeInUpVariants}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-center">
                            <span className="font-semibold">
                                {data.data.amountEUR} EUR
                            </span>{" "}
                            is equal to
                        </p>
                        <p className="text-3xl font-bold text-center text-primary">
                            {data.data.amountPLN} PLN
                        </p>
                    </motion.div>
                )}
                {data.error && !isPending && (
                    <motion.div
                        key="error"
                        className="mt-4 p-4 bg-destructive/10 rounded-md"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={fadeInUpVariants}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-center text-destructive">
                            {data.error}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                className="mt-6 text-sm text-muted-foreground text-center flex justify-center items-center"
                key={currentRate}
                variants={rateChangeVariants}
                initial="initial"
                animate="changed"
            >
                Exchange Rate: 1 EUR = {currentRate.toFixed(4)} PLN{" "}
                <span
                    className={`${
                        arrowDirection === "UP"
                            ? "text-green-500"
                            : "text-red-500"
                    }`}
                >
                    {arrowDirection === "UP" && <ArrowUp />}
                    {arrowDirection === "DOWN" && <ArrowDown />}
                </span>
            </motion.div>
        </div>
    );
}
