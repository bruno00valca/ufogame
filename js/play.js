function initPlay() {
  const gameZone = document.getElementById("gameZone");
  const remainingTimeEl = document.getElementById("remainingTime");
  const scoreEl = document.getElementById("score");
  const statusMsgEl = document.getElementById("statusMsg");
  const stopBtn = document.getElementById("stopGameBtn");

  const prefs = JSON.parse(localStorage.getItem("gamePreferences")) || {
    numUfos: 5,
    gameTime: 60,
    doubleSpeed: false,
  };

  // initialize Game with prefs and elements
  Game.init(prefs, {
    gameZone,
    remainingTimeEl,
    scoreEl,
    statusMsgEl,
    stopBtn,
  });

  gameZone.addEventListener("click", (e) => {
    const rect = gameZone.getBoundingClientRect();
    const yRel = e.clientY - rect.top;
    if (yRel > rect.height - 120) {
      if (!Game.missile.launched) Game.launchMissile();
    }
  });
}
