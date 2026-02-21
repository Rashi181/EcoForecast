import type { QuarterlyInputs } from "./types";

export function toNumberOrNull(v: number | ""): number | null {
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export function isValidNonNegative(n: number | null) {
    return n !== null && Number.isFinite(n) && n >= 0;
}

export function validateInputs(inputs: QuarterlyInputs): string | null {
    const fields: Array<[string, number | ""]> = [
        ["Electricity usage", inputs.electricity.usage],
        ["Electricity amount paid", inputs.electricity.amountPaid],
        ["Water usage", inputs.water.usage],
        ["Water amount paid", inputs.water.amountPaid],
        ["Fuel usage", inputs.fuel.usage],
        ["Fuel amount paid", inputs.fuel.amountPaid],
    ];

    for (const [label, raw] of fields) {
        const n = toNumberOrNull(raw);
        if (!isValidNonNegative(n))
            return `${label} must be a non-negative number.`;
    }

    return null;
}
