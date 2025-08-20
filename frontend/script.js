// script.js
let shoppingList = [];
let previousLists = [];

const API_URL = "https://grocery-shopping-list.onrender.com/api/lists";

// ✅ Fetch all lists (not items)
async function fetchLists() {
  try {
    const res = await fetch(API_URL);
    previousLists = await res.json();
    console.log("Fetched lists:", previousLists);
  } catch (err) {
    console.error("Error fetching lists:", err);
  }
}

// ✅ Render current shopping list in UI
function renderItems() {
  const list = document.getElementById("items-list");
  list.innerHTML = "";
  shoppingList.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item-card";
    const textClass = item.completed ? "item-name completed" : "item-name";
    div.innerHTML = `
      <div class="item-top">
        <div class="${textClass}">${item.name}</div>
        <span class="item-quantity">${item.quantity}</span>
      </div>
      <div class="item-actions">
        <button onclick="toggleComplete(${index})" class="btn btn-sm btn-outline-success">Complete</button>
        <button onclick="editItem(${index})" class="btn btn-sm btn-outline-info">Edit</button>
        <button onclick="deleteItem(${index})" class="btn btn-sm btn-outline-danger">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// ✅ Add item to current list
document.getElementById("add-btn").onclick = async () => {
  const name = document.getElementById("item-name").value.trim();
  const quantity =
    document.getElementById("manual-quantity").value.trim() ||
    document.getElementById("quantity-select").value;

  if (name && quantity) {
    shoppingList.push({ name, quantity, completed: false });
    saveList();
    renderItems();
    document.getElementById("item-name").value = "";
    document.getElementById("manual-quantity").value = "";
  }
};

// ✅ Delete item
function deleteItem(index) {
  shoppingList.splice(index, 1);
  saveList();
  renderItems();
}

// ✅ Edit item
function editItem(index) {
  const newName = prompt("Enter new item name:", shoppingList[index].name);
  const newQuantity = prompt(
    "Enter new quantity:",
    shoppingList[index].quantity
  );
  if (newName && newQuantity) {
    shoppingList[index].name = newName;
    shoppingList[index].quantity = newQuantity;
    saveList();
    renderItems();
  }
}

// ✅ Toggle complete
function toggleComplete(index) {
  shoppingList[index].completed = !shoppingList[index].completed;
  saveList();
  renderItems();
}

// ✅ Download as CSV
document.getElementById("download-btn").onclick = () => {
  const csv =
    "Item,Quantity,Completed\n" +
    shoppingList
      .map(
        (item) =>
          `${item.name},${item.quantity},${item.completed ? "Yes" : "No"}`
      )
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shopping_list.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ✅ Share on WhatsApp
document.getElementById("whatsapp-btn").onclick = () => {
  const message = shoppingList
    .map(
      (item) =>
        `${item.completed ? "✅ " : "🛒 "}${item.name} : ${item.quantity}`
    )
    .join("%0A");
  const url = `https://wa.me/?text=${message}`;
  window.open(url, "_blank");
};

// ✅ New List button (save current list → clear → refresh lists)
document.getElementById("newlist-btn").onclick = async () => {
  if (shoppingList.length > 0) {
    const name = prompt("Save current list? Enter a name:");
    if (name) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, items: shoppingList }),
      });
    }
  }
  shoppingList = [];
  saveList();
  renderItems();
  await fetchLists(); // refresh saved lists
};

// ✅ Load Previous Lists button
document.getElementById("loadlist-btn").onclick = async () => {
  const container = document.getElementById("previous-lists");
  const listEl = document.getElementById("previous-list-names");
  listEl.innerHTML = "";

  await fetchLists();
  if (previousLists.length === 0) {
    alert("No previous lists available.");
    return;
  }

  container.classList.remove("d-none");
  previousLists.forEach((list) => {
    const li = document.createElement("li");
    li.className = "text-primary cursor-pointer";
    li.textContent = list.name || "Untitled List";
    li.onclick = () => {
      shoppingList = list.items || [];
      saveList();
      renderItems();
    };
    listEl.appendChild(li);
  });
};

// ✅ Save list in localStorage
function saveList() {
  localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
}

// ✅ On page load
window.onload = async () => {
  shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
  renderItems();
  await fetchLists();
};
