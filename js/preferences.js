function initPreferences() {
  const form = document.getElementById("preferencesForm");
  const numUfos = document.getElementById("numUfos");
  const gameTime = document.getElementById("gameTime");
  const doubleSpeed = document.getElementById("doubleSpeed");
  const statusMsg = document.getElementById("statusMsg");

  // Cargar configuración previa
  const savedPrefs = JSON.parse(localStorage.getItem("gamePreferences"));
  if (savedPrefs) {
    numUfos.value = savedPrefs.numUfos;
    gameTime.value = savedPrefs.gameTime;
    doubleSpeed.checked = savedPrefs.doubleSpeed;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const prefs = {
      numUfos: parseInt(numUfos.value),
      gameTime: parseInt(gameTime.value),
      doubleSpeed: doubleSpeed.checked,
    };

    localStorage.setItem("gamePreferences", JSON.stringify(prefs));

    statusMsg.textContent = "Preferences saved successfully!";
    setTimeout(() => (statusMsg.textContent = ""), 2500);
  });
}
