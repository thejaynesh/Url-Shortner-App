import express from "express";
import { urlModel } from "../model/shortUrl";

// Helper to normalize and validate URL
const formatUrl = (url: string): string => {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const createUrl = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { fullUrl } = req.body;
    if (!fullUrl || typeof fullUrl !== "string") {
      return res.status(400).send({ message: "Full URL is required" });
    }

    const normalizedUrl = formatUrl(fullUrl);

    // Basic URL format validation
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).send({ message: "Invalid URL provided" });
    }

    const urlFound = await urlModel.find({ fullUrl: normalizedUrl });
    if (urlFound.length > 0) {
      return res.status(200).send(urlFound[0]);
    } else {
      const shortUrl = await urlModel.create({ fullUrl: normalizedUrl });
      return res.status(201).send(shortUrl);
    }
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export const getAllUrl = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const shortUrls = await urlModel.find().sort({ createdAt: -1 });
    return res.status(200).send(shortUrls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export const getUrl = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const shortUrl = await urlModel.findOne({ shortUrl: req.params.id });
    if (!shortUrl) {
      return res.status(404).send({ message: "Short URL not found" });
    } else {
      shortUrl.clicks++;
      await shortUrl.save();
      return res.redirect(shortUrl.fullUrl);
    }
  } catch (error) {
    console.error("Error redirecting to URL:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export const deleteUrl = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const shortUrl = await urlModel.findByIdAndDelete(req.params.id);
    if (!shortUrl) {
      return res.status(404).send({ message: "URL not found" });
    }
    return res.status(200).send({ message: "Requested URL deleted successfully" });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};
