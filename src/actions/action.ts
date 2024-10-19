"use server";

import axiosInstance from "@/lib/axios";
import { Transaction } from "@/models/Transaction";

export async function changeCurrency(
    previousState: {
        success: boolean;
        error: string | null;
        data: Transaction | null;
    },
    formData: FormData
) {
    if (!formData.get("eurAmount") || formData.get("eurAmount")?.toString().trim() === "" || parseFloat(formData.get("eurAmount") as string) < 0) {
        return {
            success: false,
            error: "Invalid number",
            data: null,
        };
    }

    try {
        const response = await axiosInstance.post("/transaction", {
            amountEUR: parseFloat(formData.get("eurAmount") as string)
        });

        return {
            success: true,
            error: null,
            data: response.data.transaction,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Server error",
            data: null,
        };
    }
}
