import fs from "fs";
import type { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
      // Console Log
      console.log(
            `Method: ${req.method} | URL: ${req.url} | Time: ${Date.now()}`
      );

      // File Log
      const log = `
Method -> ${req.method}
URL: ${req.originalUrl}
Status: ${res.statusCode}
Time   -> ${new Date().toLocaleString()}
-----------------------------------
`;

      fs.appendFile("logger.txt", log, (err) => {
            if (err) {
                  console.log(err);
            }
      });

      next();
};

export default logger;