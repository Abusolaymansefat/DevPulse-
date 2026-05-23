import {
      Router,
      type Request,
      type Response,
} from "express";

import {
      login,
      signup,
} from "./auth.controller";
import { verifyToken } from "../../middleware/auth.middleware";


const router = Router();



// signup
router.post(
      "/signup",
      signup
);


// signup test route
router.get(
      "/signup",
      (req: Request, res: Response) => {

            res.status(200).json({
                  success: true,
                  message: "Signup Route Working",
            });

      }
);


// login
router.post(
      "/login",
      login
);


// login test route
router.get(
      "/login",
      verifyToken,
      (req: Request, res: Response) => {

            res.status(200).json({
                  success: true,
                  message: "Login Route Working",
            });

      }
);


export const authRouter = router;