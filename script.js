
/* =========================================
   SPLITWISE - SMART EXPENSE SPLITTER
   DSA: ARRAYS, MAP, GREEDY ALGORITHM
   FEATURE: SELECTIVE EXPENSE SPLITTING
========================================= */

let members = [];
let expenses = [];

let nextMemberId = 1;
let nextExpenseId = 1;


// HTML ELEMENTS

const memberForm = document.getElementById("memberForm");
const memberNameInput = document.getElementById("memberName");
const memberList = document.getElementById("memberList");

const expenseForm = document.getElementById("expenseForm");
const expenseTitleInput = document.getElementById("expenseTitle");
const expenseAmountInput = document.getElementById("expenseAmount");
const paidBySelect = document.getElementById("paidBy");

const participantList = document.getElementById("participantList");
const selectAllBtn = document.getElementById("selectAllBtn");

const totalSpendingDisplay = document.getElementById("totalSpending");
const memberCountDisplay = document.getElementById("memberCount");
const expenseCountDisplay = document.getElementById("expenseCount");
const settlementCountDisplay = document.getElementById("settlementCount");

const balanceList = document.getElementById("balanceList");
const settlementList = document.getElementById("settlementList");
const expenseHistory = document.getElementById("expenseHistory");

const settleBtn = document.getElementById("settleBtn");
const resetBtn = document.getElementById("resetBtn");


// CURRENCY FORMAT

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}


// ADD MEMBER

memberForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = memberNameInput.value.trim();

    if (!name) {
        alert("Please enter a member name.");
        return;
    }

    if (expenses.length > 0) {
        alert("Reset the group before changing members after adding expenses.");
        return;
    }

    const duplicate = members.some(function(member) {
        return member.name.toLowerCase() === name.toLowerCase();
    });

    if (duplicate) {
        alert("This member already exists.");
        return;
    }

    members.push({
        id: nextMemberId++,
        name: name
    });

    memberNameInput.value = "";

    renderAll();
});


// REMOVE MEMBER

memberList.addEventListener("click", function(event) {
    if (!event.target.classList.contains("remove-btn")) return;

    if (expenses.length > 0) {
        alert("Reset the group before removing members after adding expenses.");
        return;
    }

    const id = Number(event.target.dataset.id);

    members = members.filter(function(member) {
        return member.id !== id;
    });

    renderAll();
});


// DISPLAY MEMBERS

function renderMembers() {
    memberList.innerHTML = "";

    if (members.length === 0) {
        memberList.innerHTML = '<p class="empty-state">No members added yet.</p>';
    }

    members.forEach(function(member) {
        const item = document.createElement("div");
        item.className = "member-item";

        const info = document.createElement("div");
        info.className = "member-info";

        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        avatar.textContent = member.name.charAt(0).toUpperCase();

        const name = document.createElement("span");
        name.className = "member-name";
        name.textContent = member.name;

        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.dataset.id = member.id;
        remove.textContent = "×";

        info.append(avatar, name);
        item.append(info, remove);
        memberList.appendChild(item);
    });

    updateMemberDropdown();
    renderParticipantOptions();

    memberCountDisplay.textContent = members.length;
}


// UPDATE PAYER DROPDOWN

function updateMemberDropdown() {
    paidBySelect.innerHTML = '<option value="">Select a member</option>';

    members.forEach(function(member) {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = member.name;
        paidBySelect.appendChild(option);
    });
}


// SELECT PARTICIPANTS

function renderParticipantOptions() {
    participantList.innerHTML = "";

    members.forEach(function(member) {
        const label = document.createElement("label");
        label.className = "participant-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "participant-checkbox";
        checkbox.value = member.id;
        checkbox.checked = true;

        const name = document.createElement("span");
        name.textContent = member.name;

        label.append(checkbox, name);
        participantList.appendChild(label);
    });
}


// SELECT ALL PARTICIPANTS

selectAllBtn.addEventListener("click", function() {
    const checkboxes = document.querySelectorAll(".participant-checkbox");

    checkboxes.forEach(function(checkbox) {
        checkbox.checked = true;
    });
});


// ADD EXPENSE

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = expenseTitleInput.value.trim();
    const amount = Number(expenseAmountInput.value);
    const paidBy = Number(paidBySelect.value);

    if (members.length < 2) {
        alert("Please add at least two members first.");
        return;
    }

    if (!title) {
        alert("Please enter an expense description.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const payerExists = members.some(function(member) {
        return member.id === paidBy;
    });

    if (!payerExists) {
        alert("Please select who paid.");
        return;
    }

    const participants = Array.from(
        document.querySelectorAll(".participant-checkbox:checked")
    ).map(function(checkbox) {
        return Number(checkbox.value);
    });

    if (participants.length === 0) {
        alert("Select at least one participant.");
        return;
    }

    const amountPaise = Math.round(amount * 100);

    const expense = {
        id: nextExpenseId++,
        title: title,
        amount: amountPaise,
        paidBy: paidBy,
        participants: participants,
        date: new Date().toLocaleDateString("en-IN")
    };

    expenses.push(expense);

    expenseForm.reset();

    renderAll();
});


// EXPENSE HISTORY

function renderExpenses() {
    expenseHistory.innerHTML = "";

    if (expenses.length === 0) {
        expenseHistory.innerHTML = `
            <tr><td colspan="4" class="empty-state">
                No expenses recorded yet.
            </td></tr>
        `;
    }

    expenses.forEach(function(expense) {
        const payer = members.find(function(member) {
            return member.id === expense.paidBy;
        });

        const row = document.createElement("tr");

        const title = document.createElement("td");
        title.textContent = expense.title;

        const paidBy = document.createElement("td");
        paidBy.textContent = payer ? payer.name : "Unknown";

        const amount = document.createElement("td");
        amount.textContent = formatCurrency(expense.amount / 100);

        const date = document.createElement("td");
        date.textContent = expense.date;

        row.append(title, paidBy, amount, date);
        expenseHistory.appendChild(row);
    });

    updateExpenseSummary();
}


