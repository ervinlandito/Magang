/**
 * @jest-environment jsdom
 */
const fetchMock = jest.fn();

global.fetch = fetchMock;

describe("Login Form Tests", () => {
  let form, nip, password, showPasswordCheckbox, loginButton, errorMessage;

  beforeEach(() => {
    // Set up the DOM structure
    document.body.innerHTML = `
      <form id="loginForm">
        <input type="text" id="nip" />
        <input type="password" id="password" />
        <input type="checkbox" id="togglePassword" />
        <button id="btnLogin">Login</button>
        <div id="errorMessage" style="display: none;"></div>
      </form>
    `;

    form = document.getElementById("loginForm");
    nip = document.getElementById("nip");
    password = document.getElementById("password");
    showPasswordCheckbox = document.getElementById("togglePassword");
    loginButton = document.getElementById("btnLogin");
    errorMessage = document.getElementById("errorMessage");

    // Import the script
    require("../../public/js/login");

    delete window.location;
    window.location = {
      replace: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetModules();
    fetchMock.mockClear();
  });

  test("Should display error if NIP is empty", () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(errorMessage.textContent).toBe("NIP tidak boleh kosong");
    expect(errorMessage.style.display).toBe("block");
  });

  test("Should display error if NIP length is not 18", () => {
    nip.value = "12345678";
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(errorMessage.textContent).toBe("NIP harus berjumlah 18 digit");
    expect(errorMessage.style.display).toBe("block");
  });

  test("Should display error if password is less than 8 characters", () => {
    nip.value = "123456789012345678";
    password.value = "short";
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(errorMessage.textContent).toBe("Password salah");
    expect(errorMessage.style.display).toBe("block");
  });

  test("Should display error if password is more than 20 characters", () => {
    nip.value = "123456789012345678";
    password.value = "short1234567819274658";
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(errorMessage.textContent).toBe("Password salah");
    expect(errorMessage.style.display).toBe("block");
  });

  test("Should call fetch with correct parameters on valid input", async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ path: "dashboard" }),
      status: 200,
    });

    nip.value = "123456789012345678";
    password.value = "Password123!";
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    // Wait for async operations to complete
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nip: "123456789012345678",
        password: "Password123!",
      }),
    });
  });
});
