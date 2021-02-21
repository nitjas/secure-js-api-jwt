require("dotenv").config({ path: "./variables.env" });
const express = require("express");
// const cors = require("cors");
// const { uuid } = require("uuidv4");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const {
  getUserByUsername,
  isEmptyObject,
  isPasswordCorrect,
  getAllBooks,
  getAllUsers,
  addBook,
  generateToken,
  verifyToken,
  getAudienceFromToken,
  getFavoriteBooksForUser,
} = require("./shared");
const Constants = require("./constants");
const app = express();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.json());
// app.use(cors());
app.use(cookieParser());

app.get("/users", verifyToken, (req, res) => {
  // check if user has access to this api
  if (getAudienceFromToken(req.cookies.token).includes(Constants.SHOW_USERS)) {
    getAllUsers().then((users) => {
      if (users && users.length > 0) {
        generateToken(req.cookies.token, null).then((token) => {
          res.cookie("token", token, { httpOnly: true });
          res.status(200).send({ users: users });
        });
      } else res.status(500).send({ users: [] });
    });
  } else res.status(403).send({ message: "Not authorized to view users" });
});

app.get("/books", verifyToken, (req, res) => {
  getAllBooks().then((books) => {
    if (books && books.length > 0) {
      generateToken(req.cookies.token, null).then((token) => {
        res.cookie("token", token, { httpOnly: true });
        res.status(200).send({ books: books });
      });
    } else res.status(500).send({ books: [] });
  });
});

app.post("/login", (req, res) => {
  let base64Encoding = req.headers.authorization.split(" ")[1];
  let credentials = Buffer.from(base64Encoding, "base64").toString().split(":");
  const username = credentials[0];
  const password = credentials[1];
  // get user by username
  // verify if the credentials are valid- if user exists then check password
  // return user object if valid
  // return an error message if not valid
  getUserByUsername(username).then((user) => {
    if (user && !isEmptyObject(user)) {
      isPasswordCorrect(user.key, password).then((result) => {
        if (!result) {
          res
            .status(401)
            .send({ message: "username or password is incorrect" });
        } else {
          generateToken(null, username).then((token) => {
            res.cookie("token", token, { httpOnly: true });
            res.status(200).send({ username: user.username, role: user.role });
          });
        }
      });
    } else
      res.status(401).send({ message: "username or password is incorrect" });
  });
});

app.get("/logout", verifyToken, (req, res) => {
  res.clearCookie("token");
  res.status(200).send({ message: "Cookies cleared" });
});

app.get("/favorite", verifyToken, (req, res) => {
  getFavoriteBooksForUser(req.cookies.token).then((books) => {
    generateToken(req.cookies.token, null).then((token) => {
      res.cookie("token", token, { httpOnly: true });
      res.status(200).send({ favorites: books });
    });
  });
});

app.post("/book", (req, res) => {
  console.log(req.body.name);
  console.log(req.body.author);
  if (!req.body.name || !req.body.author) {
    res.status(400).send({ message: "Invalid Book" });
  } else {
    if (getAudienceFromToken(req.cookies.token).includes(Constants.ADD_BOOK)) {
      // make sure you add every input validation here before sending it to the DB
      addBook({
        name: req.body.name,
        author: req.body.author,
        id: uuidv4(),
      }).then((err) => {
        if (err) res.status(500).send({ message: "Cannot add this book" });
        else {
          generateToken(req.cookies.token, null).then((token) => {
            res.cookie("token", token, { httpOnly: true });
            res.status(200).send({ message: "Book added successfully" });
          });
        }
      });
    } else res.status(403).send({ message: "Not authorized to add a book" });
  }
});
