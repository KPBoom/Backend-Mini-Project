import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { protect } from "../Middlewares/protect.mjs";

const bookRouter = Router();

bookRouter.post("/",protect, async (req, res) => {
  const newBook = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };
  try {
    await connectionPool.query(
      `INSERT INTO books (title,category,created_at,updated_at) 
            VALUES($1,$2,$3,$4)`,
      [newBook.title, newBook.category, newBook.created_at, newBook.updated_at]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not create book because database connection",
    });
  }
  return res.status(201).json({
    message: "Created book sucessfully",
  });
});

bookRouter.get("/",protect, async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(`SELECT * from books`);
  } catch {
    return res.status(500).json({
      message: "Server could not read book because database issue",
    });
  }

  return res.status(200).json({ data: results.rows });
});

bookRouter.put("/:id",protect, async (req, res) => {
  const bookId = req.params.id;
  const updateBook = {
    ...req.body,
    updated_at: new Date(),
  };
  try {
    const result = await connectionPool.query(
      `UPDATE books SET 
        title = $1,
        category = $2,
        updated_at = $3
        WHERE book_id = $4`,
      [updateBook.title, updateBook.category, updateBook.updated_at, bookId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Book not found",
      });
    }
  } catch {
    return res.status(500).json({
      message:
        "Server could not update book because of database connection issue",
    });
  }
  return res.status(200).json({
    message: "Updated book sucessfully",
  });
});

bookRouter.delete("/:id",protect, async (req, res) => {
  const bookId = req.params.id;
  try {
    const result = await connectionPool.query(
      `DELETE FROM books WHERE book_id = $1`,
      [bookId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: `Book not found`,
      });
    }
  } catch {
    return res.status(500).json({
      message:
        "Server could not delete book because of database connection issue",
    });
  }
  return res.status(200).json({
    message: "Deleted book successfully",
  });
});

export default bookRouter;
