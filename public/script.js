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
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
      document.getElementById("question").innerText =
        "Error loading categories. Please try again later.";
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
    })
    .catch((error) => {
      console.error("Error updating category status:", error);
      document.getElementById("question").innerText =
        "Error updating category status. Please try again later.";
    });
}

function getQuestion() {
  const category = document.getElementById("categorySelect").value;
  const questionDiv = document.getElementById("question");
  questionDiv.style.opacity = 0; // Start fade-out

  setTimeout(() => {
    fetch(`/question?category=${category}`)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        questionDiv.innerText = data.question;
        questionDiv.style.opacity = 1; // Start fade-in
        if (data.question.includes("No more questions available")) {
          updateCategoryStatus();
        }
      })
      .catch((error) => {
        questionDiv.innerText = `Error: ${error.message}`;
        questionDiv.style.opacity = 1; // Start fade-in
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
    })
    .catch((error) => {
      console.error("Error resetting questions:", error);
      document.getElementById("question").innerText =
        "Error resetting questions. Please try again later.";
    });
}
