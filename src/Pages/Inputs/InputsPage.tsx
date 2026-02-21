import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { QuarterlyInputs, QuarterInputs } from "./types";
import { DEFAULT_QUARTER_INPUTS } from "./types";
import { save4QuartersToMongo } from "./api";
import {
    validateInputs,
    toNumberOrNull,
    isValidNonNegative,
} from "./validators";

function calcPreview(inputs: QuarterlyInputs) {
    const ePaid = toNumberOrNull(inputs.electricity.amountPaid);
    const wPaid = toNumberOrNull(inputs.water.amountPaid);
    const fPaid = toNumberOrNull(inputs.fuel.amountPaid);

    const e = isValidNonNegative(ePaid) ? ePaid! : null;
    const w = isValidNonNegative(wPaid) ? wPaid! : null;
    const f = isValidNonNegative(fPaid) ? fPaid! : null;

    const total = (e ?? 0) + (w ?? 0) + (f ?? 0);
    return { e, w, f, total };
}

type QKey = keyof QuarterInputs; // "q1" | "q2" | "q3" | "q4"

const QUARTER_LABELS: Record<QKey, string> = {
    q1: "1st Quarter (Q1)",
    q2: "2nd Quarter (Q2)",
    q3: "3rd Quarter (Q3)",
    q4: "4th Quarter (Q4)",
};

