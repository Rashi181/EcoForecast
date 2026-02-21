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
export type QuarterInputs = {
    q1: QuarterlyInputs;
    q2: QuarterlyInputs;
    q3: QuarterlyInputs;
    q4: QuarterlyInputs;
};

export type InputsDoc4Q = {
    id?: string;
    period: "four-quarter";
    company: string;
    year: number;
    createdAt?: string;
    quarters: {
        q1: {
            electricity: { usage: number; amountPaid: number };
            water: { usage: number; amountPaid: number };
            fuel: { usage: number; amountPaid: number };
        };
        q2: {
            electricity: { usage: number; amountPaid: number };
            water: { usage: number; amountPaid: number };
            fuel: { usage: number; amountPaid: number };
        };
        q3: {
            electricity: { usage: number; amountPaid: number };
            water: { usage: number; amountPaid: number };
            fuel: { usage: number; amountPaid: number };
        };
        q4: {
            electricity: { usage: number; amountPaid: number };
            water: { usage: number; amountPaid: number };
            fuel: { usage: number; amountPaid: number };
        };
    };
};
const emptyQuarter = (): QuarterlyInputs => ({
    electricity: { usage: "", amountPaid: "" },
    water: { usage: "", amountPaid: "" },
    fuel: { usage: "", amountPaid: "" },
});

export const DEFAULT_QUARTER_INPUTS: QuarterInputs = {
    q1: DEFAULT_INPUTS,
    q2: DEFAULT_INPUTS,
    q3: DEFAULT_INPUTS,
    q4: DEFAULT_INPUTS,
};
