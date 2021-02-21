const express = require("express");
const cors = require("cors");
// const { uuid } = require("uuidv4");
const { v4: uuidv4 } = require("uuid");
const {
  getUserByUsername,
  isEmptyObject,
  isPasswordCorrect,
  getAllBooks,
  getAllUsers,
  addBook,
} = require("./shared");
const app = express();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.json());
app.use(cors());

app.get("/users", (req, res) => {
  getAllUsers().then((users) => {
    if (users && users.length > 0) res.status(200).send({ users: users });
    else res.status(500).send({ users: [] });
  });
});

app.get("/books", (req, res) => {
  getAllBooks().then((books) => {
    if (books && books.length > 0) res.status(200).send({ books: books });
    else res.status(500).send({ books: [] });
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
        result
          ? res.status(200).send({ username: user.username, role: user.role })
          : res
              .status(401)
              .send({ message: "username or password is incorrect" });
      });
    } else
      res.status(401).send({ message: "username or password is incorrect" });
  });
});

app.get("/logout", (req, res) => {});

app.get("/favorite", (req, res) => {});

app.post("/book", (req, res) => {
  // make sure you add every input validation here before sending it to the DB
  addBook({ name: req.body.name, author: req.body.author, id: uuidv4() }).then(
    (err) => {
      if (err) res.status(500).send({ message: "Cannot add this book" });
      else res.status(200).send({ message: "Book added successfully" });
    }
  );
});
