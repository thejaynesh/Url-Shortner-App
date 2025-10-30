import { Response } from "express";
import { urlModel } from "../model/shortUrl";
import { AuthRequest } from "../middlewares/authMiddleware";

// Helper to normalize and validate URL
const formatUrl = (url: string): string => {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const createUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { fullUrl } = req.body;
    if (!fullUrl || typeof fullUrl !== "string") {
      return res.status(400).json({ message: "Full URL is required" });
    }

    const normalizedUrl = formatUrl(fullUrl);

    // URL format validation
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ message: "Invalid URL provided" });
    }

    const userId = req.user?.id || null;
    const clientToken = req.clientToken || null;

    if (!userId && !clientToken) {
      return res.status(400).json({
        message: "Identity header (user authentication or client token) is required to secure your link tracking.",
      });
    }

    // Check if THIS user/creator already created a link for this destination
    const existingQuery = userId
      ? { fullUrl: normalizedUrl, userId }
      : { fullUrl: normalizedUrl, creatorToken: clientToken, userId: null };

    const urlFound = await urlModel.findOne(existingQuery);
    if (urlFound) {
      return res.status(200).json(urlFound);
    }

    // Create new secure short URL record tied to the owner
    const newShortUrl = await urlModel.create({
      fullUrl: normalizedUrl,
      userId: userId,
      creatorToken: userId ? null : clientToken,
    });

    return res.status(201).json(newShortUrl);
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ONLY returns URLs shortened by the requesting user or guest device
export const getAllUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || null;
    const clientToken = req.clientToken || null;

    if (!userId && !clientToken) {
      return res.status(200).json([]);
    }

    const query = userId
      ? { userId }
      : { creatorToken: clientToken, userId: null };

    const shortUrls = await urlModel.find(query).sort({ createdAt: -1 });
    return res.status(200).json(shortUrls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Public redirect endpoint: increments clicks and routes visitor to destination
export const getUrl = async (req: AuthRequest, res: Response) => {
  try {
    const shortUrl = await urlModel.findOne({ shortUrl: req.params.id });
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    shortUrl.clicks++;
    await shortUrl.save();
    return res.redirect(shortUrl.fullUrl);
  } catch (error) {
    console.error("Error redirecting to URL:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Private tracking endpoint: Only the creator can inspect analytics for a link
export const getUrlStats = async (req: AuthRequest, res: Response) => {
  try {
    const shortUrl = await urlModel.findOne({ shortUrl: req.params.id });
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    const userId = req.user?.id;
    const clientToken = req.clientToken;

    const isOwner =
      (userId && shortUrl.userId && shortUrl.userId.toString() === userId) ||
      (!shortUrl.userId && clientToken && shortUrl.creatorToken === clientToken);

    if (!isOwner) {
      return res.status(403).json({
        message: "Forbidden: Tracking data is strictly private to the creator of this link.",
      });
    }

    return res.status(200).json({
      _id: shortUrl._id,
      fullUrl: shortUrl.fullUrl,
      shortUrl: shortUrl.shortUrl,
      clicks: shortUrl.clicks,
      createdAt: (shortUrl as any).createdAt,
      updatedAt: (shortUrl as any).updatedAt,
    });
  } catch (error) {
    console.error("Error fetching link stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete endpoint: Enforces creator ownership
export const deleteUrl = async (req: AuthRequest, res: Response) => {
  try {
    const shortUrl = await urlModel.findById(req.params.id);
    if (!shortUrl) {
      return res.status(404).json({ message: "URL not found" });
    }

    const userId = req.user?.id;
    const clientToken = req.clientToken;

    const isOwner =
      (userId && shortUrl.userId && shortUrl.userId.toString() === userId) ||
      (!shortUrl.userId && clientToken && shortUrl.creatorToken === clientToken);

    if (!isOwner) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to delete this URL.",
      });
    }

    await urlModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Requested URL deleted successfully" });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
