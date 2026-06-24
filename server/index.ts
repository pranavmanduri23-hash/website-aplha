import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware, requireRole, AuthRequest } from "./auth.js"; // Ensure .js extension for ES modules if needed

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Resolve paths accurately across different environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ensure uploads dir exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// simple local storage for dev
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

// Serve uploads for dev
app.use("/uploads", express.static(UPLOAD_DIR));

/**
 * Create assignment (teacher for that class or global ADMIN)
 */
app.post(
  "/api/classes/:classId/assignments",
  authMiddleware,
  requireRole("TEACHER", "ADMIN"),
  upload.array("files", 6),
  async (req: AuthRequest, res) => {
    try {
      const { classId } = req.params;
      const { title, description, dueDate } = req.body;
      const userId = req.user!.id;

      // Check class membership (must be TEACHER for that class) unless user is ADMIN
      if (req.user!.role !== "ADMIN") {
        const member = await prisma.classMember.findFirst({ where: { classId, userId } });
        if (!member || member.role !== "TEACHER") {
          return res.status(403).json({ error: "You must be a teacher for this class" });
        }
      }

      const assignment = await prisma.assignment.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          classId,
          createdById: userId
        }
      });

      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        const attachments = files.map((f) => ({
          assignmentId: assignment.id,
          filename: f.originalname,
          url: `/uploads/${f.filename}`,
          size: f.size,
          mimeType: f.mimetype
        }));
        await prisma.assignmentAttachment.createMany({ data: attachments });
      }

      const result = await prisma.assignment.findUnique({
        where: { id: assignment.id },
        include: { attachments: true }
      });

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

/**
 * List assignments for a class (any authenticated user)
 */
app.get("/api/classes/:classId/assignments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;
    const assignments = await prisma.assignment.findMany({
      where: { classId },
      include: { attachments: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// Basic health route
app.get("/api/health", (req, res) => res.json({ ok: true }));

// =================================================================
// FIXED FOR PRODUCTION ROUTING
// =================================================================
// Since esbuild compiles to dist/index.js, public assets are inside dist/public
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));

// Wildcard fallback lets frontend client routers route properly
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
