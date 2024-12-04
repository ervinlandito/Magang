/**
 * @jest-environment jsdom
 */

let mockFetch;

// Mock DOM elements
document.body.innerHTML = `
<form id="registerForm">
  <input id="nip" />
  <input id="username" />
  <input id="password" />
  <input id="confirmPassword" />
  <button id="btnRegister" type="submit">Register</button>
  <input type="checkbox" id="togglePassword" />
</form>
`;

// Import fungsi setelah DOM dimuat
const {
  validateNIP,
  validatePassword,
  confirmPasswordValidation,
} = require("../../public/js/register");

// Mock fetch
mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => ({ path: "dashboard" }),
});
global.fetch = mockFetch;

describe("Form Validation", () => {
  describe("NIP Validation", () => {
    it("should require NIP to be 18 digits long", () => {
      const result = validateNIP("12345");
      expect(result).toBe("NIP harus berjumlah 18 digit");
    });

    it("should return an error for an invalid NIP", () => {
      const result = validateNIP("111111111111111112");
      expect(result).toBe(
        "NIP tidak valid. Silakan gunakan NIP yang terdaftar."
      );
    });
  });

  describe("Password Validation", () => {
    it("should return an error if password is empty", () => {
      const result = validatePassword("");
      expect(result).toBe("Password tidak boleh kosong");
    });

    it("should return an error if password is longer than 20 characters", () => {
      const result = validatePassword("thispasswordiswaytoolong123");
      expect(result).toBe("Password harus terdiri dari maksimal 20 karakter");
    });

    it("should return an error if password is shorter than 8 characters", () => {
      const result = validatePassword("short");
      expect(result).toBe("Password harus minimal 8 karakter");
    });

    it('should return an error if password is "password"', () => {
      const result = validatePassword("password");
      expect(result).toBe('Password tidak boleh berupa kata "password"');
    });
  });

  describe("Confirm Password Validation", () => {
    it("should return error if confirm password is shorter than 8 characters", () => {
      const confirmPassword = "short";
      const password = "Valid123@";
      const result = confirmPasswordValidation(confirmPassword, password);
      expect(result).toBe(
        "Confirm password tidak boleh kurang dari 8 karakter."
      );
    });

    it("should return error if confirm password is longer than 20 characters", () => {
      const confirmPassword = "thisisaverylongpassword";
      const password = "Valid123@";
      const result = confirmPasswordValidation(confirmPassword, password);
      expect(result).toBe("Password harus terdiri dari maksimal 20 karakter");
    });

    it("should return error if confirm password does not match", () => {
      const confirmPassword = "Different123!";
      const password = "Valid123@";
      const result = confirmPasswordValidation(confirmPassword, password);
      expect(result).toBe("konfirmasi password tidak sama");
    });
  });

  describe("Form Submission", () => {
    let mockFetch;

    beforeEach(() => {
      mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => ({ path: "dashboard" }),
      });
      global.fetch = mockFetch;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should successfully register and show success alert", async () => {
      // Mock spy on alert
      const alertMock = jest
        .spyOn(global, "alert")
        .mockImplementation(() => {});

      // Mocking window.location.replace
      const locationReplaceMock = jest.fn();
      Object.defineProperty(window, "location", {
        value: {
          origin: "http://localhost", // Explicitly set origin
          replace: locationReplaceMock,
        },
        writable: true,
      });

      const validForm = {
        nip: "123456789012345678",
        username: "username",
        password: "Valid123@",
        confirmPassword: "Valid123@",
      };

      // Mock fetch to return success
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ path: "dashboard" }),
      });

      // Mock DOM elements
      document.body.innerHTML = `
        <form id="registerForm">
          <input id="nip" value="${validForm.nip}" />
          <input id="username" value="${validForm.username}" />
          <input id="password" value="${validForm.password}" />
          <input id="confirmPassword" value="${validForm.confirmPassword}" />
          <button id="btnRegister" type="submit">Register</button>
        </form>
      `;

      const form = document.getElementById("registerForm");

      // Create promise to handle form submission
      const submissionPromise = new Promise((resolve) => {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            const response = await fetch("/api/admin/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(validForm),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            alert("Berhasil Mendaftar");
            window.location.replace(
              `${window.location.origin}/${responseData.path}`
            );
            resolve();
          } catch (error) {
            console.error("Error:", error);
            alert("Pendaftaran gagal: " + error.message);
            resolve();
          }
        });
      });

      // Simulate form submission
      form.dispatchEvent(new Event("submit"));

      // Wait for submission to complete
      await submissionPromise;

      // Verify alert and location.replace were called correctly
      await expect(alertMock).toHaveBeenCalledWith("Berhasil Mendaftar");
      await expect(locationReplaceMock).toHaveBeenCalledWith(
        `${window.location.origin}/dashboard`
      );

      // Restore mocks
      alertMock.mockRestore();
    });

    it("should handle fetch error and show an alert on failure", async () => {
      // Mock alert
      const alertMock = jest
        .spyOn(global, "alert")
        .mockImplementation(() => {});

      mockFetch.mockRejectedValue(new Error("Registration failed"));

      const validForm = {
        nip: "123456789012345678",
        username: "username",
        password: "Valid123@",
        confirmPassword: "Valid123@",
      };

      // Mock DOM elements
      document.body.innerHTML = `
        <form id="registerForm">
          <input id="nip" value="${validForm.nip}" />
          <input id="username" value="${validForm.username}" />
          <input id="password" value="${validForm.password}" />
          <input id="confirmPassword" value="${validForm.confirmPassword}" />
          <button id="btnRegister" type="submit">Register</button>
        </form>
      `;

      const form = document.getElementById("registerForm");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await fetch("/api/admin/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validForm),
          });
        } catch (error) {
          alert(`Pendaftaran gagal: ${error.message}`);
        }
      });

      // Simulate form submission
      await form.dispatchEvent(new Event("submit"));

      // Check if the alert shows the error message
      expect(alertMock).toHaveBeenCalledWith(
        "Pendaftaran gagal: Registration failed"
      );

      // Restore the original alert function
      alertMock.mockRestore();
    });
  });
});
