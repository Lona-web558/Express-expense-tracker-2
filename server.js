const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const authenticate = require("./auth");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "expense-tracker-secret",
        resave: false,
        saveUninitialized: false
    })
);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Data files
const USERS_FILE = path.join(__dirname, "data", "users.json");
const EXPENSES_FILE = path.join(__dirname, "data", "expenses.json");

// ---------- Helper Functions ----------

function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readExpenses() {
    return JSON.parse(fs.readFileSync(EXPENSES_FILE));
}

function saveExpenses(expenses) {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
}

// ---------- Register ----------

app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required."
        });
    }

    const users = readUsers();

    const exists = users.find(user => user.username === username);

    if (exists) {
        return res.status(400).json({
            message: "Username already exists."
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now(),
        username,
        password: hashedPassword
    };

    users.push(newUser);

    saveUsers(users);

    res.json({
        message: "Registration successful!"
    });

});

// ---------- Login ----------

app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const users = readUsers();

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({
            message: "Invalid username or password."
        });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.status(400).json({
            message: "Invalid username or password."
        });
    }

    req.session.user = {
        id: user.id,
        username: user.username
    };

    res.json({
        message: "Login successful!"
    });

});

// ---------- Logout ----------

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            message: "Logged out successfully."
        });

    });

});

// ---------- Current User ----------

app.get("/me", authenticate, (req, res) => {

    res.json(req.session.user);

});

// ---------- Get Expenses ----------

app.get("/api/expenses", authenticate, (req, res) => {

    const expenses = readExpenses();

    const userExpenses = expenses.filter(expense =>
        expense.username === req.session.user.username
    );

    res.json(userExpenses);

});

// ---------- Add Expense ----------

app.post("/api/expenses", authenticate, (req, res) => {

    const { title, amount } = req.body;

    if (!title || !amount) {
        return res.status(400).json({
            message: "Title and amount are required."
        });
    }

    const expenses = readExpenses();

    const expense = {
        id: Date.now(),
        username: req.session.user.username,
        title,
        amount: Number(amount)
    };

    expenses.push(expense);

    saveExpenses(expenses);

    res.json(expense);

});

// ---------- Delete Expense ----------

app.delete("/api/expenses/:id", authenticate, (req, res) => {

    const id = Number(req.params.id);

    let expenses = readExpenses();

    expenses = expenses.filter(expense => {

        if (expense.id !== id) {
            return true;
        }

        return expense.username !== req.session.user.username;

    });

    saveExpenses(expenses);

    res.json({
        message: "Expense deleted."
    });

});

// ---------- Home ----------

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "login.html"));

});

// ---------- Start Server ----------

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});