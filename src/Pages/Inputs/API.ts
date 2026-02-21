import type { InputsDoc, QuarterlyInputs } from "./types";

const BASE_URL = "http://localhost:5000";

export async function saveInputsToMongo(
    inputs: QuarterlyInputs,
    year?: number
) {
    const payload = {
        year: year ?? new Date().getFullYear(),
        inputs: {
            electricity: {
                usage: Number(inputs.electricity.usage),
                amountPaid: Number(inputs.electricity.amountPaid),
            },
            water: {
                usage: Number(inputs.water.usage),
                amountPaid: Number(inputs.water.amountPaid),
            },
            fuel: {
                usage: Number(inputs.fuel.usage),
                amountPaid: Number(inputs.fuel.amountPaid),
            },
        },
    };

    const res = await fetch(`${BASE_URL}/api/inputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save inputs");
    }
    return data.id as string; // Mongo _id string
}

export async function fetchLatestInputs(): Promise<InputsDoc | null> {
    const res = await fetch(`${BASE_URL}/api/inputs/latest`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to fetch latest inputs");
    }

    return data.data as InputsDoc | null;
}

export async function fetchInputsById(id: string): Promise<InputsDoc> {
    const res = await fetch(`${BASE_URL}/api/inputs/${id}`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to fetch inputs");
    }

    return data.data as InputsDoc;
}
