const form = document.getElementById("loginForm");
const nip = document.getElementById("nip");
const password = document.getElementById("password");
const showPasswordCheckbox = document.getElementById("togglePassword");
const loginButton = document.getElementById("btnLogin");
const errorMessage = document.getElementById("errorMessage");

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

  errorMessage.textContent = "";
  errorMessage.style.display = "none";

  if (nip.value.length === 0) {
    errorMessage.textContent = "NIP tidak boleh kosong";
    errorMessage.style.display = "block";
    return;
  } else if (nip.value.length !== 18) {
    errorMessage.textContent = "NIP harus berjumlah 18 digit";
    errorMessage.style.display = "block";
    return;
  }

  if (password.value.length === 0) {
    errorMessage.textContent = "Password tidak boleh kosong";
    errorMessage.style.display = "block";
    return;
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
    if (response.status === 404) {
      swal("Error!", responseData.message, "error");
    } else if (response.status === 401) {
      swal("Error!", responseData.message, "error");
    } else if (response.status === 200) {
      window.location.replace(`${window.location.origin}/${responseData.path}`);
    }
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
  }
});
