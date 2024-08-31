const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

let questions = {};
let originalQuestions = {};
let askedQuestions = {};
let exhaustedCategories = {};

fs.readFile("questions.json", (err, data) => {
  if (err) throw err;
  questions = JSON.parse(data);
  originalQuestions = JSON.parse(JSON.stringify(questions)); // Make a copy of the original questions
  for (let category in questions) {
    askedQuestions[category] = [];
    exhaustedCategories[category] = false;
  }
});

app.use(express.static("public"));

app.get("/categories", (req, res, next) => {
  try {
    res.json(Object.keys(questions));
  } catch (err) {
    next(err);
  }
});

app.get("/category-status", (req, res, next) => {
  try {
    res.json(exhaustedCategories);
  } catch (err) {
    next(err);
  }
});

app.get("/question", (req, res, next) => {
  try {
    const category = req.query.category;
    if (!category || !questions[category]) {
      const err = new Error("Invalid category");
      err.status = 400;
      throw err;
    }

    if (questions[category].length === 0) {
      exhaustedCategories[category] = true;
      const message = Object.values(exhaustedCategories).every(
        (status) => status
      )
        ? "All categories are exhausted. No more questions available."
        : "No more questions available in this category. Please choose a different category.";
      return res.json({ question: message });
    }

    let randomQuestionIndex = Math.floor(
      Math.random() * questions[category].length
    );
    let question = questions[category].splice(randomQuestionIndex, 1)[0];
    askedQuestions[category].push(question);

    res.json(question);
  } catch (err) {
    next(err);
  }
});

app.post("/reset", (req, res, next) => {
  try {
    questions = JSON.parse(JSON.stringify(originalQuestions));
    for (let category in questions) {
      askedQuestions[category] = [];
      exhaustedCategories[category] = false;
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
