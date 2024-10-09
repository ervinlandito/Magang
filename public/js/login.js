const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const showPasswordCheckbox = document.getElementById("togglePassword");
let loginButton = document.getElementById("btnLogin");

function showLoading() {
  loginButton.disabled = true;
  const existingSpinner = loginButton.querySelector(".spinner");
  if (!existingSpinner) {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    spinner.textContent = "...";
    loginButton.appendChild(spinner);
  }
}

function hideLoading() {
  loginButton.disabled = false;
  const spinner = loginButton.querySelector(".spinner");
  if (spinner) {
    loginButton.removeChild(spinner);
  }
}

function togglePasswordVisibility() {
  const type = showPasswordCheckbox.checked ? "text" : "password";
  password.type = type;
}

showPasswordCheckbox.addEventListener("change", togglePasswordVisibility);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoading();

  if (email.value.length === 0) {
    alert("Email tidak boleh kosong");
  }
  if (password.length === 0) {
    alert("Password tidak boleh kosong");
  }

  try {
    fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.status === 404) {
          alert(responseData.message);
          hideLoading();
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
