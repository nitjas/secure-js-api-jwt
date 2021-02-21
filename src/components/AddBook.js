import React, { useState } from "react";
import {
  Grid,
  Typography,
  Button,
  TextField,
  Snackbar,
} from "@material-ui/core";
import "../styles.css";
import { AppHeader } from "./AppHeader";
const url = "http://localhost:5000/book";

export const AddBook = () => {
  const [book, setBookName] = useState("");
  const [author, setAuthorName] = useState("");
  // const [bookAdded, setBookAdded] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeBookName = (book) => setBookName(book);
  const onChangeAuthorName = (author) => setAuthorName(author);
  const onClick = () => {
    // setBookAdded(true);
    // setBookName("");
    // setAuthorName("");
    const bookData = { name: book, author: author };
    fetch(url, {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(bookData),
    })
      .then((res) => {
        setOpen(true);
        if (res.status === 200) {
          setBookName("");
          setAuthorName("");
        }
        return res.json();
      })
      .then((json) => setMessage(json.message))
      .catch((err) => console.log("Error adding book ", err.message));
  };

  const handleClose = () => setOpen(false);

  return (
    <div className="AddBook">
      <AppHeader tabValue={2} />
      <Grid container direction="column" alignItems="center">
        <Grid item style={{ marginBottom: "5vh" }}>
          <Typography variant="h3" gutterBottom>
            Add New Book!
            <span role="img" aria-label="books">
              📘
            </span>
          </Typography>
        </Grid>
        <Grid item style={{ marginBottom: "5vh" }}>
          <TextField
            id="bookname-input"
            variant="outlined"
            label="book"
            value={book}
            onChange={(e) => onChangeBookName(e.target.value)}
          />
        </Grid>
        <Grid item style={{ marginBottom: "5vh" }}>
          <TextField
            id="authorname-input"
            variant="outlined"
            label="author"
            value={author}
            onChange={(e) => onChangeAuthorName(e.target.value)}
          />
        </Grid>
        <Grid item style={{ marginBottom: "7vh" }}>
          <Button
            aria-label="login"
            variant="contained"
            size="large"
            color="primary"
            onClick={onClick}
          >
            ADD BOOK
          </Button>
        </Grid>
        <Grid>
          <Snackbar
            open={open}
            message={message}
            autoHideDuration={2000}
            onClose={handleClose}
          />
        </Grid>
      </Grid>
    </div>
  );
};
