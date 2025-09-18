// quiz.js (updated for auto-advance)

const quizzes = {
  beginner: [
    {
      question: "Which gas do plants breathe in?",
      answers: [
        { text: "Oxygen", correct: false },
        { text: "Carbon Dioxide", correct: true },
        { text: "Nitrogen", correct: false },
        { text: "Hydrogen", correct: false }
      ]
    },
    {
      question: "How can you save water?",
      answers: [
        { text: "Leave tap running", correct: false },
        { text: "Fix leaks", correct: true },
        { text: "Water wastefully", correct: false },
        { text: "Ignore", correct: false }
      ]
    }
  ],
  advanced: [
    {
      question: "Which of the following is a renewable source of energy?",
      answers: [
        { text: "Coal", correct: false },
        { text: "Solar", correct: true },
        { text: "Natural Gas", correct: false },
        { text: "Oil", correct: false }
      ]
    },
    {
      question: "What does 'carbon footprint' describe?",
      answers: [
        { text: "Your energy use", correct: false },
        { text: "Your water use", correct: false },
        { text: "Your greenhouse gas emissions", correct: true },
        { text: "Your recycling habits", correct: false }
      ]
    }
  ],
  funfact: [
    {
      question: "Did you know? The Amazon rainforest produces how much of the world's oxygen?",
      answers: [
        { text: "Approximately 20%", correct: true },
        { text: "5%", correct: false },
        { text: "50%", correct: false },
        { text: "90%", correct: false }
      ]
    },
    {
      question: "Which animal is the largest on earth?",
      answers: [
        { text: "Elephant", correct: false },
        { text: "Blue Whale", correct: true },
        { text: "Giraffe", correct: false },
        { text: "Great White Shark", correct: false }
      ]
    }
  ]
};

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
// Removed nextButton since auto-advance is used
const animationContainer = document.getElementById("animation-container");
const tabs = document.querySelectorAll(".tab");

let currentQuizType = "beginner";
let currentQuestions = quizzes[currentQuizType];
let currentQuestionIndex = 0;
let score = 0;
let userId = null;
let auth;
let db;

function initQuiz(firebaseAuth, firebaseDb) {
  auth = firebaseAuth;
  db = firebaseDb;

  auth.onAuthStateChanged(user => {
    userId = user ? user.uid : null;
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => setActiveTab(tab));
  });

  setActiveTab(tabs[0]); // initialize with first tab
}

function setActiveTab(selectedTab) {
  tabs.forEach(tab => tab.classList.remove("active"));
  selectedTab.classList.add("active");
  currentQuizType = selectedTab.getAttribute("data-quiz");
  currentQuestions = quizzes[currentQuizType];
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  resetState();
  const currentQuestion = currentQuestions[currentQuestionIndex];
  questionElement.innerText = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer.text;
    button.className = "btn";
    if (answer.correct) button.dataset.correct = answer.correct;
    button.addEventListener("click", selectAnswer);
    answerButtons.appendChild(button);
  });
}

function resetState() {
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
  clearAnimation();
  hideMessage();
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const correct = selectedBtn.dataset.correct === "true";
  if (correct) {
    score++;
    showMessage("Correct! Great job! ⭐⭐⭐", true);
    showAnimation(true);
  } else {
    showMessage("Incorrect! Keep learning & try again! 💪", false);
    showAnimation(false);
  }
  Array.from(answerButtons.children).forEach(button => {
    if (button.dataset.correct === "true") button.classList.add("correct");
    button.disabled = true;
  });

  // Auto advance after 1.5 seconds
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion();
    } else {
      showScore();
    }
  }, 1500);
}

function showScore() {
  resetState();
  questionElement.innerText = `Quiz completed! Your score: ${score} / ${currentQuestions.length}`;
  storeQuizResult();
}

function showAnimation(correct) {
  if (correct) {
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("div");
      star.classList.add("star");
      star.style.left = Math.random() * 100 + "vw";
      star.style.top = 90 + Math.random() * 10 + "vh";
      star.style.backgroundColor = "#FFD700";
      star.style.width = star.style.height = 10 + Math.random() * 15 + "px";
      star.style.position = "fixed";
      star.style.zIndex = "1050";
      star.style.borderRadius = "50%";
      star.style.animation = `floatUp 1.2s ease forwards`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1200);
    }
  } else {
    const quiz = document.getElementById("quiz-container");
    quiz.style.boxShadow = "0 0 15px 4px #cc3333cc";
    setTimeout(() => {
      quiz.style.boxShadow = "";
    }, 1000);
  }
}

function clearAnimation() {
  animationContainer.innerHTML = "";
}

function showMessage(message, isCorrect) {
  let msgDiv = document.querySelector(".message-popup");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.className = "message-popup";
    document.body.appendChild(msgDiv);
  }
  msgDiv.textContent = message;
  msgDiv.classList.remove("correct", "incorrect");
  msgDiv.classList.add(isCorrect ? "correct" : "incorrect", "show");

  setTimeout(() => {
    msgDiv.classList.remove("show");
  }, 2500);
}

function hideMessage() {
  const msgDiv = document.querySelector(".message-popup");
  if (msgDiv) msgDiv.classList.remove("show");
}

function storeQuizResult() {
  if (!userId) {
    alert("Please log in to save your quiz results.");
    return;
  }
  const dataRef = db.ref("quizResults/" + userId + "/" + currentQuizType);
  const resultData = {
    score: score,
    totalQuestions: currentQuestions.length,
    timestamp: new Date().toISOString()
  };
  dataRef
    .push(resultData)
    .then(() => console.log("Quiz result saved."))
    .catch(err => console.error("Error saving quiz result:", err));
}
function updateLeaderboard(newScore) {
  const leaderboardRef = db.ref(`leaderboard/scores/${userId}`);
  leaderboardRef.once('value', snapshot => {
    let oldScore = snapshot.val() ? snapshot.val().score : 0;
    if (newScore > oldScore) {
      leaderboardRef.set({ score: newScore });
    }
  });
}
