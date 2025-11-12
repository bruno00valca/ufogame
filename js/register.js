function initRegister() {
  const sendButton = document.querySelector("#container button.btn-primary");
  if (!sendButton) return;

  sendButton.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("Email").value.trim();
    const password = document.getElementById("pwd").value.trim();
    const password2 = document.getElementById("pwd2").value.trim();
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "";

    if (!username || !email || !password || !password2) {
      resultDiv.innerHTML = `<div class="alert alert-warning mt-3">Please fill in all fields.</div>`;
      return;
    }

    if (password !== password2) {
      resultDiv.innerHTML = `<div class="alert alert-danger mt-3">Passwords do not match.</div>`;
      return;
    }

    const body = { username, email, password };

    try {
      const response = await fetch("http://wd.etsisi.upm.es:10000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      if (response.status === 201) {
        resultDiv.innerHTML = `
            <div class="alert alert-success mt-3">
            User registered successfully!<br>
            </div>`;
      }
    } catch (error) {
      resultDiv.innerHTML = `
            <div class="alert alert-danger mt-3">
            Registration failed.<br>
            ${error.message}
            </div>`;
    }
  });
}
