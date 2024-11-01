import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectionPool from "../utils/db.mjs";

const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Server error
 */
authRouter.post("/register", async (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    created_at: new Date(),
  };

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await connectionPool.query(
      `INSERT INTO users (username, password, email, created_at) VALUES ($1, $2, $3, $4)`,
      [user.username, user.password, user.email, user.created_at]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: password not valid
 *       404:
 *         description: user not found
 *       500:
 *         description: Server error
 */
authRouter.post("/login", async (req, res) => {
  try {
    
    const result = await connectionPool.query(
      `SELECT * FROM users WHERE username = $1`,
      [req.body.username]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
   
    
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "password not valid" });
    }

    
    const token = jwt.sign({ user_id: user.user_id }, process.env.SECRET_KEY, {
      expiresIn: "900000",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

export default authRouter;
