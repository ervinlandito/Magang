const request = require("supertest");
const app = require("./index");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

jest.mock("mysql2/promise");

// Auth Endpoint
describe("Authentication Endpoints", () => {
  describe("POST /api/admin/register", () => {
    it("should successfully register a new admin", async () => {
      const mockExecute = jest.fn().mockResolvedValue([{ insertId: 1 }]);
      mysql.createConnection.mockResolvedValue({
        execute: mockExecute,
        end: jest.fn(),
      });

      const response = await request(app).post("/api/admin/register").send({
        nip: "123456789012345678",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("path", "tjs/admin/login");
    });

    it("should return an error for invalid NIP format", async () => {
      const response = await request(app).post("/api/admin/register").send({
        nip: "12345",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "NIP harus terdiri dari 18 digit angka"
      );
    });
  });

  describe("POST /api/admin/login", () => {
    it("should return a token on successful login", async () => {
      const mockUser = {
        nip: "123456789012345678",
        password: await bcrypt.hash("password123", 10),
      };

      const mockExecute = jest.fn().mockResolvedValue([[mockUser]]);
      mysql.createConnection.mockResolvedValue({
        execute: mockExecute,
        end: jest.fn(),
      });

      const response = await request(app)
        .post("/api/admin/login")
        .send({ nip: "123456789012345678", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", 200);
      expect(response.body).toHaveProperty("message", "success");
      expect(response.body).toHaveProperty("path", "tjs/admin/dashboard");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return an error on invalid NIP", async () => {
      const mockExecute = jest.fn().mockResolvedValue([[]]);
      mysql.createConnection.mockResolvedValue({
        execute: mockExecute,
        end: jest.fn(),
      });

      const response = await request(app)
        .post("/api/admin/login")
        .send({ nip: "123456789012345678", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "NIP atau Password salah"
      );
    });

    it("should return an error on incorrect password", async () => {
      const mockUser = {
        nip: "123456789012345678",
        password: await bcrypt.hash("correctpassword", 10),
      };

      const mockExecute = jest.fn().mockResolvedValue([[mockUser]]);
      mysql.createConnection.mockResolvedValue({
        execute: mockExecute,
        end: jest.fn(),
      });

      const response = await request(app)
        .post("/api/admin/login")
        .send({ nip: "123456789012345678", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "NIP atau Password salah"
      );
    });
  });
});

// Data Management Endpoint
describe("Data Management Endpoints", () => {
  describe("GET /api/location", () => {
    it("should return all UMKM locations", async () => {
      const mockLocations = [
        { id: 1, umkm_name: "Test UMKM", lat: -6.2088, lng: 106.8456 },
      ];

      const mockExecute = jest.fn().mockResolvedValue([mockLocations]);
      mysql.createConnection.mockResolvedValue({
        execute: mockExecute,
        end: jest.fn(),
      });

      const response = await request(app).get("/api/location");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe("POST /api/addData", () => {
    it("should successfully add new UMKM data", async () => {
      const mockExecute = jest.fn().mockResolvedValue([{ insertId: 1 }]);
      mysql.createConnection.mockResolvedValue({
        execute: mockExecute,
        end: jest.fn(),
      });

      const response = await request(app).post("/api/addData").send({
        umkmName: "New UMKM",
        umkmOwner: "John Doe",
        instagramUrl: "https://instagram.com/newumkm",
        whatsappNumber: "6281234567890",
        gmapsUrl: "https://goo.gl/maps/abc123",
        lat: -6.2088,
        lng: 106.8456,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("path", "tjs/admin/dashboard");
    });
  });
});

// Admin Dashboard Protection
describe("Admin Dashboard Protection", () => {
  it("should redirect to login when accessing dashboard without token", async () => {
    const response = await request(app).get("/tjs/admin/dashboard");
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/tjs/admin/login");
  });

  it("should allow access to dashboard with valid token", async () => {
    const token = jwt.sign(
      { nip: "123456789012345678" },
      process.env.SECRET_KEY
    );

    const mockExecute = jest
      .fn()
      .mockResolvedValue([[{ id: 1, umkm_name: "Test UMKM" }]]);
    mysql.createConnection.mockResolvedValue({
      execute: mockExecute,
      end: jest.fn(),
    });

    const response = await request(app)
      .get("/tjs/admin/dashboard")
      .set("Cookie", [`jwt=${token}`]);

    expect(response.status).toBe(200);
  });
});
