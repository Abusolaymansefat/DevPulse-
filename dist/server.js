

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.routes.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
dotenv.config({ quiet: true });
var config = {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.database_url
});
var initDB = async () => {
  try {
    await pool.query(`
                   CREATE TABLE IF NOT EXISTS users (

                  id SERIAL PRIMARY KEY,
                  name VARCHAR(100) NOT NULL,
                  email VARCHAR(150) UNIQUE NOT NULL,
                  password TEXT NOT NULL,
                  role VARCHAR(20) NOT NULL DEFAULT 'contributor',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  );

                  CREATE TABLE IF NOT EXISTS issues (
                  id SERIAL PRIMARY KEY,
                  title VARCHAR(150) NOT NULL,
                  description TEXT NOT NULL,
                  type VARCHAR(30) NOT NULL,
                  status VARCHAR(30) DEFAULT 'open',
                  reporter_id INT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  );
                  
                  `);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required"
    );
  }
  const options = {
    expiresIn: "7d"
  };
  return jwt.sign(
    payload,
    secret,
    options
  );
};

// src/modules/auth/auth.service.ts
var signupUser = async (payload) => {
  console.log(payload);
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
var loginUser = async (email, password) => {
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
  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const user = await signupUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(
      email,
      password
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// src/modules/auth/auth.routes.ts
var router = Router();
router.post("/signup", signup);
router.post("/login", login);
var authRouter = router;

// src/modules/issues/issue.routes.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssue = async (payload, reporterId) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title,description,type,reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
  `,
    [title, description, type, reporterId]
  );
  return result.rows[0];
};
var getAllIssues = async (sort = "newest", type, status) => {
  let query = `SELECT * FROM issues`;
  let conditions = [];
  let values = [];
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }
  if (status) {
    conditions.push(
      `status = $${values.length + 1}`
    );
    values.push(status);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  query += ` ORDER BY created_at ${sort === "oldest" ? "ASC" : "DESC"}`;
  const issues = await pool.query(query, values);
  return issues.rows;
};
var getSingleIssue = async (issueId) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const reporterResult = await pool.query(
    `
    SELECT id,name,role
    FROM users
    WHERE id = $1
  `,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssue = async (issueId, payload, user) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "maintainer") {
    const updatedIssue = await pool.query(
      `
      UPDATE issues
      SET
      title = $1,
      description = $2,
      type = $3,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
      [
        payload.title,
        payload.description,
        payload.type,
        issueId
      ]
    );
    return updatedIssue.rows[0];
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error(
        "You can update only your own issue"
      );
    }
    if (issue.status !== "open") {
      throw new Error(
        "Only open issue can be updated"
      );
    }
    const updatedIssue = await pool.query(
      `
      UPDATE issues
      SET
      title = $1,
      description = $2,
      type = $3,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
      [
        payload.title,
        payload.description,
        payload.type,
        issueId
      ]
    );
    return updatedIssue.rows[0];
  }
  throw new Error("Unauthorized");
};
var deleteIssue = async (issueId, user) => {
  if (user.role !== "maintainer") {
    throw new Error(
      "Only maintainer can delete issue"
    );
  }
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  await pool.query(
    `DELETE FROM issues WHERE id = $1`,
    [issueId]
  );
  return true;
};

// src/modules/issues/issue.controller.ts
var create = async (req, res) => {
  try {
    const reporterId = req.user?.id;
    if (!reporterId) {
      throw new Error("Reporter id is required");
    }
    const issue = await createIssue(req.body, Number(reporterId));
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var getIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const issues = await getAllIssues(
      sort,
      type,
      status
    );
    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getIssue = async (req, res) => {
  try {
    const issue = await getSingleIssue(
      Number(req.params.id)
    );
    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
var update = async (req, res) => {
  try {
    const updatedIssue = await updateIssue(
      // console.log(req.params.id),
      Number(req.params.id),
      // console.log(req.body),
      req.body,
      // console.log(req.user),
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var remove = async (req, res) => {
  try {
    await deleteIssue(
      Number(req.params.id),
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }
    const decoded = jwt2.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

// src/modules/issues/issue.routes.ts
var router2 = Router2();
router2.post("/", verifyToken, create);
router2.get("/", getIssues);
router2.get("/:id", getIssue);
router2.patch("/:id", verifyToken, update);
router2.delete("/:id", verifyToken, remove);
var issueRouter = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  console.log(
    `Method: ${req.method} | URL: ${req.url} | Time: ${Date.now()}`
  );
  const log = `
Method -> ${req.method}
URL: ${req.originalUrl}
Status: ${res.statusCode}
Time   -> ${(/* @__PURE__ */ new Date()).toLocaleString()}
-----------------------------------
`;
  fs.appendFile("logger.txt", log, (err) => {
    if (err) {
      console.log(err);
    }
  });
  next();
};
var logger_default = logger;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
var app_default = app;

// src/server.ts
var main = async () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server is running on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map