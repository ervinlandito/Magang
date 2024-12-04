/**
 * @jest-environment jsdom
 */

// addData.test.js
jest.mock("node-fetch", () => jest.fn());
const fetch = require("node-fetch");

describe("Create UMKM Data", () => {
  const mockEvent = (overrides = {}) => ({
    preventDefault: jest.fn(),
    ...overrides,
  });

  let form,
    umkmName,
    umkmOwner,
    instagramUrl,
    whatsappNumber,
    gmapsUrl,
    latitude,
    longitude;

  beforeEach(() => {
    // Mock HTML Elements
    document.body.innerHTML = `
      <form id="umkmForm">
        <input id="umkm_name" value="Test UMKM">
        <input id="umkm_owner" value="Test Owner">
        <input id="instagram_url" value="https://instagram.com/testaccount">
        <input id="whatsapp_number" value="123456789012">
        <input id="gmaps_url" value="https://maps.google.com/testmap">
        <input id="latitude" value="10.123">
        <input id="longitude" value="20.456">
        <span id="umkmNameError"></span>
        <span id="umkmOwnerError"></span>
        <span id="instagramUrlError"></span>
        <span id="whatsappNumberError"></span>
        <span id="gmapsUrlError"></span>
        <span id="latitudeError"></span>
        <span id="longitudeError"></span>
      </form>
    `;

    form = document.getElementById("umkmForm");
    umkmName = document.getElementById("umkm_name");
    umkmOwner = document.getElementById("umkm_owner");
    instagramUrl = document.getElementById("instagram_url");
    whatsappNumber = document.getElementById("whatsapp_number");
    gmapsUrl = document.getElementById("gmaps_url");
    latitude = document.getElementById("latitude");
    longitude = document.getElementById("longitude");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully add data when all fields are valid", async () => {
    const mockResponse = { path: "success-path" };
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockResponse),
      status: 200,
    });

    const mockEventObj = mockEvent();
    const submitHandler = async (e) => {
      e.preventDefault();
      const response = await fetch("/api/addData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          umkmName: umkmName.value,
          umkmOwner: umkmOwner.value,
          instagramUrl: instagramUrl.value,
          whatsappNumber: whatsappNumber.value,
          gmapsUrl: gmapsUrl.value,
          lat: parseFloat(latitude.value),
          lng: parseFloat(longitude.value),
        }),
      });
      const responseData = await response.json();
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResponse);
    };

    await submitHandler(mockEventObj);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/addData", expect.any(Object));
  });

  test("should handle error during data submission", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockEventObj = mockEvent();
    const submitHandler = async (e) => {
      e.preventDefault();
      try {
        await fetch("/api/addData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            umkmName: umkmName.value,
            umkmOwner: umkmOwner.value,
            instagramUrl: instagramUrl.value,
            whatsappNumber: whatsappNumber.value,
            gmapsUrl: gmapsUrl.value,
            lat: parseFloat(latitude.value),
            lng: parseFloat(longitude.value),
          }),
        });
      } catch (error) {
        expect(error.message).toBe("Network error");
        console.error("Error:", error);
      }
    };

    await submitHandler(mockEventObj);
    expect(fetch).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
