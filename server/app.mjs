import express from "express";
import bookRouter from "./Router/book.mjs";
import authRouter from "./Router/auth.mjs";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 4001;

app.use(express.json());
app.use('/book',bookRouter);
app.use('/auth',authRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is OK!");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});