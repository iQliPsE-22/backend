const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { Admin, Student, List, Announcement } = require("../models");
const connectToDatabase = require("../db"); // Adjust the path as needed

connectToDatabase();

const server = express();

// Middleware to parse JSON and handle CORS
server.use(bodyParser.json());
server.use(
  cors({
    origin: "*", // Allow all origins; change this in production
  })
);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
server.post("/student", upload.single("profilePicture"), async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file);

    const {
      firstName,
      lastName,
      email,
      dob,
      roll,
      gender,
      college,
      course,
      stream,
      semester,
    } = req.body;

    const student = new Student({
      profilePicture: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      firstName,
      lastName,
      email,
      dob,
      roll,
      gender,
      college,
      course,
      stream,
      semester,
    });

    await student.save();
    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating student" });
  }
});

server.post("/admin", upload.single("profilePicture"), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirm } = req.body;

    const admin = new Admin({
      profilePicture: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      firstName,
      lastName,
      email,
      phone,
      password,
      confirm,
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating admin" });
  }
});

server.post("/list", async (req, res) => {
  try {
    const { enrollmentId, name, marks1, marks2 } = req.body;

    const list = new List({
      enrollmentId,
      name,
      marks1,
      marks2,
    });

    const savedList = await list.save();
    console.log(savedList);
    res.status(201).json({ message: "List item created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating list item" });
  }
});

server.delete("/list/:enrollmentId", async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    await List.deleteOne({ enrollmentId });
    res.status(200).json({ message: "List item deleted successfully" });
    console.log(enrollmentId + ": Deleted");
  } catch (error) {
    res.status(500).json({ error: "Error deleting list item" });
  }
});

server.post("/announcement", upload.single("file"), async (req, res) => {
  try {
    const { subject, announcement } = req.body;
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file);

    const announcementData = new Announcement({
      subject,
      announcement,
      file: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await announcementData.save();
    res.status(201).json({ message: "Announcement created successfully" });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Error creating announcement" });
  }
});

server.get("/announcement", async (req, res) => {
  try {
    const items = await Announcement.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching announcement data" });
  }
});

server.get("/admin", async (req, res) => {
  const docs = await Admin.find();
  res.json(docs);
});

server.get("/student", async (req, res) => {
  const docs = await Student.find();
  res.json(docs);
});

server.get("/list", async (req, res) => {
  try {
    const items = await List.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching list data" });
  }
});

server.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = server;
