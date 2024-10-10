const form = document.getElementById("loginForm");
const nip = document.getElementById("nip");
const password = document.getElementById("password");
const showPasswordCheckbox = document.getElementById("togglePassword");
const loginButton = document.getElementById("btnLogin");

function showLoading() {
  loginButton.disabled = true;
  const existingSpinner = loginButton.querySelector(".spinner");
  if (!existingSpinner) {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    spinner.textContent = " Loading...";
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

  if (nip.value.length === 0) {
    alert("NIP tidak boleh kosong");
  } else if (nip.value.length !== 18) {
    alert("NIP harus berjumlah 18 digit");
  }

  if (password.value.length === 0) {
    alert("Password tidak boleh kosong");
  }

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nip: nip.value,
        password: password.value,
      }),
    });

    const responseData = await response.json();
    hideLoading();

    if (responseData.status === 404) {
      alert(responseData.message);
    } else if (responseData.status === 200) {
      window.location.replace(`${window.location.origin}/${responseData.path}`);
    }
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
  }
});
