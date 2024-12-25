const express = require("express");
const fs = require("fs");
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const port = 3000;

const secret = crypto.randomBytes(64).toString('hex');

let questions = {};
let originalQuestions = {};

fs.readFile("questions.json", (err, data) => {
  if (err) throw err;
  questions = JSON.parse(data);
  originalQuestions = JSON.parse(JSON.stringify(questions)); // Make a copy of the original questions
});

app.use(express.static("public"));

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } //1 den cookie <3
}));

app.get('/start', (req, res) => {
    if (!req.session.userId) {
        req.session.userId = crypto.randomBytes(16).toString('hex'); // da unique ID kazdej session
        req.session.questions = JSON.parse(JSON.stringify(originalQuestions));
        req.session.askedQuestions = {};
        req.session.exhaustedCategories = {};
        for (let category in req.session.questions) {
            req.session.askedQuestions[category] = [];
            req.session.exhaustedCategories[category] = false;
        }
    }
    res.send({ userId: req.session.userId });
});

app.get("/categories", (req, res, next) => {
  try {
    res.json(Object.keys(req.session.questions));
  } catch (err) {
    next(err);
  }
});

app.get("/category-status", (req, res, next) => {
  try {
    res.json(req.session.exhaustedCategories);
  } catch (err) {
    next(err);
  }
});

app.get("/question", (req, res, next) => {
  try {
    const category = req.query.category;
    if (!category || !req.session.questions[category]) {
      const err = new Error("Invalid category");
      err.status = 400;
      throw err;
    }

    if (req.session.questions[category].length === 0) {
      req.session.exhaustedCategories[category] = true;
      const message = Object.values(req.session.exhaustedCategories).every(
        (status) => status
      )
        ? "All categories are exhausted. No more questions available."
        : "No more questions available in this category. Please choose a different category.";
      return res.json({ question: message });
    }

    let randomQuestionIndex = Math.floor(
      Math.random() * req.session.questions[category].length
    );
    let question = req.session.questions[category].splice(randomQuestionIndex, 1)[0];
    req.session.askedQuestions[category].push(question);

    res.json(question);
  } catch (err) {
    next(err);
  }
});

app.post("/reset", (req, res, next) => {
  try {
    req.session.questions = JSON.parse(JSON.stringify(originalQuestions));
    req.session.askedQuestions = {};
    req.session.exhaustedCategories = {};
    for (let category in req.session.questions) {
      req.session.askedQuestions[category] = [];
      req.session.exhaustedCategories[category] = false;
    }
    res.json({ message: "Questions have been reset." });
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
