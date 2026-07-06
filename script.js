// Elements
const usernameElement = document.getElementById("username");
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const totalElement = document.getElementById("total");
const logoutBtn = document.getElementById("logoutBtn");

let expenses = [];

// ------------------------------
// Check Logged-in User
// ------------------------------

async function getCurrentUser() {

    const response = await fetch("/me");

    if (!response.ok) {

        window.location = "login.html";
        return;

    }

    const user = await response.json();

    usernameElement.textContent = user.username;

}

// ------------------------------
// Load Expenses
// ------------------------------

async function loadExpenses() {

    const response = await fetch("/api/expenses");

    if (!response.ok) {

        window.location = "login.html";
        return;

    }

    expenses = await response.json();

    displayExpenses();

}

// ------------------------------
// Display Expenses
// ------------------------------

function displayExpenses() {

    expenseList.innerHTML = "";

    let total = 0;

    expenses.forEach(expense => {

        total += expense.amount;

        const li = document.createElement("li");

        li.innerHTML = `
            <span>
                <strong>${expense.title}</strong><br>
                $${expense.amount.toFixed(2)}
            </span>

            <button
                class="delete"
                onclick="deleteExpense(${expense.id})">
                Delete
            </button>
        `;

        expenseList.appendChild(li);

    });

    totalElement.textContent = total.toFixed(2);

}

// ------------------------------
// Add Expense
// ------------------------------

expenseForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;

    const amount = document.getElementById("amount").value;

    const response = await fetch("/api/expenses", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title,
            amount
        })

    });

    if (response.ok) {

        expenseForm.reset();

        loadExpenses();

    } else {

        alert("Unable to save expense.");

    }

});

// ------------------------------
// Delete Expense
// ------------------------------

async function deleteExpense(id) {

    if (!confirm("Delete this expense?")) {
        return;
    }

    await fetch(`/api/expenses/${id}`, {

        method: "DELETE"

    });

    loadExpenses();

}

// ------------------------------
// Logout
// ------------------------------

logoutBtn.addEventListener("click", async () => {

    await fetch("/logout");

    window.location = "login.html";

});

// ------------------------------
// Initialize
// ------------------------------

async function initialize() {

    await getCurrentUser();

    await loadExpenses();

}

initialize();