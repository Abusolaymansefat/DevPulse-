import { Router } from "express";
import { create, getIssue, getIssues, remove, update } from "./issue.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

// create issue
router.post("/", verifyToken, create);

// get all issues
router.get("/", getIssues);

// get single issue
router.get("/:id", getIssue );

// update issue
router.patch("/:id", verifyToken, update);

// delete issue
router.delete("/:id", verifyToken, remove);

export const issueRouter = router;