export default function InputsPage() {
    const navigate = useNavigate();

    const [company, setCompany] = useState("");
    const [quarters, setQuarters] = useState<QuarterInputs>(
        DEFAULT_QUARTER_INPUTS
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const previews = useMemo(() => {
        const p1 = calcPreview(quarters.q1);
        const p2 = calcPreview(quarters.q2);
        const p3 = calcPreview(quarters.q3);
        const p4 = calcPreview(quarters.q4);
        const yearlyTotal =
            (p1.total ?? 0) +
            (p2.total ?? 0) +
            (p3.total ?? 0) +
            (p4.total ?? 0);
        return { q1: p1, q2: p2, q3: p3, q4: p4, yearlyTotal };
    }, [quarters]);

    function updateField(
        q: QKey,
        key: keyof QuarterlyInputs,
        field: "usage" | "amountPaid",
        value: string
    ) {
        setSuccess("");
        setError("");

        const parsed = value === "" ? "" : Number(value);

        setQuarters((prev) => ({
            ...prev,
            [q]: {
                ...prev[q],
                [key]: {
                    ...prev[q][key],
                    [field]: parsed,
                },
            },
        }));
    }

    function onClear() {
        setCompany("");
        setQuarters(DEFAULT_QUARTER_INPUTS);
        setError("");
        setSuccess("");
    }

    async function onSave() {
        setError("");
        setSuccess("");

        if (!company.trim()) {
            setError("Please enter a company/clinic name.");
            return;
        }

        // validate each quarter using your existing validator
        const order: QKey[] = ["q1", "q2", "q3", "q4"];
        for (const q of order) {
            const err = validateInputs(quarters[q]);
            if (err) {
                setError(`${QUARTER_LABELS[q]}: ${err}`);
                return;
            }
        }

        try {
            setSaving(true);
            const id = await save4QuartersToMongo(company.trim(), quarters);
            sessionStorage.setItem("latest_input_id", id);
            setSuccess(`Saved! (id: ${id})`);

            navigate("/outputs");
        } catch (e: any) {
            setError(e?.message ?? "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
            <h1>Yearly Inputs (4 quarters)</h1>
            <p>
                Enter resource usage + amount paid for each quarter for one
                company/clinic.
            </p>

            {error && (
                <div
                    style={{
                        padding: 12,
                        border: "1px solid #b00020",
                        marginBottom: 12,
                    }}
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        padding: 12,
                        border: "1px solid #0a7",
                        marginBottom: 12,
                    }}
                >
                    {success}
                </div>
            )}

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    Company / Clinic
                </div>
                <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Sunrise Community Clinic"
                    style={{ width: "100%", padding: 10 }}
                />
            </div>

            <QuarterSection
                title={QUARTER_LABELS.q1}
                inputs={quarters.q1}
                previewTotal={previews.q1.total}
                onChange={(key, field, value) =>
                    updateField("q1", key, field, value)
                }
            />

            <QuarterSection
                title={QUARTER_LABELS.q2}
                inputs={quarters.q2}
                previewTotal={previews.q2.total}
                onChange={(key, field, value) =>
                    updateField("q2", key, field, value)
                }
            />

            <QuarterSection
                title={QUARTER_LABELS.q3}
                inputs={quarters.q3}
                previewTotal={previews.q3.total}
                onChange={(key, field, value) =>
                    updateField("q3", key, field, value)
                }
            />

            <QuarterSection
                title={QUARTER_LABELS.q4}
                inputs={quarters.q4}
                previewTotal={previews.q4.total}
                onChange={(key, field, value) =>
                    updateField("q4", key, field, value)
                }
            />

            <div
                style={{
                    marginTop: 18,
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 14,
                }}
            >
                <div style={{ fontWeight: 700 }}>
                    Yearly Total Spend Preview
                </div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>
                    ${previews.yearlyTotal.toFixed(2)}
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={onClear} disabled={saving}>
                    Clear
                </button>
                <button onClick={onSave} disabled={saving}>
                    {saving ? "Saving..." : "Save & Continue"}
                </button>
            </div>
        </div>
    );
}

function QuarterSection(props: {
    title: string;
    inputs: QuarterlyInputs;
    previewTotal: number | null;
    onChange: (
        key: keyof QuarterlyInputs,
        field: "usage" | "amountPaid",
        value: string
    ) => void;
}) {
    return (
        <div
            style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 16,
                marginTop: 16,
            }}
        >
            <h2 style={{ marginTop: 0 }}>{props.title}</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr 1fr",
                    gap: 12,
                    fontWeight: 700,
                }}
            >
                <div>Category</div>
                <div>Usage (Quarter)</div>
                <div>Amount Paid (Quarter)</div>
            </div>

            <Row
                label="Electricity"
                hint="kWh"
                usage={props.inputs.electricity.usage}
                paid={props.inputs.electricity.amountPaid}
                onUsage={(v) => props.onChange("electricity", "usage", v)}
                onPaid={(v) => props.onChange("electricity", "amountPaid", v)}
            />

            <Row
                label="Water"
                hint="gallons (or liters)"
                usage={props.inputs.water.usage}
                paid={props.inputs.water.amountPaid}
                onUsage={(v) => props.onChange("water", "usage", v)}
                onPaid={(v) => props.onChange("water", "amountPaid", v)}
            />

            <Row
                label="Fuel"
                hint="gallons (or miles)"
                usage={props.inputs.fuel.usage}
                paid={props.inputs.fuel.amountPaid}
                onUsage={(v) => props.onChange("fuel", "usage", v)}
                onPaid={(v) => props.onChange("fuel", "amountPaid", v)}
            />

            <div
                style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid #eee",
                }}
            >
                <b>Quarter Spend Preview:</b>{" "}
                <span style={{ fontWeight: 800 }}>
                    {props.previewTotal === null
                        ? "—"
                        : `$${props.previewTotal.toFixed(2)}`}
                </span>
            </div>
        </div>
    );
}

function Row(props: {
    label: string;
    hint: string;
    usage: number | "";
    paid: number | "";
    onUsage: (v: string) => void;
    onPaid: (v: string) => void;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr 1fr",
                gap: 12,
                marginTop: 12,
                alignItems: "center",
            }}
        >
            <div>
                {props.label}{" "}
                <span style={{ opacity: 0.65 }}>({props.hint})</span>
            </div>
            <input
                type="number"
                min={0}
                step="any"
                value={props.usage}
                onChange={(e) => props.onUsage(e.target.value)}
            />
            <input
                type="number"
                min={0}
                step="any"
                value={props.paid}
                onChange={(e) => props.onPaid(e.target.value)}
            />
        </div>
    );
}
