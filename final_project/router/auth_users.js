const express = require('express');

const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username && user.password === password;
    });

    return userswithsamename.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const accessToken = jwt.sign(
        { username: username },
        "access_token_secret"
    );

    req.session.authorization = {
        accessToken: accessToken,
        username: username
    };

    return res.status(200).json({
        message: "Login successful",
        accessToken: accessToken
    });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    if (!req.session.authorization) {
        return res.status(401).json({
            message: "Unauthorized User"
        });
    }

    const username = req.session.authorization.username;

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!req.session.authorization) {
        return res.status(401).json({
            message: "Unauthorized User"
        });
    }

    const username = req.session.authorization.username;

    if (books[isbn].reviews && books[isbn].reviews[username]) {

        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            reviews: books[isbn].reviews
        });
    }

    return res.status(404).json({
        message: "Review not found"
    });
});

module.exports.authenticated = regd_users;

module.exports.isValid = isValid;

module.exports.users = users;