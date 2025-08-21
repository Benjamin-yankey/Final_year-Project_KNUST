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

// Force-set CORS headers for all requests (dev only)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  // No credentials in dev to keep it simple
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Type declaration for Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

// Middlewares
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 204
}));

app.use(express.json());

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

// Image detection endpoint
app.post("/api/detect-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded. Use form field 'image'" });
    }

    // Resolve paths relative to monorepo root
    const projectRoot = path.resolve(__dirname, '..', '..');
    const modelDir = process.env.MODEL_DIR || path.join(projectRoot, 'Weed-Detection-main', 'testing');

    const venvPython = path.join(projectRoot, 'Weed-Detection-main', '.venv', 'bin', 'python');
    const pythonExec = process.env.PYTHON_EXEC || (fs.existsSync(venvPython) ? venvPython : 'python3');

    const pythonScript = path.join(modelDir, 'infer_image.py');
    const weightsPath = path.join(modelDir, 'crop_weed_detection.weights');
    const configPath = path.join(modelDir, 'crop_weed.cfg');
    const namesPath = path.join(modelDir, 'obj.names');

    if (!fs.existsSync(pythonScript)) {
      return res.status(500).json({ success: false, message: `Inference script not found at ${pythonScript}` });
    }
    if (!fs.existsSync(weightsPath)) {
      return res.status(500).json({ success: false, message: `Weights file missing at ${weightsPath}` });
    }

    const args = [pythonScript, "--image", req.file.path, "--config", configPath, "--weights", weightsPath, "--names", namesPath];

    const proc = spawn(pythonExec, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdoutData = "";
    let stderrData = "";

    proc.stdout.on("data", (chunk) => { stdoutData += chunk.toString(); });
    proc.stderr.on("data", (chunk) => { stderrData += chunk.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ success: false, message: "Inference failed", error: stderrData || stdoutData });
      }
      try {
        const parsed = JSON.parse(stdoutData);
        return res.json(parsed);
      } catch (e) {
        return res.status(500).json({ success: false, message: "Failed to parse inference output", raw: stdoutData, stderr: stderrData });
      }
    });
  } catch (err) {
    console.error("/api/detect-image error:", err);
    return res.status(500).json({ success: false, message: "Server error during detection" });
  }
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