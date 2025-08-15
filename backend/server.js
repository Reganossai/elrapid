import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Directory helpers for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 📸 Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ===========================
   🧠 Mongoose Schemas
=========================== */

const Worksheet = mongoose.model(
  "Worksheet",
  new mongoose.Schema({
    individual: String,
    date: String,
    fileName: String,
    filePath: String,
    createdBy: String,
    skillType: String, // ✅ Add this
  })
);

const Resume = mongoose.model(
  "Resume",
  new mongoose.Schema({
    individual: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    skills: [String],
    education: { type: String, required: true },
    experience: [{ company: String, role: String, years: Number }],
    certifications: [String],
    projects: [String],
    summary: { type: String },
    createdBy: { type: String, required: true },
  })
);

const CalendarEvent = mongoose.model(
  "CalendarEvent",
  new mongoose.Schema({
    date: { type: Date, required: true },
    signedInUser: { type: String, required: true },
    individual: { type: String, required: true },
    location: { type: String, required: true },
    tasksPage1: [String],
    tasksPage2: [String],
    dailyNotes: [
      {
        date: { type: Date, required: true },
        morningBriefing: String,
        workSkill: String,
        softSkill: String,
        subSoftSkill: String,
        isHoliday: { type: Boolean, default: false },
      },
    ],
  })
);

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      firstName: String,
      lastName: String,
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ["admin", "user"], default: "user" },
      phoneNumber: String,
      dob: Date,
      city: String,
      state: String,
      regionalCenter: String,
      profilePic: String,
    },
    { collection: "coach" }
  )
);

// 🔐 Hash password before save
User.schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// const MonthlyReport = mongoose.model(
//   "MonthlyReport",
//   new mongoose.Schema(
//     {
//       reporteeId: { type: String, required: true }, // individual ID
//       createdBy: { type: String, required: true }, // logged-in user
//       month: { type: String, required: true }, // e.g. "2025-07"
//       report: {
//         type: Map,
//         of: String, // skill → paragraph
//         required: true,
//       },
//     },
//     { timestamps: true }
//   )
// );

/* ===========================
   🔐 JWT Middleware
=========================== */

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token)
    return res
      .status(403)
      .json({ success: false, message: "No token provided" });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

/* ===========================
   📄 API Routes
=========================== */

// --- Auth
app.post("/api/register", async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists)
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ ...req.body, password: hashed });
  await user.save();
  res.json({ success: true, message: "User registered" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    success: true,
    token,
    role: user.role,
    firstname: user.firstName,
    lastname: user.lastName,
  });
});

// --- Profile
app.get("/api/profile", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

app.put("/api/profile", verifyToken, async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  });
  res.json({ success: true, user: updated });
});

app.post(
  "/api/upload",
  verifyToken,
  upload.single("profilePic"),
  async (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const filePath = `/uploads/${req.file.filename}`;
    const updated = await User.findOneAndUpdate(
      { email: req.user.email },
      { profilePic: filePath },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile picture updated",
      user: updated,
      filePath,
    });
  }
);

// --- Protected admin route
app.get("/api/protected", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admins only" });
  }
  res.json({ success: true, user: req.user });
});

// --- Resumes CRUD
app.post("/api/resume/add", verifyToken, async (req, res) => {
  const resume = new Resume({
    ...req.body,
    createdBy: `${req.user.firstName} ${req.user.lastName}`,
  });
  await resume.save();
  res.json({ success: true, message: "Resume added" });
});

app.get("/api/resume/list", async (req, res) => {
  const resumes = await Resume.find();
  res.json({ success: true, resumes });
});

app.get("/api/resume/:id", async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  res.json({ success: true, resume });
});

app.put("/api/resume/edit/:id", async (req, res) => {
  const updated = await Resume.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, updatedResume: updated });
});

app.delete("/api/resume/delete/:id", async (req, res) => {
  await Resume.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Resume deleted" });
});

// --- Calendar Events CRUD

// ✅ Static route FIRST — this was causing the CastError
app.get("/api/calendar/get", verifyToken, async (req, res) => {
  const { individual, month } = req.query;
  console.log("📥 Incoming calendar request:", { individual, month });

  if (!individual || !month) {
    return res.status(400).json({ message: "Missing individual or month." });
  }

  try {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const calendar = await CalendarEvent.findOne({
      individual,
      date: { $gte: startDate, $lt: endDate },
    });

    console.log("🔍 Querying for calendar with:", {
      individual,
      dateRange: [startDate, endDate],
    });

    if (!calendar) {
      return res.status(404).json({ message: "No calendar found." });
    }

    res.json({
      tasksPage1: calendar.tasksPage1 || [],
      tasksPage2: calendar.tasksPage2 || [],
    });
  } catch (err) {
    console.error("❌ Error fetching calendar:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ Other static routes
app.post("/api/calendar/add", verifyToken, async (req, res) => {
  const event = new CalendarEvent({
    ...req.body,
    signedInUser: `${req.user.firstName} ${req.user.lastName}`,
  });
  await event.save();
  res.json({ success: true, message: "Event added" });
});

app.get("/api/calendar/list", async (req, res) => {
  const events = await CalendarEvent.find();
  res.json({ success: true, events });
});

// ❗️ Dynamic routes LAST
app.get("/api/calendar/:id", async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id);
  res.json({ success: true, event });
});

app.get("/api/calendar/monthly/:id", async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id);
  res.json({ success: true, dailyNotes: event.dailyNotes });
});

app.put("/api/calendar/edit/:id", async (req, res) => {
  const updated = await CalendarEvent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json({ success: true, updatedEvent: updated });
});

app.delete("/api/calendar/delete/:id", async (req, res) => {
  await CalendarEvent.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Event deleted" });
});

