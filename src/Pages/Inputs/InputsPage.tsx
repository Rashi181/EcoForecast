import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_INPUTS } from "./types";
import type { QuarterlyInputs } from "./types";
import { fetchLatestInputs, saveInputsToMongo } from "./API";
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

export default function InputsPage() {
    const navigate = useNavigate();

    const [inputs, setInputs] = useState<QuarterlyInputs>(DEFAULT_INPUTS);
    const [loadingLatest, setLoadingLatest] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const preview = useMemo(() => calcPreview(inputs), [inputs]);

    // Auto-load latest saved values (optional but helpful)
    useEffect(() => {
        (async () => {
            try {
                setLoadingLatest(true);
                const latest = await fetchLatestInputs();
                if (latest?.inputs) {
                    setInputs({
                        electricity: {
                            usage: latest.inputs.electricity.usage,
                            amountPaid: latest.inputs.electricity.amountPaid,
                        },
                        water: {
                            usage: latest.inputs.water.usage,
                            amountPaid: latest.inputs.water.amountPaid,
                        },
                        fuel: {
                            usage: latest.inputs.fuel.usage,
                            amountPaid: latest.inputs.fuel.amountPaid,
                        },
                    });
                }
            } catch (e: any) {
                // don’t hard-fail the page if no latest exists
            } finally {
                setLoadingLatest(false);
            }
        })();
    }, []);

    function updateField(
        key: keyof QuarterlyInputs,
        field: "usage" | "amountPaid",
        value: string
    ) {
        setSuccess("");
        setError("");

        const parsed = value === "" ? "" : Number(value);
        setInputs((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: parsed,
            },
        }));
    }

    function onClear() {
        setInputs(DEFAULT_INPUTS);
        setError("");
        setSuccess("");
    }

    async function onSave() {
        setError("");
        setSuccess("");

        const err = validateInputs(inputs);
        if (err) {
            setError(err);
            return;
        }

        try {
            setSaving(true);
            const id = await saveInputsToMongo(inputs);
            sessionStorage.setItem("latest_input_id", id);
            setSuccess(`Saved! (id: ${id})`);

            // Navigate to outputs page if you want immediately
            navigate("/outputs");
        } catch (e: any) {
            setError(e?.message ?? "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
            <h1>Quarterly Inputs (3 months)</h1>
            <p>
                Enter clinic resource usage and how much you paid this quarter.
            </p>

            {loadingLatest && (
                <div style={{ marginBottom: 12, opacity: 0.8 }}>
                    Loading latest saved inputs...
                </div>
            )}

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

            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: 10,
                    padding: 16,
                }}
            >
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
                    usage={inputs.electricity.usage}
                    paid={inputs.electricity.amountPaid}
                    onUsage={(v) => updateField("electricity", "usage", v)}
                    onPaid={(v) => updateField("electricity", "amountPaid", v)}
                />

                <Row
                    label="Water"
                    hint="gallons (or liters)"
                    usage={inputs.water.usage}
                    paid={inputs.water.amountPaid}
                    onUsage={(v) => updateField("water", "usage", v)}
                    onPaid={(v) => updateField("water", "amountPaid", v)}
                />

                <Row
                    label="Fuel"
                    hint="gallons (or miles)"
                    usage={inputs.fuel.usage}
                    paid={inputs.fuel.amountPaid}
                    onUsage={(v) => updateField("fuel", "usage", v)}
                    onPaid={(v) => updateField("fuel", "amountPaid", v)}
                />

                <div
                    style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: "1px solid #eee",
                    }}
                >
                    <b>Quarterly Spend Preview:</b>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                            marginTop: 10,
                        }}
                    >
                        <Stat label="Electricity" value={preview.e} />
                        <Stat label="Water" value={preview.w} />
                        <Stat label="Fuel" value={preview.f} />
                        <Stat label="Total" value={preview.total} />
                    </div>
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

function Stat({ label, value }: { label: string; value: number | null }) {
    const shown = value === null ? "—" : `$${value.toFixed(2)}`;
    return (
        <div
            style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 10,
                minWidth: 160,
            }}
        >
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{shown}</div>
        </div>
    );
}
