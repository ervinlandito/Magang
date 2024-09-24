const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieParser());

// Koneksi ke MySQL menggunakan variabel dari .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi ke MySQL gagal:', err);
  } else {
    console.log('Terhubung ke MySQL');
  }
});

// Page routes
app.get("/", (req, res) => {
  res.render("map");
});

app.get("/tjs/admin/login", (req, res) => {
  res.render("login");
});

app.get("/tjs/admin/register", (req, res) => {
  res.render("register");
});

app.get("/tjs/admin/dashboard", (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    db.query("SELECT * FROM umkm", (err, results) => {
      if (err) throw err;
      res.render("admin", { data: results }); // kirim data hasil query ke halaman admin
    });
  } else {
    res.redirect("/tjs/admin/login");
  }
});


app.get("/tjs/admin/edit/:id", (req, res) => {
  const id = req.params.id;
  res.render("editForm", { id });
});

// API routes
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error di server" });
      } else if (results.length > 0) {
        const token = jwt.sign(username, process.env.SECRET_KEY);
        res.cookie("jwt", token, { httpOnly: true });
        res.send({ status: 200, message: "success" });
      } else {
        res.status(404).send({ message: "username atau password salah" });
      }
    }
  );
});


app.post("/api/admin/register", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    (err, results) => {
      if (results.length === 0) {
        db.query(
          "INSERT INTO admin (username, password) VALUES (?, ?)",
          [username, password],
          (err, result) => {
            if (err) {
              res.status(500).send({ message: "Error di server" });
            } else {
              res.send({ path: "tjs/admin/login" });
            }
          }
        );
      } else {
        res.status(409).json({ message: "Username sudah ada" });
      }
    }
  );
});

app.get("/api/admin/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/tjs/admin/login");
});

app.get("/api/admin/verification", (req, res) => {
  const token = req.cookies.jwt;

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send("Forbidden");
    } else {
      res.send({ path: "tjs/admin/dashboard" });
    }
  });
});

app.get("/api/location", (req, res) => {
  db.query("SELECT * FROM umkm", (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get("/api/getDataById/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM umkm WHERE id = ?", [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});


app.post("/api/addData", (req, res) => {
  const {
    umkmName,
    umkmOwner,
    instagramUrl,
    whatsappNumber,
    gmapsUrl,
    lat,
    lng,
  } = req.body;

  const whatsapp = `https://wa.me/${whatsappNumber}`;

  db.query(
    "INSERT INTO umkm (umkm_name, umkm_owner, instagram, whatsapp, lat, lng, gmaps_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [umkmName, umkmOwner, instagramUrl, whatsapp, lat, lng, gmapsUrl],
    (err, result) => {
      if (err) throw err;
      res.send({ path: "tjs/admin/dashboard" });
    }
  );
});


app.post("/api/editData/:id", (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const whatsapp = `https://wa.me/${data.whatsapp}`;

  db.query(
    `UPDATE umkm SET umkm_name = ?, umkm_owner = ?, instagram = ?, whatsapp = ?, lat = ?, lng = ?, gmaps_url = ? WHERE id = ?`,
    [data.umkmName, data.umkmOwner, data.instagram, whatsapp, data.lat, data.lng, data.gmapsUrl, id],
    (err, result) => {
      if (err) throw err;
      res.send({ path: "tjs/admin/dashboard" });
    }
  );
});

app.delete("/api/deleteData/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM umkm WHERE id = ?", [id], (err, result) => {
    if (err) throw err;
    res.redirect("/tjs/admin/dashboard");
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
