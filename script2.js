let ecoPoints = 0;
let rewards = [];

function updateDashboard() {
  document.getElementById("ecoPoints").textContent = ecoPoints;
  document.getElementById("progressBar").value = ecoPoints;
  let badges = "";
  if (ecoPoints >= 20) badges += "🌱";
  if (ecoPoints >= 40) badges += "🌳";
  if (ecoPoints >= 60) badges += "♻️";
  document.getElementById("badges").innerHTML = badges;
  updateRewards();
}

function completeLesson() {
  ecoPoints += 10;
  updateDashboard();
  alert("Lesson completed! Eco points +10");
}

function completeChallenge() {
  ecoPoints += 15;
  updateDashboard();
  alert("Challenge completed! Eco points +15");
}

function answerQuiz(correct) {
  if (correct) {
    ecoPoints += 5;
    alert("Correct! Eco points +5");
  } else {
    alert("Try again!");
  }
  updateDashboard();
}

function updateRewards() {
  rewards = [];
  if (ecoPoints >= 20) rewards.push("Eco Rookie Badge");
  if (ecoPoints >= 40) rewards.push("Eco Warrior Badge");
  if (ecoPoints >= 60) rewards.push("Eco Champion Badge");
  document.getElementById("rewardList").innerHTML = rewards.map(r => `<li>${r}</li>`).join("");
}

window.onload = updateDashboard;
