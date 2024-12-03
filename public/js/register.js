document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const nip = document.getElementById("nip");
  const nipError = document.getElementById("nipError");
  const username = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");
  const registerButton = document.getElementById("btnRegister");
  const showPasswordCheckbox = document.getElementById("togglePassword");

  const validNIPs = [
    "123456789012345678",
    "987654321012345678",
    "111111111111111111",
    "222222222222222222",
    "333333333333333333",
  ];

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

  function validatePassword(password) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (password.length === 0) {
      return "Password tidak boleh kosong";
    } else if (password.length > 20) {
      return "Password harus terdiri dari maksimal 20 karakter";
    } else if (password.length < 8) {
      return "Password harus minimal 8 karakter";
    } else if (!password.match(passwordPattern)) {
      return "Password harus terdiri dari minimal 8 karakter, dan terdiri dari satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus";
    } else if (password.toLowerCase() === "password") {
      return 'Password tidak boleh berupa kata "password".';
    }
    return "";
  }

  function validateNIP(nipValue) {
    if (!/^\d{18}$/.test(nipValue)) {
      return "NIP harus berjumlah 18 digit";
    }
    if (!validNIPs.includes(nipValue)) {
      return "NIP tidak valid. Silakan gunakan NIP yang terdaftar.";
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
    nipError.textContent = "";

    let isValid = true;

    const nipValidationError = validateNIP(nip.value);
    if (nipValidationError) {
      nipError.textContent = nipValidationError;
      isValid = false;
    }

    const passwordValidationError = validatePassword(passwordInput.value);
    if (passwordValidationError) {
      passwordError.textContent = passwordValidationError;
      isValid = false;
    }

    if (confirmPasswordInput.value.length < 8) {
      confirmPasswordError.textContent =
        "Confirm password tidak boleh kurang dari 8 karakter.";
      isValid = false;
    } else if (confirmPasswordInput.value.length > 20) {
      confirmPasswordError.textContent =
        "Password harus terdiri dari maksimal 20 karakter";
      isValid = false;
    } else if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordError.textContent = "konfirmasi password tidak sama";
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
            nip: nip.value,
            username: username.value,
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
        alert("Pendaftaran gagal: " + error.message);
      } finally {
        hideLoading();
      }
    }
  });
});
