export type ResourceInput = {
    usage: number | ""; // allow empty in UI
    amountPaid: number | ""; // allow empty in UI
};

export type QuarterlyInputs = {
    electricity: ResourceInput;
    water: ResourceInput;
    fuel: ResourceInput;
};

export type InputsDoc = {
    id?: string;
    period: "quarterly";
    year: number;
    createdAt?: string;
    inputs: {
        electricity: { usage: number; amountPaid: number };
        water: { usage: number; amountPaid: number };
        fuel: { usage: number; amountPaid: number };
    };
};

export const DEFAULT_INPUTS: QuarterlyInputs = {
    electricity: { usage: "", amountPaid: "" },
    water: { usage: "", amountPaid: "" },
    fuel: { usage: "", amountPaid: "" },
};
