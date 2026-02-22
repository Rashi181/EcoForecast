import type {
    InputsDoc,
    QuarterlyInputs,
    InputsDoc4Q,
    QuarterInputs,
} from "./types";

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

export async function save4QuartersToMongo(
    company: string,
    quarters: QuarterInputs,
    year?: number
) {
    const normalize = (q: QuarterlyInputs) => ({
        electricity: {
            usage: Number(q.electricity.usage),
            amountPaid: Number(q.electricity.amountPaid),
        },
        water: {
            usage: Number(q.water.usage),
            amountPaid: Number(q.water.amountPaid),
        },
        fuel: {
            usage: Number(q.fuel.usage),
            amountPaid: Number(q.fuel.amountPaid),
        },
    });

    const payload = {
        period: "four-quarter",
        company,
        year: year ?? new Date().getFullYear(),
        quarters: {
            q1: normalize(quarters.q1),
            q2: normalize(quarters.q2),
            q3: normalize(quarters.q3),
            q4: normalize(quarters.q4),
        },
    };

    const res = await fetch(`${BASE_URL}/api/inputs/four-quarter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save 4-quarter inputs");
    }

    return data.id as string;
}
