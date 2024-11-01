import express from "express";
import bookRouter from "./Router/book.mjs";
import authRouter from "./Router/auth.mjs";
import dotenv from "dotenv";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';


dotenv.config();
const app = express();
const port = 4001;

app.use(express.json());
app.use('/book',bookRouter);
app.use('/auth',authRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is OK!");
});

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Backend Mini Project API",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
    },
    servers: [
      {
        url: "http://localhost:4001",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./Router/*.mjs"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});