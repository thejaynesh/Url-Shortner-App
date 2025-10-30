import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  clientToken?: string;
}

export const JWT_SECRET = process.env.JWT_SECRET || "linkpulse-secure-jwt-secret-2026";

// Middleware that extracts user info if a token is present, and always extracts clientToken
export const authOptional = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);
    const clientToken = req.headers["x-client-token"] as string;

    if (clientToken) {
      req.clientToken = clientToken;
    }

    if (authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : authHeader.trim();

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
          req.user = decoded;
        } catch (err) {
          // Token is invalid/expired - continue as unauthenticated guest
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Middleware that enforces that the user must be authenticated
export const authRequired = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);

  if (!authHeader) {
    return res.status(401).json({ message: "Authentication required to access this resource" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : authHeader.trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authorization token" });
  }
};
