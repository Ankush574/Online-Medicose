import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    // We intentionally do NOT require or rely on raw message text here
    // to avoid storing sensitive medical or personal data in chat logs.
    userMessage: { type: String },
    botReply: { type: String },
    intent: { type: String },
    role: { type: String },
    userId: { type: String },
    hasError: { type: Boolean, default: false },
    isUnknownIntent: { type: Boolean, default: false },
    supportOffered: { type: Boolean, default: false },
    usedAi: { type: Boolean, default: false },
    responseTimeMs: { type: Number },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
