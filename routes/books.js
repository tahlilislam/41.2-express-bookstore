const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const ExpressError = require("../expressError");

const bookstoreSchema = require("../schemas/bookstoreSchema.json");
const bookSchemaUpdate = require("../schemas/bookSchemaUpdate.json");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);

    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookstoreSchema);

    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      console.log(result);
      // validatorResult obj has errors property in result obj... which has ValidationError obj
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    const book = await Book.create(req.body);

    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    if ("isbn" in req.body) {
      let err = new ExpressError("Not Allowed", 400)
      return next(err)
    }
    const result = jsonschema.validate(req.body, bookSchemaUpdate);
    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
