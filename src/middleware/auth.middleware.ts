import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

export const verifyToken = (
      req: Request,
      res: Response,
      next: NextFunction
) => {
      try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                  return res.status(401).json({
                        success: false,
                        message: "Unauthorized access",
                  });
            }

            const token = authHeader.startsWith("Bearer ")
                  ? authHeader.split(" ")[1]
                  : authHeader;

            if (!token) {
                  return res.status(401).json({
                        success: false,
                        message: "Unauthorized access",
                  });
            }

            const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET as string
            );

            req.user = decoded;

            next();
      } catch (error) {
            return res.status(401).json({
                  success: false,
                  message: "Invalid token",
            });
      }
};