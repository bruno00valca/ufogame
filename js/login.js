async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("pwd").value.trim();
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "";

  if (!username || !password) {
    resultDiv.innerHTML = `
      <div class="alert alert-warning mt-3">Please enter username and password.</div>`;
    return;
  }

  try {
    const url = `http://wd.etsisi.upm.es:10000/users/login?username=${username}&password=${password}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const token = response.headers.get("Authorization");

    localStorage.setItem("jwt", token);

    resultDiv.innerHTML = `
      <div class="alert alert-success mt-3">
        Login successful!<br>
      </div>`;

    setTimeout(() => {
      changeContent("home");
    }, 1500);
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="alert alert-danger mt-3">
        Login failed.<br>
      </div>`;
  }
}
