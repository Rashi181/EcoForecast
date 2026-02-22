import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT) || 5000;
const uri = process.env.MONGO_URI as string;

if (!uri) {
    throw new Error("MONGO_URI missing in .env");
}

const client = new MongoClient(uri);

async function start() {
    console.log("⏳ connecting to mongo...");
    await client.connect();
    console.log("✅ connected to mongo");

    const db = client.db("ecoforecast");
    const inputsCol = db.collection("inputs");

    // Health routes
    app.get("/", (_req: Request, res: Response) => {
        res.send("EcoForecast backend is running ✅");
    });

    app.get("/test", (_req: Request, res: Response) => {
        res.json({ message: "Backend + MongoDB working" });
    });

    /**
     * QUARTERLY (single quarter) - matches your existing frontend saveInputsToMongo()
     * POST /api/inputs
     */
    app.post("/api/inputs", async (req: Request, res: Response) => {
        try {
            const doc = { ...req.body, createdAt: new Date() };
            const result = await inputsCol.insertOne(doc);

            res.status(201).json({
                ok: true,
                id: result.insertedId.toString(),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: "Failed to save inputs" });
        }
    });

    /**
     * QUARTERLY - latest doc
     * GET /api/inputs/latest
     */
    app.get("/api/inputs/latest", async (_req: Request, res: Response) => {
        try {
            const latest = await inputsCol
                .find()
                .sort({ createdAt: -1 })
                .limit(1)
                .toArray();
            res.json({ ok: true, data: latest[0] ?? null });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                ok: false,
                error: "Failed to fetch latest inputs",
            });
        }
    });

    /**
     * QUARTERLY - by id
     * GET /api/inputs/:id
     */
    app.get("/api/inputs/:id", async (req: Request, res: Response) => {
        try {
            const rawId = req.params.id;

            if (typeof rawId !== "string") {
                return res.status(400).json({ ok: false, error: "Invalid id" });
            }

            const doc = await inputsCol.findOne({ _id: new ObjectId(rawId) });

            if (!doc) {
                return res.status(404).json({ ok: false, error: "Not found" });
            }

            res.json({ ok: true, data: doc });
        } catch (err) {
            console.error(err);
            res.status(400).json({ ok: false, error: "Invalid id" });
        }
    });

    /**
     * FOUR-QUARTER (Q1-Q4 at once for a company)
     * POST /api/inputs/four-quarter
     * Expected payload shape:
     * {
     *   period: "four-quarter",
     *   company: string,
     *   year: number,
     *   quarters: { q1: {...}, q2: {...}, q3: {...}, q4: {...} }
     * }
     */
    app.post(
        "/api/inputs/four-quarter",
        async (req: Request, res: Response) => {
            try {
                const doc = { ...req.body, createdAt: new Date() };
                const result = await inputsCol.insertOne(doc);

                res.status(201).json({
                    ok: true,
                    id: result.insertedId.toString(),
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({
                    ok: false,
                    error: "Failed to save 4-quarter inputs",
                });
            }
        }
    );

    /**
     * FOUR-QUARTER - latest (optionally filter by company)
     * GET /api/inputs/four-quarter/latest?company=XYZ
     */
    app.get(
        "/api/inputs/four-quarter/latest",
        async (req: Request, res: Response) => {
            try {
                const company =
                    typeof req.query.company === "string"
                        ? req.query.company
                        : undefined;

                const query = company
                    ? { period: "four-quarter", company }
                    : { period: "four-quarter" };

                const latest = await inputsCol
                    .find(query)
                    .sort({ createdAt: -1 })
                    .limit(1)
                    .toArray();
                res.json({ ok: true, data: latest[0] ?? null });
            } catch (err) {
                console.error(err);
                res.status(500).json({
                    ok: false,
                    error: "Failed to fetch latest 4-quarter inputs",
                });
            }
        }
    );

    app.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
    });
}

start().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});
