import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_for_hackathon";

app.use(cors());
app.use(express.json());

// --- AUTH MIDDLEWARE ---
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req: Request, res: Response): Promise<any> => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- TRIP ROUTES ---
app.get("/api/trips", authenticateToken, async (req: any, res: any) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.userId },
      include: { activities: true, expenses: true },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

app.post("/api/trips", authenticateToken, async (req: any, res: any) => {
  const { title, destination, startDate, endDate, budget } = req.body;
  try {
    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget),
        userId: req.user.userId,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// Public Share Route
app.get("/api/trips/public/:tripId", async (req: any, res: any): Promise<any> => {
  const { tripId } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { activities: true, expenses: true },
    });
    if (!trip || !trip.isPublic) return res.status(404).json({ error: "Trip not found or not public" });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch public trip" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
