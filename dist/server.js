"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"));

// src/modules/issues/issue.router.ts
var import_express = require("express");

// src/Middleware/auth.jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var config = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET
};
var config_default = config;

// src/Middleware/auth.jwt.ts
var authJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }
    const decoded = import_jsonwebtoken.default.verify(
      token,
      config_default.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// src/DB/db.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.DATABASE_URL
});
console.log("database connect successfully");
var db_default = pool;

// src/modules/issues/issue.service.ts
var createIssueInToDB = async (payload) => {
  const { title, description, type, user } = payload;
  const reporter_id = user.id;
  const result = await db_default.query(
    `
        INSERT INTO issues
        (title, description, type, status, reporter_id)
        VALUES ($1, $2, $3, 'open', $4)
        RETURNING *
        `,
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};
var getAllIssuesFromDB = async (query) => {
  let { sort = "newest", type, status } = query;
  let conditions = [];
  let values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  let whereClause = "";
  if (conditions.length > 0) {
    whereClause = "WHERE " + conditions.join(" AND ");
  }
  let orderBy = "ORDER BY created_at DESC";
  if (sort === "oldest") {
    orderBy = "ORDER BY created_at ASC";
  }
  const issuesResult = await db_default.query(
    `
        SELECT * FROM issues
        ${whereClause}
        ${orderBy}
        `,
    values
  );
  const issues = issuesResult.rows;
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  let usersMap = {};
  if (reporterIds.length > 0) {
    const usersResult = await db_default.query(
      `
            SELECT id, name, role
            FROM users
            WHERE id = ANY($1)
            `,
      [reporterIds]
    );
    usersResult.rows.forEach((user) => {
      usersMap[user.id] = user;
    });
  }
  const finalData = issues.map((issue) => {
    return {
      ...issue,
      reporter: usersMap[issue.reporter_id] || null
    };
  });
  return finalData;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await db_default.query(
    `
        SELECT * FROM issues
        WHERE id = $1
        `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const userResult = await db_default.query(
    `
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0] || null;
  return {
    ...issue,
    reporter
  };
};
var updateIssueIntoDB = async (id, payload, user) => {
  const issueResult = await db_default.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;
  if (!isMaintainer) {
    if (!isOwner) {
      throw new Error("Not allowed to update this issue");
    }
    if (issue.status !== "open") {
      throw new Error("You can only update open issues");
    }
  }
  const { title, description, type } = payload;
  const result = await db_default.query(
    `
        UPDATE issues
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            status = CASE 
                        WHEN $4 = true THEN 'in_progress'
                        ELSE status
                     END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
    [
      title || null,
      description || null,
      type || null,
      isMaintainer,
      id
    ]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const issueResult = await db_default.query(
    `
        SELECT * FROM issues
        WHERE id = $1
        `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  await db_default.query(
    `
        DELETE FROM issues
        WHERE id = $1
        `,
    [id]
  );
  return;
};
var issueService = {
  createIssueInToDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/utills/reusefile/reUse.ts
var SendResponse = (res, data) => {
  return res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data
  });
};
var reUse_default = SendResponse;

// src/utills/reusefile/reUseError.ts
var sendError = (res, errorData) => {
  res.status(errorData.statusCode).json({
    success: false,
    message: errorData.message,
    errors: errorData.errors
  });
};
var reUseError_default = sendError;

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueInToDB({
      ...req.body,
      user: req.user
    });
    reUse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    reUseError_default(res, {
      statusCode: 400,
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    reUse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    reUseError_default(res, {
      statusCode: 400,
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await issueService.getSingleIssueFromDB(id);
    reUse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    reUseError_default(res, {
      statusCode: 404,
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await issueService.updateIssueIntoDB(
      id,
      req.body,
      req.user
    );
    reUse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    reUseError_default(res, {
      statusCode: 400,
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const id = req.params.id;
    await issueService.deleteIssueFromDB(id);
    reUse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    reUseError_default(res, {
      statusCode: 400,
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/Middleware/role.ts
var checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }
    next();
  };
};

// src/modules/issues/issue.router.ts
var router = (0, import_express.Router)();
router.post("/", authJWT, issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", authJWT, issueController.updateIssue);
router.delete(
  "/:id",
  authJWT,
  checkRole("maintainer"),
  issueController.deleteIssue
);
var issuesRoute = router;

// src/modules/auth/auth.router.ts
var import_express2 = require("express");

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var setUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const checkUser = await db_default.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (checkUser.rows.length > 0) {
    throw new Error("User already exists");
  }
  const hashedPassword = await import_bcryptjs.default.hash(password, 10);
  const result = await db_default.query(
    `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role || "contributor"]
  );
  return result.rows[0];
};
var getUserLoginFromDB = async (payload) => {
  const { email, password } = payload;
  const userResult = await db_default.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (userResult.rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  const user = userResult.rows[0];
  const isMatch = await import_bcryptjs.default.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
  delete user.password;
  return user;
};
var authService = {
  setUserIntoDB,
  getUserLoginFromDB
};

// src/modules/auth/auth.controller.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var signupUser = async (req, res) => {
  try {
    const result = await authService.setUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const user = await authService.getUserLoginFromDB(req.body);
    const token = import_jsonwebtoken2.default.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role
      },
      config_default.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.message
    });
  }
};
var authController = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.router.ts
var router2 = (0, import_express2.Router)();
router2.post("/signup", authController.signupUser);
router2.post("/login", authController.loginUser);
var authRouter = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use("/api/issues", issuesRoute);
app.use("/api/auth", authRouter);
app.get("/", async (req, res) => {
  res.send("connect");
});
var app_default = app;

// src/DB/initdb.ts
var initDB = async () => {
  try {
    await db_default.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db_default.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        reporter_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tables created successfully");
  } catch (error) {
    console.log(error);
  }
};
var initdb_default = initDB;

// src/server.ts
var main = async () => {
  initdb_default();
  app_default.listen(config_default.PORT, () => {
    console.log(`server is running on port ${config_default.PORT}\u2705`);
  });
};
main();
//# sourceMappingURL=server.js.map