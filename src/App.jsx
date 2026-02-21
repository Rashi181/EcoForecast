import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useNavigate,
} from "react-router-dom";

// ✅ Import your Inputs page
// If your file is exactly: src/Pages/Inputs/InputsPage.tsx
import InputsPage from "./Pages/Inputs/InputsPage";

// Simple Home page with button → Inputs
function Home() {
    const navigate = useNavigate();

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={{ marginTop: 0 }}>EcoForecast</h1>
                <p style={{ opacity: 0.85 }}>
                    Demo: Estimate clinic sustainability cost impact (quarterly
                    inputs).
                </p>

                <button
                    style={styles.primaryBtn}
                    onClick={() => navigate("/inputs")}
                >
                    Go to Inputs
                </button>

                {/* Optional: link version */}
                <div style={{ marginTop: 12 }}>
                    <Link to="/inputs">Or click here to open Inputs</Link>
                </div>
            </div>
        </div>
    );
}

// Placeholder Outputs (you can replace later)
function Outputs() {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={{ marginTop: 0 }}>Outputs</h2>
                <p>Placeholder for now.</p>
                <Link to="/inputs">Back to Inputs</Link>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inputs" element={<InputsPage />} />
                <Route path="/outputs" element={<Outputs />} />
            </Routes>
        </BrowserRouter>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(135deg, #0b1220, #0f3b2f)",
        color: "white",
    },
    card: {
        width: "100%",
        maxWidth: 720,
        padding: 24,
        borderRadius: 16,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
    },
    primaryBtn: {
        marginTop: 12,
        padding: "12px 16px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontWeight: 700,
    },
};
