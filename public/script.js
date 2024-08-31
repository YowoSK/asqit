document.addEventListener("DOMContentLoaded", () => {
  fetch("/categories")
    .then((response) => response.json())
    .then((data) => {
      const categorySelect = document.getElementById("categorySelect");
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.text = category;
        categorySelect.appendChild(option);
      });
      updateCategoryStatus();
    });
});

function updateCategoryStatus() {
  fetch("/category-status")
    .then((response) => response.json())
    .then((data) => {
      const categorySelect = document.getElementById("categorySelect");
      let allExhausted = true;
      for (let i = 0; i < categorySelect.options.length; i++) {
        const option = categorySelect.options[i];
        if (data[option.value]) {
          option.disabled = true;
          option.classList.add("exhausted");
        } else {
          option.disabled = false;
          option.classList.remove("exhausted");
          allExhausted = false;
        }
      }
      if (allExhausted) {
        document.getElementById("question").innerText =
          "All categories are exhausted. No more questions available.";
        document.querySelector("button").disabled = true;
        document.getElementById("resetButton").style.display = "block";
      }
    });
}

function getQuestion() {
  const category = document.getElementById("categorySelect").value;
  const questionDiv = document.getElementById("question");
  questionDiv.style.opacity = 0; // Start fade-out

  setTimeout(() => {
    fetch(`/question?category=${category}`)
      .then((response) => response.json())
      .then((data) => {
        questionDiv.innerText = data.question;
        questionDiv.style.opacity = 1; // Start fade-in
        if (data.question.includes("No more questions available")) {
          updateCategoryStatus();
        }
      });
  }, 1000);
}

function resetQuestions() {
  fetch("/reset", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("question").innerText =
        "Select a category and click the button to get a question!";
      document.querySelector("button").disabled = false;
      document.getElementById("resetButton").style.display = "none";
      updateCategoryStatus();
    });
}
