import express, { type Application, type Request, type Response } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { issueRouter } from "./modules/issues/issue.routes";
import logger from "./middleware/logger";


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

export default app;