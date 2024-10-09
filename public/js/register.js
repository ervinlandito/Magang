document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");
  const registerButton = document.getElementById("btnRegister");
  const showPasswordCheckbox = document.getElementById("togglePassword");

  function showLoading() {
    registerButton.disabled = true;
    const existingSpinner = registerButton.querySelector(".spinner");
    if (!existingSpinner) {
      const spinner = document.createElement("span");
      spinner.className = "spinner";
      spinner.textContent = " Loading...";
      registerButton.appendChild(spinner);
    }
  }

  function hideLoading() {
    registerButton.disabled = false;
    const spinner = registerButton.querySelector(".spinner");
    if (spinner) {
      registerButton.removeChild(spinner);
    }
  }

  function validatePassword(password, email) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (password.length === 0) {
      return "Password tidak boleh kosong";
    } else if (!password.match(passwordPattern)) {
      return "Password harus terdiri dari minimal 8 karakter, dan terdiri dari satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus";
    } else if (password.toLowerCase() === "password") {
      return 'Password tidak boleh berupa kata "password".';
    } else if (email && password.includes(email)) {
      return "Password tidak boleh mengandung email anda.";
    }
    return "";
  }

  function togglePasswordVisibility() {
    const type = showPasswordCheckbox.checked ? "text" : "password";
    passwordInput.type = type;
    confirmPasswordInput.type = type;
  }

  showPasswordCheckbox.addEventListener("change", togglePasswordVisibility);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    passwordError.textContent = "";
    confirmPasswordError.textContent = "";

    let isValid = true;

    const passwordValidationError = validatePassword(
      passwordInput.value,
      emailInput.value
    );
    if (passwordValidationError) {
      passwordError.textContent = passwordValidationError;
      isValid = false;
    }

    if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordError.textContent = "Passwords do not match.";
      isValid = false;
    }

    if (isValid) {
      showLoading();

      try {
        const response = await fetch("/api/admin/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        alert("Berhasil Mendaftar");
        window.location.replace(
          `${window.location.origin}/${responseData.path}`
        );
      } catch (error) {
        console.error("Error:", error);
      } finally {
        hideLoading();
      }
    }
  });
});
