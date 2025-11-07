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
      return res.status(400).json({ message: "Invalid URL provided. Please include a valid web address." });
    }

    const userId = req.user?.id || null;
    const clientToken = req.clientToken || null;

    // If authenticated user already shortened this link, reuse their existing link
    if (userId) {
      const existingUserLink = await urlModel.findOne({ fullUrl: normalizedUrl, userId });
      if (existingUserLink) {
        return res.status(200).json(existingUserLink);
      }
    } else if (clientToken) {
      // If guest with client token already shortened it, reuse
      const existingGuestLink = await urlModel.findOne({ fullUrl: normalizedUrl, creatorToken: clientToken, userId: null });
      if (existingGuestLink) {
        return res.status(200).json(existingGuestLink);
      }
    }

    // Create new short URL (works without login, attaches to user if logged in)
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

// Returns tracking list: ONLY for authenticated users
export const getAllUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || null;

    // Tracking is strictly an account feature
    if (!userId) {
      return res.status(200).json([]);
    }

    const shortUrls = await urlModel.find({ userId }).sort({ createdAt: -1 });
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

// Private tracking endpoint: Only the logged-in owner can inspect detailed analytics
export const getUrlStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "You must be logged in to inspect tracking analytics for this link.",
      });
    }

    const shortUrl = await urlModel.findOne({ shortUrl: req.params.id });
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    const isOwner = shortUrl.userId && shortUrl.userId.toString() === userId;
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

// Delete endpoint: Enforces authenticated owner permission
export const deleteUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required to delete links." });
    }

    const shortUrl = await urlModel.findById(req.params.id);
    if (!shortUrl) {
      return res.status(404).json({ message: "URL not found" });
    }

    const isOwner = shortUrl.userId && shortUrl.userId.toString() === userId;
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