// --- Worksheets CRUD
// 📂 Get all worksheets
app.get("/api/worksheets", async (req, res) => {
  try {
    const worksheets = await Worksheet.find().lean();
    const withFullURLs = worksheets.map(ws => ({
      ...ws,
      fileUrl: ws.filePath ? `${req.protocol}://${req.get("host")}/${ws.filePath}` : null
    }));
    res.json({ success: true, worksheets: withFullURLs });
  } catch (err) {
    console.error("❌ Error fetching worksheets:", err);
    res.status(500).json({ success: false, message: "Failed to fetch worksheets" });
  }
});

// 📂 Get a single worksheet by ID
app.get("/api/worksheets/:id", async (req, res) => {
  try {
    const ws = await Worksheet.findById(req.params.id).lean();
    if (!ws) return res.status(404).json({ success: false, message: "Worksheet not found" });
    ws.fileUrl = ws.filePath ? `${req.protocol}://${req.get("host")}/${ws.filePath}` : null;
    res.json({ success: true, worksheet: ws });
  } catch (err) {
    console.error("❌ Error fetching worksheet:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📤 Create a new worksheet
app.post("/api/worksheets", upload.single("file"), async (req, res) => {
  try {
    const worksheet = new Worksheet({
      individual: req.body.individual,
      title: req.body.title,
      skillType: req.body.skillType,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      createdBy: req.body.createdBy,
      fileName: req.file ? req.file.originalname : null,
      filePath: req.file ? req.file.path : null
    });

    await worksheet.save();
    res.status(201).json({
      success: true,
      message: "Worksheet uploaded successfully",
      worksheet: {
        ...worksheet.toObject(),
        fileUrl: worksheet.filePath ? `${req.protocol}://${req.get("host")}/${worksheet.filePath}` : null
      }
    });
  } catch (error) {
    console.error("❌ Error uploading worksheet:", error);
    res.status(500).json({ success: false, message: "Error uploading worksheet" });
  }
});

// ✏️ Update an existing worksheet
app.put("/api/worksheets/:id", upload.single("file"), async (req, res) => {
  try {
    const updateData = {
      individual: req.body.individual,
      title: req.body.title,
      skillType: req.body.skillType,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };

    if (req.file) {
      updateData.fileName = req.file.originalname;
      updateData.filePath = req.file.path;
    }

    const updated = await Worksheet.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: "Worksheet not found" });

    updated.fileUrl = updated.filePath ? `${req.protocol}://${req.get("host")}/${updated.filePath}` : null;

    res.json({ success: true, worksheet: updated });
  } catch (err) {
    console.error("❌ Error updating worksheet:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// 🗑 Delete a worksheet
app.delete("/api/worksheets/:id", async (req, res) => {
  try {
    const deleted = await Worksheet.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Worksheet not found" });
    res.json({ success: true, message: "Worksheet deleted" });
  } catch (err) {
    console.error("❌ Error deleting worksheet:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// 📅 Get worksheets for a given individual and month
app.get("/api/worksheets/monthly", verifyToken, async (req, res) => {
  const { individual, month } = req.query;

  if (!individual || !month) {
    return res.status(400).json({ success: false, message: "Missing individual or month" });
  }

  try {
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const worksheets = await Worksheet.find({
      individual,
      date: { $gte: start, $lt: end }
    }).lean();

    const withFullURLs = worksheets.map(ws => ({
      ...ws,
      fileUrl: ws.filePath ? `${req.protocol}://${req.get("host")}/${ws.filePath}` : null
    }));

    res.json({ success: true, worksheets: withFullURLs });
  } catch (err) {
    console.error("❌ Error fetching monthly worksheets:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Save single skill update (still useful for inline editing)
app.post("/api/report/update", verifyToken, async (req, res) => {
  const { reporteeId, skill, paragraph, month } = req.body;
  const createdBy = `${req.user.firstName} ${req.user.lastName}`;

  try {
    let report = await MonthlyReport.findOne({ reporteeId, month });

    if (report) {
      report.report.set(skill, paragraph);
      await report.save();
    } else {
      report = new MonthlyReport({
        reporteeId,
        createdBy,
        month,
        report: { [skill]: paragraph },
      });
      await report.save();
    }

    res.json({ success: true, message: "Report saved" });
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Get list of users for dropdown
app.get("/api/users/list", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName _id");
    const formatted = users.map((u) => ({
      _id: u._id,
      name: `${u.firstName} ${u.lastName}`,
    }));
    res.json({ success: true, users: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// 🔹 Save full report (used in MonthlyReport.jsx)
app.post("/api/report/update-all", verifyToken, async (req, res) => {
  const { reporteeId, month, report } = req.body;
  const createdBy = `${req.user.firstName} ${req.user.lastName}`;

  try {
    let existing = await MonthlyReport.findOne({ reporteeId, month });

    if (existing) {
      existing.report = report;
      await existing.save();
    } else {
      const newReport = new MonthlyReport({
        reporteeId,
        createdBy,
        month,
        report,
      });
      await newReport.save();
    }

    res.json({ success: true, message: "Report saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Get saved report
app.get("/api/report/get", verifyToken, async (req, res) => {
  const { reporteeId, month } = req.query;

  try {
    const report = await MonthlyReport.findOne({ reporteeId, month });
    if (!report) return res.json({ success: true, report: {} });

    res.json({ success: true, report: Object.fromEntries(report.report) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch report" });
  }
});

app.delete("/api/report/delete", verifyToken, async (req, res) => {
  const { reporteeId, month } = req.query;

  try {
    const deleted = await MonthlyReport.findOneAndDelete({ reporteeId, month });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found." });
    }

    res.json({ success: true, message: "Report deleted." });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

/* ===========================
   🚀 Start Server
=========================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
