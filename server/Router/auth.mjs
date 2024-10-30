import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectionPool from "../utils/db.mjs";

const authRouter = Router();

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
    res.status(500).json({ message: "Failed to register user" });
  }
});

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
    res.status(500).json({ message: "Failed to login" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

export default authRouter;
