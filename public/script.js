let userId;

document.addEventListener("DOMContentLoaded", () => {
  startGame();
});

function startGame() {
  fetch("/start")
    .then((response) => response.json())
    .then((data) => {
      userId = data.userId;
      console.log("ID používateľa:", userId);
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
          console.error("Chyba pri načítaní kategórií:", error);
          document.getElementById("question").innerText =
            "Chyba pri načítaní kategórií. Skúste to prosím neskôr.";
        });
    });
}

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
          "Všetky kategórie sú vyčerpané. Žiadne ďalšie otázky nie sú k dispozícii.";
        document.querySelector("button").disabled = true;
        document.getElementById("resetButton").style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Chyba pri aktualizácii stavu kategórií:", error);
      document.getElementById("question").innerText =
        "Chyba pri aktualizácii stavu kategórií. Skúste to prosím neskôr.";
    });
}

function getQuestion() {
  const category = document.getElementById("categorySelect").value;
  const questionDiv = document.getElementById("question");
  questionDiv.style.opacity = 0; // Start fade-out

  setTimeout(() => {
    fetch(`/question?category=${category}&userId=${userId}`)
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
        if (data.question.includes("Žiadne ďalšie otázky nie sú k dispozícii")) {
          updateCategoryStatus();
        }
      })
      .catch((error) => {
        questionDiv.innerText = `Chyba: ${error.message}`;
        questionDiv.style.opacity = 1; // Start fade-in
      });
  }, 1000);
}

function resetQuestions() {
  fetch("/reset", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("question").innerText =
        "Vyberte kategóriu a kliknite na tlačidlo, aby ste dostali otázku!";
      document.querySelector("button").disabled = false;
      document.getElementById("resetButton").style.display = "none";
      updateCategoryStatus();
    })
    .catch((error) => {
      console.error("Chyba pri resetovaní otázok:", error);
      document.getElementById("question").innerText =
        "Chyba pri resetovaní otázok. Skúste to prosím neskôr.";
    });
}
