const firebaseConfig = {
  apiKey: "AIzaSyBOJU2e_yhYpza7n2HBtocACuxMAiLgzQ0",
  authDomain: "sih-eco-8f351.firebaseapp.com",
  databaseURL: "https://sih-eco-8f351-default-rtdb.firebaseio.com",
  projectId: "sih-eco-8f351",
  storageBucket: "sih-eco-8f351.firebasestorage.app",
  messagingSenderId: "1066298502957",
  appId: "1:1066298502957:web:153102e7032e13711beda4"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const leaderboardList = document.getElementById('leaderboard-list');
const yourRankDiv = document.getElementById('your-rank');

let userId = null;
auth.onAuthStateChanged(user => {
  if(user) {
    userId = user.uid;
    loadLeaderboard();
  } else {
    yourRankDiv.textContent = "Login to see your rank.";
    loadLeaderboard();
  }
});

function loadLeaderboard() {
  db.ref('leaderboard/scores').orderByChild('score').limitToLast(15).once('value', snapshot => {
    const scores = [];
    snapshot.forEach(child => {
      scores.push({ uid: child.key, ...child.val() });
    });
    scores.sort((a,b) => b.score - a.score);

    leaderboardList.innerHTML = '';
    scores.forEach((score, index) => {
      const li = document.createElement('li');
      const displayName = score.username || score.uid;
      li.textContent = `${index + 1}. ${displayName}: ${score.score}`;
      leaderboardList.appendChild(li);
    });

    if (userId) {
      const rank = scores.findIndex(s => s.uid === userId);
      yourRankDiv.textContent =
        (rank >= 0)
        ? `Your Rank: ${rank + 1}`
        : "You are not in top 15 yet. Keep trying!";
    }
  });
}
