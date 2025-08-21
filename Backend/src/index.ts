import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import authRouter from './routes/protected.route';
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

// Initialize express app FIRST
const app = express();

// Load environment variables
dotenv.config();

// Type declaration for Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

// Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

// Explicit preflight handling (Express 5: avoid '*' string, use regex)
app.options(/.*/, cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: "20mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => {
      console.error("❌ Failed to connect to MongoDB:", err);
    });
} else {
  console.warn("⚠️ MONGODB_URI is not set. Starting server without database connection.");
}

// Schemas and Models
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
const User = mongoose.model("User", userSchema);

// Scan schema for saving detection results
const scanSchema = new mongoose.Schema({
  userId: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, default: "Unknown Location" },
  imageUrl: { type: String, required: true }, // base64 data URL
  weedCount: { type: Number, default: 0 },
  status: { type: String, enum: ["Completed", "Processing", "Failed"], default: "Completed" },
  accuracy: { type: String, default: "0%" },
  topLabel: { type: String },
  topConfidence: { type: Number },
  counts: { type: Map, of: Number },
  detections: { type: Array },
}, { timestamps: true });

const Scan = mongoose.model("Scan", scanSchema);

// Helper Functions
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );
};

// Authentication Middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    // Type guard
    if (typeof decoded === "string") {
      throw new Error("Invalid token format");
    }

    req.user = decoded as JwtPayload & { id: string };
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Routes
// app.use('/api', authRouter);

// Test Endpoint
app.get("/api/test", (_req: Request, res: Response) => {
  res.json({ status: "Backend is working", timestamp: new Date() });
});

// Shared detect image handler
const detectImageHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded. Use form field 'image'" });
    }

    const pythonDefault = "/workspace/Weed-Detection-main/.venv/bin/python";
    const pythonExec = process.env.PYTHON_EXEC || (fs.existsSync(pythonDefault) ? pythonDefault : "python3");

    const pythonScript = "/workspace/Weed-Detection-main/testing/infer_image.py";
    const weightsPath = "/workspace/Weed-Detection-main/testing/crop_weed_detection.weights";
    const configPath = "/workspace/Weed-Detection-main/testing/crop_weed.cfg";
    const namesPath = "/workspace/Weed-Detection-main/testing/obj.names";

    if (!fs.existsSync(pythonScript)) {
      return res.status(500).json({ success: false, message: "Inference script not found" });
    }
    if (!fs.existsSync(weightsPath)) {
      return res.status(500).json({ success: false, message: "Weights file missing at testing/crop_weed_detection.weights" });
    }

    const args = [pythonScript, "--image", req.file.path, "--config", configPath, "--weights", weightsPath, "--names", namesPath];

    const proc = spawn(pythonExec, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdoutData = "";
    let stderrData = "";

    proc.stdout.on("data", (chunk) => { stdoutData += chunk.toString(); });
    proc.stderr.on("data", (chunk) => { stderrData += chunk.toString(); });

    proc.on("close", async (code) => {
      if (code !== 0) {
        return res.status(500).json({ success: false, message: "Inference failed", error: stderrData || stdoutData });
      }
      try {
        const parsed = JSON.parse(stdoutData);

        // Compute summary fields for persistence/display
        const detections = Array.isArray(parsed?.detections) ? parsed.detections : [];
        const weedCount = (parsed?.counts?.weed) ?? detections.filter((d: any) => String(d.label).toLowerCase() === 'weed').length;
        const avgAccuracy = detections.length > 0 ? Math.round((detections.reduce((acc: number, d: any) => acc + (d.confidence || 0), 0) / detections.length) * 100) : 0;
        const accuracyStr = `${avgAccuracy}%`;
        const top = detections.reduce((p: any, c: any) => (p && (p.confidence || 0) > (c.confidence || 0)) ? p : c, null);
        const topLabel = top?.label ?? (Object.keys(parsed?.counts || {})[0] || undefined);
        const topConfidence = top?.confidence ?? undefined;

        // Optionally persist to DB if connected
        let savedId: string | undefined;
        if (mongoose.connection?.readyState === 1) {
          try {
            const now = new Date();
            const scanDoc = await Scan.create({
              userId: (req as any).user?.id,
              date: now.toISOString().split('T')[0],
              time: now.toTimeString().split(' ')[0].slice(0, 5),
              location: (req.body?.location as string) || "Unknown Location",
              imageUrl: parsed?.annotated_image_base64 ? `data:image/jpeg;base64,${parsed.annotated_image_base64}` : undefined,
              weedCount,
              status: "Completed",
              accuracy: accuracyStr,
              topLabel,
              topConfidence,
              counts: parsed?.counts || {},
              detections,
            });
            savedId = scanDoc._id.toString();
          } catch (e) {
            // Log but do not fail the request
            console.warn("Failed to persist scan:", e);
          }
        }

        return res.json({ ...parsed, weedCount, accuracy: accuracyStr, topLabel, topConfidence, savedId });
      } catch (e) {
        return res.status(500).json({ success: false, message: "Failed to parse inference output", raw: stdoutData, stderr: stderrData });
      }
    });
  } catch (err) {
    console.error("/detect-image error:", err);
    return res.status(500).json({ success: false, message: "Server error during detection" });
  }
};

// Image detection endpoints (two paths for compatibility)
app.post("/api/detect-image", upload.single("image"), detectImageHandler);
app.post("/pyapi/detect-image", upload.single("image"), detectImageHandler);

// Scans API
app.get("/api/scans", async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.userId) filter.userId = String(req.query.userId);
    const scans = await Scan.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, scans });
  } catch (err) {
    console.error("GET /api/scans error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch scans" });
  }
});

app.post("/api/scans", async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const scan = await Scan.create({
      userId: body.userId,
      date: body.date,
      time: body.time,
      location: body.location || "Unknown Location",
      imageUrl: body.imageUrl,
      weedCount: body.weedCount || 0,
      status: body.status || "Completed",
      accuracy: body.accuracy || "0%",
      topLabel: body.topLabel,
      topConfidence: body.topConfidence,
      counts: body.counts || {},
      detections: body.detections || [],
    });
    res.status(201).json({ success: true, scan });
  } catch (err) {
    console.error("POST /api/scans error:", err);
    res.status(400).json({ success: false, message: "Failed to save scan" });
  }
});

// Backwards-compat alias used by some clients
app.post("/pyapi/detect-image", upload.single("image"), async (req: Request, res: Response, next: NextFunction) => {
  // Delegate to the primary handler by adjusting the URL path
  req.url = "/api/detect-image";
  next();
});

// Authentication Routes
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    console.log(username," : ", email, " : ", password)

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("username", username, " password", password, " email", email)


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser._id.toString());

    res.cookie("backend-token", token)

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Protected Item Routes
app.get("/api/items", authenticate, async (_req: Request, res: Response) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/items", authenticate, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const newItem = new Item({ name, description });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: "Bad Request" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));