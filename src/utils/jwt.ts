import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export const generateToken = (
  payload: string | object
) => {

  const secret: Secret =
    process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required"
    );
  }

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(
    payload,
    secret,
    options
  );
};