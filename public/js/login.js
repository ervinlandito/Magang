const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");

function addSpinnerToButton() {
  var spinnerIcon = document.createElement("i");
  spinnerIcon.className = "fa fa-spinner fa-spin";

  var buttonElement = document.getElementById("btnLogin");

  buttonElement.appendChild(spinnerIcon);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  addSpinnerToButton();

  try {
    fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.status === 404) {
          alert(responseData.message);
        } else if (responseData.status === 200) {
          fetch(`/api/admin/verification`)
            .then((response) => response.json())
            .then((responseData) => {
              window.location.replace(
                `${window.location.origin}/${responseData.path}`
              );
            });
        }
      });
  } catch (error) {
    console.error("Error:", error);
  }
});
