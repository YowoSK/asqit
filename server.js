const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

let questions = {};
let originalQuestions = {};
let askedQuestions = {};
let exhaustedCategories = {};

fs.readFile('questions.json', (err, data) => {
    if (err) throw err;
    questions = JSON.parse(data);
    originalQuestions = JSON.parse(JSON.stringify(questions)); // Make a copy of the original questions
    for (let category in questions) {
        askedQuestions[category] = [];
        exhaustedCategories[category] = false;
    }
});

app.use(express.static('public'));

app.get('/categories', (req, res) => {
    res.json(Object.keys(questions));
});

app.get('/category-status', (req, res) => {
    res.json(exhaustedCategories);
});

app.get('/question', (req, res) => {
    const category = req.query.category;
    if (!category || !questions[category]) {
        res.status(400).json({ error: "Invalid category" });
        return;
    }

    if (questions[category].length === 0) {
        exhaustedCategories[category] = true;
        if (Object.values(exhaustedCategories).every(status => status)) {
            res.json({ question: "All categories are exhausted. No more questions available." });
        } else {
            res.json({ question: "No more questions available in this category. Please choose a different category." });
        }
        return;
    }

    let randomQuestionIndex = Math.floor(Math.random() * questions[category].length);
    let question = questions[category].splice(randomQuestionIndex, 1)[0];
    askedQuestions[category].push(question);

    res.json(question);
});

app.post('/reset', (req, res) => {
    questions = JSON.parse(JSON.stringify(originalQuestions));
    for (let category in questions) {
        askedQuestions[category] = [];
        exhaustedCategories[category] = false;
    }
    res.json({ message: "Questions have been reset." });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});