// SUMMARY CARDS

function updateExpenseSummary() {
    const total = expenses.reduce(function(sum, expense) {
        return sum + expense.amount;
    }, 0);

    totalSpendingDisplay.textContent = formatCurrency(total / 100);
    expenseCountDisplay.textContent = expenses.length;
}


// =========================================
// BALANCE CALCULATION USING MAP
// =========================================

function calculateBalances() {
    const balances = new Map();

    members.forEach(function(member) {
        balances.set(member.id, 0);
    });

    expenses.forEach(function(expense) {
        const amount = expense.amount;
        const participants = expense.participants;

        const baseShare = Math.floor(amount / participants.length);
        const extraPaise = amount % participants.length;

        participants.forEach(function(memberId, index) {
            const share = baseShare + (index < extraPaise ? 1 : 0);

            balances.set(
                memberId,
                balances.get(memberId) - share
            );
        });

        balances.set(
            expense.paidBy,
            balances.get(expense.paidBy) + amount
        );
    });

    return balances;
}


// DISPLAY BALANCES

function renderBalances() {
    balanceList.innerHTML = "";

    if (members.length === 0 || expenses.length === 0) {
        balanceList.innerHTML = `
            <p class="empty-state">Add expenses to calculate balances.</p>
        `;
        return;
    }

    const balances = calculateBalances();

    members.forEach(function(member) {
        const balance = balances.get(member.id);

        const item = document.createElement("div");
        item.className = "balance-item";

        const name = document.createElement("span");
        name.className = "balance-name";
        name.textContent = member.name;

        const amount = document.createElement("span");
        amount.className = "balance-amount";

        if (balance > 0) {
            amount.classList.add("positive");
            amount.textContent =
                "+" + formatCurrency(balance / 100) + " (gets back)";
        } else if (balance < 0) {
            amount.classList.add("negative");
            amount.textContent =
                "-" + formatCurrency(Math.abs(balance) / 100) + " (owes)";
        } else {
            amount.classList.add("neutral");
            amount.textContent = "Settled";
        }

        item.append(name, amount);
        balanceList.appendChild(item);
    });
}


// =========================================
// GREEDY SETTLEMENT ALGORITHM
// =========================================

function calculateSettlements() {
    const balances = calculateBalances();

    const creditors = [];
    const debtors = [];

    members.forEach(function(member) {
        const balance = balances.get(member.id);

        if (balance > 0) {
            creditors.push({
                name: member.name,
                amount: balance
            });
        } else if (balance < 0) {
            debtors.push({
                name: member.name,
                amount: Math.abs(balance)
            });
        }
    });

    creditors.sort(function(a, b) {
        return b.amount - a.amount;
    });

    debtors.sort(function(a, b) {
        return b.amount - a.amount;
    });

    const settlements = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const amount = Math.min(
            debtors[i].amount,
            creditors[j].amount
        );

        settlements.push({
            from: debtors[i].name,
            to: creditors[j].name,
            amount: amount
        });

        debtors[i].amount -= amount;
        creditors[j].amount -= amount;

        if (debtors[i].amount === 0) i++;
        if (creditors[j].amount === 0) j++;
    }

    return settlements;
}


// DISPLAY SETTLEMENTS

function renderSettlements() {
    settlementList.innerHTML = "";

    if (expenses.length === 0) {
        settlementList.innerHTML = `
            <p class="empty-state">Add expenses to generate settlements.</p>
        `;

        settlementCountDisplay.textContent = "0";
        return;
    }

    const settlements = calculateSettlements();

    settlementCountDisplay.textContent = settlements.length;

    if (settlements.length === 0) {
        settlementList.innerHTML = `
            <p class="empty-state">Everyone is settled. No payments needed!</p>
        `;
        return;
    }

    settlements.forEach(function(settlement) {
        const item = document.createElement("div");
        item.className = "settlement-item";

        const people = document.createElement("div");

        const from = document.createElement("span");
        from.className = "settlement-person";
        from.textContent = settlement.from;

        const arrow = document.createElement("span");
        arrow.className = "settlement-arrow";
        arrow.textContent = " → ";

        const to = document.createElement("span");
        to.className = "settlement-person";
        to.textContent = settlement.to;

        people.append(from, arrow, to);

        const amount = document.createElement("span");
        amount.className = "settlement-amount";
        amount.textContent = formatCurrency(settlement.amount / 100);

        item.append(people, amount);
        settlementList.appendChild(item);
    });
}


// GENERATE SETTLEMENT BUTTON

settleBtn.addEventListener("click", function() {
    if (expenses.length === 0) {
        alert("Please add expenses first.");
        return;
    }

    renderSettlements();
});


// RESET GROUP

resetBtn.addEventListener("click", function() {
    const confirmed = confirm(
        "Are you sure you want to delete all members and expenses?"
    );

    if (!confirmed) return;

    members = [];
    expenses = [];

    nextMemberId = 1;
    nextExpenseId = 1;

    memberForm.reset();
    expenseForm.reset();

    renderAll();
});


// REFRESH COMPLETE DASHBOARD

function renderAll() {
    renderMembers();
    renderExpenses();
    renderBalances();
    renderSettlements();
}


// START APPLICATION

renderAll();
