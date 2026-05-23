import { Router } from "express";
import { login, signup } from "./auth.controller";

const router = Router();

router.post("/signup", signup);
router.get("/signup", (req, res) => {
  res.send("signup Route");
});
router.post("/login", login);
router.get("/login", (req, res) => {
  res.send("Login Route");
});

export  const authRouter = router;