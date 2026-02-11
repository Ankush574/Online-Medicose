import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "";
const PORT = process.env.PORT || 5000;
// Gemini / Google Generative Language API key and model.
// We first look for a dedicated GEMINI_API_KEY / GEMINI_MODEL, but
// also fall back to the existing OPENAI_* env vars so you don't
// have to rename your .env immediately.
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || "gemini-1.5-flash";

const DB_ENABLED = Boolean(MONGODB_URI);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["User", "Doctor", "Pharmacist", "Admin"], default: "User" },
  },
  { timestamps: true }
);

const medicineSchema = new mongoose.Schema(
  {
    name: String,
    strength: String,
    form: String,
    price: Number,
    stock: Number,
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: String,
    items: [mongoose.Schema.Types.Mixed],
    totalAmount: Number,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: String,
    medicineName: String,
    strength: String,
    dosage: String,
    duration: String,
    prescribedDate: String,
    expiryDate: String,
    doctor: String,
    notes: String,
    status: { type: String, default: "Active" },
    refillCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const refillRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: String,
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    medicineName: String,
    quantity: Number,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: String,
    doctorName: String,
    datetime: String,
    reason: String,
    status: { type: String, default: "Scheduled" },
  },
  { timestamps: true }
);

const chatMessageSchema = new mongoose.Schema(
  {
    userMessage: String,
    botReply: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const Prescription =
  mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);
const RefillRequest =
  mongoose.models.RefillRequest || mongoose.model("RefillRequest", refillRequestSchema);
const Appointment =
  mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

// In-memory demo data for no-DB mode
const demoOrders = [];
const demoPrescriptions = [];
const demoRefills = [];
const demoAppointments = [];

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const createToken = (user) => {
  const payload = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role || "User",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    // ignore invalid token, treat as anonymous
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !roles.includes(role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

const recordAudit = async (_user, _action, _entityType, _entityId, _meta) => {
  // No-op placeholder; can be wired to a real AuditLog collection.
  return;
};

app.use(authMiddleware);

// Call Gemini (Google Generative Language API) in a safe way
const generateAiReply = async (userMessage, role, fallbackReply, language) => {
  if (!GEMINI_API_KEY) return null;

  const systemPrompt =
    "You are MediBot, an assistant inside an online medication and prescription tracking app called MediCose. " +
    "Answer in 3-5 short sentences. Focus ONLY on helping the user navigate app features (appointments, prescriptions, refills, medications, orders, dashboards, notifications). " +
    "Do NOT give any medical diagnosis, treatment, or dosing advice. Always remind users to consult a healthcare professional for medical decisions. " +
    "The user prefers language: " +
    (language === "hi"
      ? "Hindi. Respond in simple, conversational Hindi (you may mix a little English for medical terms), use short sentences, and avoid complex or technical words."
      : "English. Respond in simple, clear English with short sentences.");

  const combinedPrompt =
    `${systemPrompt}\n\nUser role: ${role || "User"}. Question: ${userMessage}.` +
    (fallbackReply ? `\n\nYou can refine this suggested navigation answer: ${fallbackReply}` : "");

  const body = {
    contents: [
      {
        parts: [{ text: combinedPrompt }],
      },
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Gemini API error status", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join(" ")
      .trim();

    return text || null;
  } catch (err) {
    console.error("Gemini API request failed", err);
    return null;
  }
};

app.post("/api/chat", async (req, res) => {
  try {
    const startedAt = Date.now();

    const message = (req.body && req.body.message) || "";
    const language = (req.body && req.body.language) || "en";
    const trimmed = String(message).trim();

    if (!trimmed) {
      return res.status(400).json({ reply: "Please type a question so I can help you." });
    }

    // Enforce session-based authentication for chat to protect PHI
    if (!req.user) {
      return res.status(401).json({
        reply:
          "For your privacy, chat is only available when you are signed in. Please log in to continue.",
      });
    }

    const lower = trimmed.toLowerCase();

    const role = req.user?.role || "User";

    const roleIntroMap = {
      Doctor:
        "You're logged in as a doctor. I can guide you to tools for managing patients, prescriptions, and clinical workflows.",
      Pharmacist:
        "You're logged in as a pharmacist. I can help you reach dispense, verification, and refill approval workflows.",
      Admin:
        "You're logged in as an admin. I can point you to dashboards to oversee users and activity.",
      User:
        "You're logged in as a patient. I can help you find prescriptions, refills, orders, and appointments.",
    };

    const roleIntro = roleIntroMap[role] || roleIntroMap.User;

    // Very simple "disease guide" based on keywords.
    // This is NOT medical advice – only app navigation help.
    const diseaseGuides = [
      {
        keywords: [
          "cold",
          "cough",
          "runny nose",
          "sore throat",
          "sneezing",
          "flu",
        ],
        text:
          "For common cold or cough-like symptoms, MediCose helps you keep track of any medicines or syrups your doctor has prescribed. Use Dashboard → Prescriptions and Dashboard → Medications to see what you are taking, and Dashboard → Appointments or Video Consultation to speak with a doctor if symptoms persist or worsen. For breathing difficulty, chest pain, or very high fever, please seek urgent medical care.",
      },
      {
        keywords: ["fever", "temperature", "high temp", "high temperature"],
        text:
          "For fever, MediCose can help you keep track of any medicines your doctor prescribes and when you took them. Use Dashboard → Prescriptions and Dashboard → Medications to see what you are taking, and Dashboard → Appointments or Video Consultation to book or follow up with a doctor. For high or persistent fever, or if you feel very unwell, please contact a doctor or emergency services immediately.",
      },
      {
        keywords: ["diabetes", "sugar", "type 2"],
        text:
          "For diabetes, you can use this app to keep medicines and refills organized. Track your diabetes prescriptions in Dashboard → Prescriptions, set up refills in Dashboard → Refills, and schedule regular follow‑ups in Dashboard → Appointments. Always discuss dose changes and targets with your doctor.",
      },
      {
        keywords: ["bp", "blood pressure", "hypertension"],
        text:
          "For high blood pressure, you can use MediCose to stay on top of tablets and refills. Keep your BP medicines listed under Dashboard → Prescriptions / Medications, request refills through Dashboard → Refills, and book reviews in Dashboard → Appointments. For urgent symptoms (chest pain, severe headache, breathlessness), seek emergency care immediately.",
      },
      {
        keywords: ["asthma", "inhaler", "wheezing"],
        text:
          "For asthma, this app helps you track inhalers and preventer medicines. Store your asthma prescriptions under Dashboard → Prescriptions, watch refill dates in Dashboard → Refills, and book check‑ins via Dashboard → Appointments. If you have severe breathing trouble, use your action plan and contact emergency services.",
      },
      {
        keywords: ["heart failure", "cardiac", "heart problem"],
        text:
          "For heart‑related conditions, keep all heart medicines and refills clearly listed in Dashboard → Prescriptions and Refills, and schedule close follow‑up through Dashboard → Appointments. This app only tracks meds and visits – treatment decisions must be made with your cardiologist.",
      },
    ];

    // Intent-based routing for cleaner logic and easier debugging
    const matchedDisease = diseaseGuides.find((guide) =>
      guide.keywords.some((kw) => lower.includes(kw))
    );

    const detectIntent = () => {
      if (matchedDisease) return { intent: "symptom.navigation", data: { guide: matchedDisease } };
      if (
        lower.includes("appointment") ||
        lower.includes("schedule") ||
        lower.includes("visit") ||
        lower.includes("doctor visit")
      ) {
        return { intent: "appointment.create" };
      }
      if (
        lower.includes("prescription") ||
        lower.includes("rx") ||
        lower.includes("medication") ||
        lower.includes("medicine") ||
        lower.includes("tablet") ||
        lower.includes("pill")
      ) {
        return { intent: "prescription.view" };
      }
      if (
        lower.includes("refill") ||
        lower.includes("refills") ||
        lower.includes("top up") ||
        lower.includes("renew")
      ) {
        return { intent: "refill.request" };
      }
      if (
        lower.includes("order history") ||
        lower.includes("track order") ||
        lower.includes("tracking") ||
        lower.includes("delivery status")
      ) {
        return { intent: "order.track" };
      }
      if (
        lower.includes("order") ||
        lower.includes("cart") ||
        lower.includes("shop") ||
        lower.includes("buy")
      ) {
        return { intent: "order.shop" };
      }
      if (
        lower.includes("profile") ||
        lower.includes("account") ||
        lower.includes("setting") ||
        lower.includes("settings") ||
        lower.includes("notification") ||
        lower.includes("alert")
      ) {
        return { intent: "profile.settings" };
      }
      if (lower.includes("doctor") || lower.includes("pharmacist") || lower.includes("admin")) {
        return { intent: "role.info" };
      }
      if (lower.includes("emergency") || lower.includes("urgent")) {
        return { intent: "emergency.info" };
      }
      if (
        lower.includes("help") ||
        lower.includes("feature") ||
        lower.includes("how") ||
        lower.includes("what can you do")
      ) {
        return { intent: "help.general" };
      }
      return { intent: "unknown" };
    };

    const intentInfo = detectIntent();
    const intent = intentInfo.intent;
    let reply;
    let needsSupportOffer = false;

    // Helpful for debugging in logs without exposing to users
    console.log("Chat intent detected:", intent);

    switch (intent) {
      case "symptom.navigation": {
        const guide = intentInfo.data?.guide;
        reply = `${guide.text} Remember: MediCose is for tracking medications and visits, not for diagnosis or emergency care.`;
        break;
      }
      case "appointment.create": {
        if (role === "Doctor") {
          reply =
            "As a doctor, use the Doctor Dashboard → Appointments to review your patient schedule, join video visits, and manage follow‑ups. Patients can use Dashboard → Appointments to book or reschedule their own visits.";
        } else if (role === "Pharmacist") {
          reply =
            "As a pharmacist, you’ll mostly see appointments when they relate to prescription reviews. Patients can book and manage visits from Dashboard → Appointments, and doctors manage their schedules from the Doctor Dashboard.";
        } else if (role === "Admin") {
          reply =
            "As an admin, you can oversee overall appointment activity from the Admin / reporting dashboards, while patients use Dashboard → Appointments and doctors manage their schedules from the Doctor Dashboard.";
        } else {
          reply =
            "Appointments: Use Dashboard → Appointments to book, reschedule, or cancel visits. For virtual care, open Dashboard → Video Consultation to join or schedule online sessions.";
        }
        break;
      }
      case "prescription.view": {
        if (role === "Doctor") {
          reply =
            "As a doctor, use the Doctor Dashboard → Prescriptions to review and issue scripts for patients. Patients see their own prescriptions under Dashboard → Prescriptions and active medicines under Dashboard → Medications.";
        } else if (role === "Pharmacist") {
          reply =
            "As a pharmacist, use the Pharmacist Dashboard to verify and dispense prescriptions that patients submit. Patients can review their scripts under Dashboard → Prescriptions and medications under Dashboard → Medications.";
        } else if (role === "Admin") {
          reply =
            "As an admin, you typically audit prescriptions through reporting views. Individual users see their prescriptions in Dashboard → Prescriptions and medicines in Dashboard → Medications.";
        } else {
          reply =
            "Prescriptions & medications: Use Dashboard → Prescriptions to upload and track scripts (including refills and expiry), and Dashboard → Medications to review your active medicines and how you're taking them. For privacy, I won’t list specific medicine names here in chat – open your dashboard to see full prescription details.";
        }
        break;
      }
      case "refill.request": {
        if (role === "Doctor") {
          reply =
            "As a doctor, you may see refill requests routed to you for approval via the Doctor Dashboard or related workflows. Patients request refills from Dashboard → Prescriptions and track them in Dashboard → Refills.";
        } else if (role === "Pharmacist") {
          reply =
            "As a pharmacist, manage refill queues and approvals from the Pharmacist Dashboard. Patients submit refills from Dashboard → Prescriptions and track progress in Dashboard → Refills.";
        } else if (role === "Admin") {
          reply =
            "As an admin, you usually monitor refill volumes and performance in reporting views. Patients request refills from Dashboard → Prescriptions and track them under Dashboard → Refills.";
        } else {
          reply =
            "Refills: From Dashboard → Prescriptions, click the Refill action next to a medicine to request more. Then monitor status and delivery expectations in Dashboard → Refills.";
        }
        break;
      }
      case "order.track": {
        // Try to use persistent context: the user's most recent order
        let latestOrderText = "";
        try {
          if (DB_ENABLED && req.user?.email) {
            const latestOrder = await Order.findOne({ userEmail: req.user.email })
              .sort({ createdAt: -1 })
              .lean();

            if (latestOrder) {
              const created = latestOrder.createdAt
                ? new Date(latestOrder.createdAt).toLocaleString()
                : "recently";
              latestOrderText =
                ` For your most recent order (placed ${created}), the current status is "${
                  latestOrder.status || "Pending"
                }".`;
            }
          }
        } catch (orderErr) {
          console.error("Chatbot order lookup failed", orderErr);
        }

        if (role === "Pharmacist") {
          reply =
            "As a pharmacist, you track and update order preparation and dispensing from the Pharmacist Dashboard, while patients see their order history and statuses in Dashboard → Orders." +
            latestOrderText;
        } else if (role === "Admin") {
          reply =
            "As an admin, you mainly monitor overall order volume and status trends. Individual patients can open Dashboard → Orders or Order History to see their own delivery status and tracking details." +
            latestOrderText;
        } else {
          reply =
            "Order tracking & history: After placing an order from the Shop/Cart, open Dashboard → Orders or the Order History view to see statuses, delivery windows, and tracking details." +
            latestOrderText;
        }
        break;
      }
      case "order.shop": {
        if (role === "Pharmacist") {
          reply =
            "As a pharmacist, you don’t usually place retail orders here; instead you manage dispensing and inventory via the Pharmacist Dashboard. Patients can browse medicines in the Shop, add them to Cart, and then review orders in Dashboard → Orders.";
        } else if (role === "Admin") {
          reply =
            "As an admin, you mostly oversee order activity in aggregate. End users can browse medicines in the Shop, add them to their Cart, check out, and then see their orders in Dashboard → Orders.";
        } else {
          reply =
            "Orders & Shop: Browse medicines in the Shop, add them to your Cart, then proceed to checkout to place an order. You can review past and current orders in Dashboard → Orders.";
        }
        break;
      }
      case "profile.settings": {
        if (role === "Doctor") {
          reply =
            "As a doctor, keep your professional details updated in Profile, and adjust notification and availability preferences in Settings. Patients and pharmacists do the same in their own dashboards.";
        } else if (role === "Pharmacist") {
          reply =
            "As a pharmacist, use Profile to keep your contact and workplace details up to date, and Settings to manage notifications and workflow preferences.";
        } else if (role === "Admin") {
          reply =
            "As an admin, you can update your own profile and also manage certain system-level preferences, while users adjust their own Profile, Settings, and Notifications in their dashboards.";
        } else {
          reply =
            "Profile & preferences: Use Dashboard → Profile to update your basic details, Dashboard → Settings to control preferences (like theme or privacy), and Dashboard → Notifications to review health and medication alerts.";
        }
        break;
      }
      case "role.info": {
        reply =
          "Role dashboards: Doctors use the Doctor Dashboard for patient lists, clinical prescriptions, and approvals. Pharmacists use the Pharmacist Dashboard for dispensing, inventory, and refill queues. Admins oversee users and system activity via the Admin Dashboard.";
        break;
      }
      case "emergency.info": {
        reply =
          "Emergency: This app is for tracking medications and prescriptions only. For emergencies, contact local emergency services or visit the nearest hospital immediately.";
        break;
      }
      case "help.general": {
        reply =
          "I can help you navigate appointments, prescriptions, refills, medications, orders, video consultation, notifications, and role-based dashboards (Doctor, Pharmacist, Admin). Ask me about any of these and I'll guide you to the right place.";
        break;
      }
      default: {
        // Graceful fallback for anything unclear
        reply =
          "I'm not sure what you want yet. You can book an appointment, check prescriptions, request a refill, or track your orders inside MediCose. Try something like 'Book appointment', 'Show my prescriptions', or 'Track my last order'.";
        needsSupportOffer = true;
      }
    }

    // Try to enhance with AI if configured, but never for symptom/emergency intents
    let finalReply = reply;
    const allowAi = intent !== "symptom.navigation" && intent !== "emergency.info";
    let usedAi = false;
    if (allowAi) {
      const aiReply = await generateAiReply(trimmed, role, reply, language);
      if (aiReply && typeof aiReply === "string") {
        finalReply = aiReply;
        usedAi = true;
      } else {
        finalReply = `${reply}\n\n${roleIntro}`;
      }
    } else {
      // For symptom or emergency flows, keep tightly controlled, non-diagnostic copy
      finalReply = `${reply}\n\n${roleIntro}`;
    }

    if (needsSupportOffer) {
      finalReply = `${finalReply}\n\nWould you like me to connect you with support?`;
    }

    const responseTimeMs = Date.now() - startedAt;
    const isUnknownIntent = intent === "unknown";

    // Simple confidence heuristic: 1.0 for recognized intents, 0.4 for generic help, 0.2 for unknown
    let confidence = 1.0;
    if (intent === "unknown") {
      confidence = 0.2;
    } else if (intent === "help.general") {
      confidence = 0.4;
    }

    // Optionally save a minimal, non-sensitive chat record (no raw text) for analytics
    try {
      if (mongoose.connection.readyState === 1) {
        await ChatMessage.create({
          intent,
          role,
          userId: req.user?.id || req.user?._id || undefined,
          hasError: false,
          isUnknownIntent,
          supportOffered: needsSupportOffer,
          usedAi,
          responseTimeMs,
        });
      }
    } catch (dbError) {
      // Log only on server side; don't break the response
      console.error("Failed to save chat message", dbError);
    }

    return res.json({
      reply: finalReply,
      intent,
      confidence,
      status: "ok",
    });
  } catch (error) {
    console.error("Chat API error", error);
    // Graceful fallback on errors – never expose technical details to the user
    try {
      if (mongoose.connection.readyState === 1 && req.user) {
        await ChatMessage.create({
          intent: "error",
          role: req.user.role || "User",
          userId: req.user.id || req.user._id || undefined,
          hasError: true,
          isUnknownIntent: false,
          supportOffered: true,
        });
      }
    } catch (dbError) {
      console.error("Failed to save error chat metadata", dbError);
    }

    return res.json({
      reply:
        "I'm having trouble connecting right now. Please check your connection or try again in a moment. You can still use the main dashboard pages for appointments, prescriptions, and orders while chat recovers.",
      intent: "error",
      confidence: 0,
      status: "error",
    });
  }
});

// Lightweight chat analytics for admins
app.get("/api/chat-analytics", requireRole("Admin"), async (_req, res) => {
  if (!DB_ENABLED) {
    return res.json({
      dbEnabled: false,
      message: "Analytics are disabled because MongoDB is not configured.",
    });
  }

  try {
    const [byIntent, unanswered, perf] = await Promise.all([
      ChatMessage.aggregate([
        { $group: { _id: "$intent", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ChatMessage.aggregate([
        {
          $match: {
            $or: [{ isUnknownIntent: true }, { hasError: true }],
          },
        },
        { $group: { _id: "$intent", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ChatMessage.aggregate([
        {
          $match: { responseTimeMs: { $gt: 0 } },
        },
        {
          $group: {
            _id: null,
            avgResponseTimeMs: { $avg: "$responseTimeMs" },
            maxResponseTimeMs: { $max: "$responseTimeMs" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const perfStats = perf[0] || null;

    return res.json({
      dbEnabled: true,
      mostCommonIntents: byIntent.map((row) => ({ intent: row._id || "(none)", count: row.count })),
      unansweredIntents: unanswered.map((row) => ({ intent: row._id || "(none)", count: row.count })),
      performance: perfStats && {
        avgResponseTimeMs: perfStats.avgResponseTimeMs,
        maxResponseTimeMs: perfStats.maxResponseTimeMs,
        sampleSize: perfStats.count,
      },
    });
  } catch (err) {
    console.error("Chat analytics error", err);
    return res.status(500).json({ message: "Failed to load chat analytics" });
  }
});
// Auth: signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Treat database as disabled if MongoDB is not connected,
    // so auth continues to work in demo/local modes.
    const useDb = DB_ENABLED && mongoose.connection.readyState === 1;

    if (!useDb) {
      const demoUser = {
        _id: "demo-user-" + Date.now().toString(),
        name,
        email: email.toLowerCase(),
        role: role || "User",
      };
      const token = createToken(demoUser);
      return res.status(201).json({
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        },
        token,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "User",
    });

    const token = createToken(user);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error", err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Treat database as disabled if MongoDB is not connected,
    // so auth continues to work in demo/local modes.
    const useDb = DB_ENABLED && mongoose.connection.readyState === 1;
    let user;

    if (useDb) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      // Demo mode: accept any email/password and return a basic user.
      // Role can still be controlled on the frontend via the selection.
      user = {
        _id: "demo-user-" + Date.now().toString(),
        name: email.split("@")[0],
        email: email.toLowerCase(),
        role: "User",
      };
    }

    const token = createToken(user);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// ---------- Medicines routes ----------

// Get all medicines
app.get("/api/medicines", async (req, res) => {
  try {
    if (!DB_ENABLED) {
      // Demo mode: return a static sample list matching the frontend shape
      const demoMeds = [
        { id: 1, name: "Paracetamol", strength: "500mg", form: "Tablet", price: 5.99, stock: 100 },
        { id: 2, name: "Ibuprofen", strength: "200mg", form: "Tablet", price: 7.49, stock: 50 },
        { id: 3, name: "Amoxicillin", strength: "250mg", form: "Capsule", price: 12.99, stock: 25 },
        { id: 4, name: "Aspirin", strength: "100mg", form: "Tablet", price: 4.99, stock: 75 },
        { id: 5, name: "Vitamin C", strength: "1000mg", form: "Tablet", price: 9.99, stock: 200 },
      ];
      return res.json(demoMeds);
    }

    const meds = await Medicine.find().sort({ name: 1 });
    return res.json(meds);
  } catch (err) {
    console.error("Get medicines error", err);
    return res.status(500).json({ message: "Failed to fetch medicines" });
  }
});

// Create a new medicine (for admin use; no auth enforcement yet)
app.post("/api/medicines", async (req, res) => {
  try {
    const { name, strength, form, price, stock } = req.body || {};
    if (!name || !strength || !form || price == null) {
      return res.status(400).json({ message: "Missing required medicine fields" });
    }
    if (!DB_ENABLED) {
      // Demo mode: echo back a fake medicine object
      const demoMed = {
        id: Date.now(),
        name,
        strength,
        form,
        price,
        stock: stock ?? 0,
      };
      return res.status(201).json(demoMed);
    }

    const med = await Medicine.create({ name, strength, form, price, stock: stock ?? 0 });
    return res.status(201).json(med);
  } catch (err) {
    console.error("Create medicine error", err);
    return res.status(500).json({ message: "Failed to create medicine" });
  }
});

// ---------- Orders routes ----------

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, userEmail, items, totalAmount } = req.body || {};

    if (!Array.isArray(items) || items.length === 0 || totalAmount == null) {
      return res.status(400).json({ message: "Items and totalAmount are required" });
    }

    if (!DB_ENABLED) {
      const order = {
        id: "DEMO-" + Date.now().toString(),
        user: userId || undefined,
        userEmail,
        items,
        totalAmount,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      demoOrders.unshift(order);
      await recordAudit(
        req.user,
        "CREATE_ORDER",
        "Order",
        order.id,
        { totalAmount, itemCount: items.length }
      );
      return res.status(201).json(order);
    }

    const order = await Order.create({
      user: userId || undefined,
      userEmail,
      items,
      totalAmount,
    });
    await recordAudit(
      req.user || { id: userId, email: userEmail },
      "CREATE_ORDER",
      "Order",
      order._id,
      { totalAmount, itemCount: items.length }
    );
    return res.status(201).json(order);
  } catch (err) {
    console.error("Create order error", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
});

// Get orders for a user (by id or email)
app.get("/api/orders", async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (userEmail) filter.userEmail = userEmail;

    if (!DB_ENABLED) {
      const filtered = demoOrders.filter((order) => {
        if (filter.user && order.user !== filter.user) return false;
        if (filter.userEmail && order.userEmail !== filter.userEmail) return false;
        return true;
      });
      return res.json(filtered);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Get orders error", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ---------- Prescriptions routes ----------

// Create prescription
app.post("/api/prescriptions", async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      medicineName,
      strength,
      dosage,
      duration,
      prescribedDate,
      expiryDate,
      doctor,
      notes,
      status,
      refillCount,
    } = req.body || {};

    if (!medicineName) {
      return res.status(400).json({ message: "medicineName is required" });
    }

    if (!DB_ENABLED) {
      const prescription = {
        id: "DEMO-RX-" + Date.now().toString(),
        user: userId || undefined,
        userEmail,
        medicineName,
        strength,
        dosage,
        duration,
        prescribedDate,
        expiryDate,
        doctor,
        notes,
        status: status || "Active",
        refillCount: typeof refillCount === "number" ? refillCount : 0,
        createdAt: new Date().toISOString(),
      };
      demoPrescriptions.unshift(prescription);
      await recordAudit(
        req.user,
        "CREATE_PRESCRIPTION",
        "Prescription",
        prescription.id,
        { medicineName, doctor, status: prescription.status }
      );
      return res.status(201).json(prescription);
    }

    const prescription = await Prescription.create({
      user: userId || undefined,
      userEmail,
      medicineName,
      strength,
      dosage,
      duration,
      prescribedDate,
      expiryDate,
      doctor,
      notes,
      status: status || "Active",
      refillCount: typeof refillCount === "number" ? refillCount : 0,
    });
    await recordAudit(
      req.user || { id: userId, email: userEmail },
      "CREATE_PRESCRIPTION",
      "Prescription",
      prescription._id,
      { medicineName, doctor, status: prescription.status }
    );
    return res.status(201).json(prescription);
  } catch (err) {
    console.error("Create prescription error", err);
    return res.status(500).json({ message: "Failed to create prescription" });
  }
});

// Get prescriptions for a user (by id or email)
app.get("/api/prescriptions", async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (userEmail) filter.userEmail = userEmail;

    if (!DB_ENABLED) {
      const filtered = demoPrescriptions.filter((rx) => {
        if (filter.user && rx.user !== filter.user) return false;
        if (filter.userEmail && rx.userEmail !== filter.userEmail) return false;
        return true;
      });
      return res.json(filtered);
    }

    const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });
    return res.json(prescriptions);
  } catch (err) {
    console.error("Get prescriptions error", err);
    return res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
});

// Clinical: list all prescriptions (doctor/pharmacist/admin only)
app.get(
  "/api/clinical/prescriptions",
  requireRole("Doctor", "Pharmacist", "Admin"),
  async (req, res) => {
    try {
      if (!DB_ENABLED) {
        return res.json(demoPrescriptions);
      }
      const prescriptions = await Prescription.find().sort({ createdAt: -1 });
      return res.json(prescriptions);
    } catch (err) {
      console.error("Clinical get prescriptions error", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch clinical prescriptions" });
    }
  }
);

// Clinical: update prescription status
app.patch(
  "/api/prescriptions/:id",
  requireRole("Doctor", "Pharmacist", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body || {};
      if (!status) {
        return res.status(400).json({ message: "status is required" });
      }

      if (!DB_ENABLED) {
        const idx = demoPrescriptions.findIndex((rx) => rx.id === id);
        if (idx === -1) return res.status(404).json({ message: "Prescription not found" });
        demoPrescriptions[idx] = { ...demoPrescriptions[idx], status };
        await recordAudit(
          req.user,
          "UPDATE_PRESCRIPTION_STATUS",
          "Prescription",
          id,
          { status }
        );
        return res.json(demoPrescriptions[idx]);
      }

      const prescription = await Prescription.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!prescription)
        return res.status(404).json({ message: "Prescription not found" });
      await recordAudit(
        req.user,
        "UPDATE_PRESCRIPTION_STATUS",
        "Prescription",
        prescription._id,
        { status }
      );
      return res.json(prescription);
    } catch (err) {
      console.error("Update prescription status error", err);
      return res.status(500).json({ message: "Failed to update prescription status" });
    }
  }
);

// ---------- Refill requests routes ----------

// Create refill request
app.post("/api/refills", async (req, res) => {
  try {
    const { userId, userEmail, prescriptionId, medicineName, quantity, status } = req.body || {};

    if (!medicineName) {
      return res.status(400).json({ message: "medicineName is required" });
    }

    if (!DB_ENABLED) {
      const refill = {
        id: "DEMO-REF-" + Date.now().toString(),
        user: userId || undefined,
        userEmail,
        prescription: prescriptionId || undefined,
        medicineName,
        quantity,
        status: status || "Pending",
        requestedAt: new Date().toISOString(),
      };
      demoRefills.unshift(refill);
      await recordAudit(
        req.user,
        "CREATE_REFILL_REQUEST",
        "RefillRequest",
        refill.id,
        { medicineName, quantity, status: refill.status }
      );
      return res.status(201).json(refill);
    }

    const refill = await RefillRequest.create({
      user: userId || undefined,
      userEmail,
      prescription: prescriptionId || undefined,
      medicineName,
      quantity,
      status: status || "Pending",
    });
    await recordAudit(
      req.user || { id: userId, email: userEmail },
      "CREATE_REFILL_REQUEST",
      "RefillRequest",
      refill._id,
      { medicineName, quantity, status: refill.status }
    );
    return res.status(201).json(refill);
  } catch (err) {
    console.error("Create refill request error", err);
    return res.status(500).json({ message: "Failed to create refill request" });
  }
});

// Get refill requests for a user (by id or email)
app.get("/api/refills", async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (userEmail) filter.userEmail = userEmail;

    if (!DB_ENABLED) {
      const filtered = demoRefills.filter((refill) => {
        if (filter.user && refill.user !== filter.user) return false;
        if (filter.userEmail && refill.userEmail !== filter.userEmail) return false;
        return true;
      });
      return res.json(filtered);
    }

    const refills = await RefillRequest.find(filter).sort({ requestedAt: -1 });
    return res.json(refills);
  } catch (err) {
    console.error("Get refill requests error", err);
    return res.status(500).json({ message: "Failed to fetch refill requests" });
  }
});

// Clinical: list all refills (doctor/pharmacist/admin only)
app.get("/api/clinical/refills", requireRole("Doctor", "Pharmacist", "Admin"), async (req, res) => {
  try {
    if (!DB_ENABLED) {
      return res.json(demoRefills);
    }
    const refills = await RefillRequest.find().sort({ requestedAt: -1 });
    return res.json(refills);
  } catch (err) {
    console.error("Clinical get refills error", err);
    return res.status(500).json({ message: "Failed to fetch clinical refills" });
  }
});

// Clinical: update refill status
app.patch(
  "/api/refills/:id",
  requireRole("Doctor", "Pharmacist", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body || {};
      if (!status) {
        return res.status(400).json({ message: "status is required" });
      }

      if (!DB_ENABLED) {
        const idx = demoRefills.findIndex((r) => r.id === id);
        if (idx === -1) return res.status(404).json({ message: "Refill not found" });
        demoRefills[idx] = { ...demoRefills[idx], status };
        await recordAudit(
          req.user,
          "UPDATE_REFILL_STATUS",
          "RefillRequest",
          id,
          { status }
        );
        return res.json(demoRefills[idx]);
      }

      const refill = await RefillRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!refill) return res.status(404).json({ message: "Refill not found" });
      await recordAudit(
        req.user,
        "UPDATE_REFILL_STATUS",
        "RefillRequest",
        refill._id,
        { status }
      );
      return res.json(refill);
    } catch (err) {
      console.error("Update refill status error", err);
      return res.status(500).json({ message: "Failed to update refill status" });
    }
  }
);

// ---------- Appointments routes ----------

// Create appointment
app.post("/api/appointments", async (req, res) => {
  try {
    const { userId, userEmail, doctorName, datetime, reason } = req.body || {};

    if (!doctorName || !datetime) {
      return res.status(400).json({ message: "doctorName and datetime are required" });
    }

    if (!DB_ENABLED) {
      const appt = {
        id: "DEMO-APT-" + Date.now().toString(),
        user: userId || undefined,
        userEmail,
        doctorName,
        datetime,
        reason,
        status: "Scheduled",
        createdAt: new Date().toISOString(),
      };
      demoAppointments.unshift(appt);
      return res.status(201).json(appt);
    }

    const appt = await Appointment.create({
      user: userId || undefined,
      userEmail,
      doctorName,
      datetime,
      reason,
    });

    return res.status(201).json(appt);
  } catch (err) {
    console.error("Create appointment error", err);
    return res.status(500).json({ message: "Failed to create appointment" });
  }
});

// Update appointment (e.g., reschedule or cancel)
app.patch("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { datetime, status } = req.body || {};

    if (!datetime && !status) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const userId = req.user?.id || req.user?._id;
    const userEmail = req.user?.email;

    if (!DB_ENABLED) {
      const index = demoAppointments.findIndex((appt) => appt.id === id);
      if (index === -1) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const appt = demoAppointments[index];

      if (
        (userId && appt.user && appt.user !== userId) ||
        (userEmail && appt.userEmail && appt.userEmail !== userEmail)
      ) {
        return res.status(403).json({ message: "You cannot modify this appointment" });
      }

      if (datetime) appt.datetime = datetime;
      if (status) appt.status = status;

      demoAppointments[index] = appt;
      return res.json(appt);
    }

    // Prefer to match by id and (when available) the owning user,
    // but fall back to id-only so chatbot flows remain robust.
    let matchFilter = {
      _id: id,
    };

    if (userId || userEmail) {
      matchFilter = {
        _id: id,
        $or: [
          ...(userId ? [{ user: userId }] : []),
          ...(userEmail ? [{ userEmail }] : []),
        ],
      };
    }

    const update = {};
    if (datetime) update.datetime = datetime;
    if (status) update.status = status;

    let updated = await Appointment.findOneAndUpdate(matchFilter, update, { new: true });

    // If we failed due to a too-strict filter, try id-only as a safe fallback
    if (!updated) {
      updated = await Appointment.findByIdAndUpdate(id, update, { new: true });
    }

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Update appointment error", err);
    return res.status(500).json({ message: "Failed to update appointment" });
  }
});

// Get appointments for a user (by id or email)
app.get("/api/appointments", async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (userEmail) filter.userEmail = userEmail;

    if (!DB_ENABLED) {
      const filtered = demoAppointments.filter((appt) => {
        if (filter.user && appt.user !== filter.user) return false;
        if (filter.userEmail && appt.userEmail !== filter.userEmail) return false;
        return true;
      });
      return res.json(filtered);
    }

    const appts = await Appointment.find(filter).sort({ datetime: 1 });
    return res.json(appts);
  } catch (err) {
    console.error("Get appointments error", err);
    return res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

async function start() {
  if (DB_ENABLED) {
    try {
      await mongoose.connect(MONGODB_URI, {
        dbName: process.env.DB_NAME || "online-medicose",
      });
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection error", err);
    }
  } else {
    console.warn("MONGODB_URI not set; running in demo mode without database.");
  }

  app.listen(PORT, () => {
    console.log(`MERN backend listening on port ${PORT}`);
  });
}

start();
