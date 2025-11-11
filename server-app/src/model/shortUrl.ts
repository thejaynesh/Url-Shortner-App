import mongoose from "mongoose";
import { nanoid } from "nanoid";

const clickLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    country: {
      type: String,
      default: "Unknown",
    },
    city: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    browser: {
      type: String,
      default: "Other",
    },
    os: {
      type: String,
      default: "Other",
    },
    referrer: {
      type: String,
      default: "Direct",
    },
  },
  { _id: false }
);

const shortUrlSchema = new mongoose.Schema(
  {
    fullUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      default: () => nanoid().substring(0, 10),
    },
    clicks: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    creatorToken: {
      type: String,
      default: null,
    },
    clickLogs: {
      type: [clickLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const urlModel = mongoose.model("shortUrl", shortUrlSchema);
