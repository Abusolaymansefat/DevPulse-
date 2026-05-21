import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { pool } from "../../db";

export const signupUser = async (payload: any) => {
  const { name, email, password, role } = payload;

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role)
    VALUES($1,$2,$3,$4)
    RETURNING id,name,email,role,created_at,updated_at
  `,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    throw new Error("Invalid credentials");
  }

//   const token = generateToken({
//     id: user.id,
//     name: user.name,
//     role: user.role,
//   });

  return {
//     token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};