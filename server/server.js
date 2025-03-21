
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173", credentials: true } });

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const users = [];

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: "User created successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true }).json({ message: "Logged in" });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Real-time bank drop tracking mock
let lastBankState = [];
const RARE_DROP_VALUE = 1000000;

const checkForNewDrops = async () => {
  try {
    const bankResponse = await axios.get("http://localhost:8080/runelite/bank");
    const currentBank = bankResponse.data;

    if (lastBankState.length > 0) {
      const newItems = currentBank.filter(newItem =>
        !lastBankState.some(oldItem => oldItem.id === newItem.id && oldItem.quantity === newItem.quantity)
      );

      newItems.forEach(item => {
        io.emit("item_drop", { message: \`You received: \${item.name} x\${item.quantity}\` });
        const totalValue = item.price * item.quantity;
        if (totalValue >= RARE_DROP_VALUE) {
          io.emit("rare_drop", { name: item.name, value: totalValue });
        }
      });
    }

    lastBankState = currentBank;
  } catch (err) {
    console.error("Error fetching bank data:", err);
  }
};

setInterval(checkForNewDrops, 10000);

io.on("connection", socket => {
  console.log("User connected:", socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
