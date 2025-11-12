function changeContent(page) {
  const container = document.getElementById("container");
  fetch(`./pages/${page}.html`)
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;

      switch (page) {
        case "records":
          getRecords();
          break;
        case "preferences":
          initPreferences();
          break;
        case "login":
          initLogin();
          break;
        case "home":
          initHome();
          break;
        case "play":
          initPlay();
          break;
        default:
          console.warn(`there is no init generator for page: ${page}`);
          break;
      }
    })
    .catch((err) => console.error("Error uploading page:", err));
}

document.getElementById("container").addEventListener("click", function (e) {
  if (e.target && e.target.id === "mybtn") {
    getRecords();
  }
});
