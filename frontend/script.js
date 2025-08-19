let shoppingList = []
let previousLists = []

async function fetchLists() {
  const res = await fetch("http://localhost:5000/api/lists")
  previousLists = await res.json()
}

// script.js (frontend)

const API_URL = "https://grocery-shopping-list.onrender.com/api/lists";

// Fetch and display items
function fetchItems() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      console.log("Fetched items:", data);
      const listContainer = document.getElementById("list");
      listContainer.innerHTML = "";
      data.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.name;
        listContainer.appendChild(li);
      });
    })
    .catch(err => console.error("Error fetching items:", err));
}

// Add new item
function addItem(name) {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  })
    .then(() => fetchItems())
    .catch(err => console.error("Error adding item:", err));
}

// Attach form listener
document.getElementById("itemForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("itemInput");
  const name = input.value.trim();
  if (name) {
    addItem(name);
    input.value = "";
  }
});

// Load items on page load
fetchItems();


function renderItems() {
  const list = document.getElementById("items-list")
  list.innerHTML = ""
  shoppingList.forEach((item, index) => {
    const div = document.createElement("div")
    div.className = "item-card"
    const textClass = item.completed ? "item-name completed" : "item-name"
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
    `
    list.appendChild(div)
  })
}


document.getElementById("add-btn").onclick = async () => {
  const name = document.getElementById("item-name").value.trim()
  const quantity = document.getElementById("manual-quantity").value.trim() || document.getElementById("quantity-select").value
  if (name && quantity) {
    shoppingList.push({ name, quantity, completed: false })
    await saveList()
    document.getElementById("item-name").value = ""
    document.getElementById("manual-quantity").value = ""
    renderItems()
  }
}

function deleteItem(index) {
  shoppingList.splice(index, 1)
  saveList()
  renderItems()
}

function editItem(index) {
  const newName = prompt("Enter new item name:", shoppingList[index].name)
  const newQuantity = prompt("Enter new quantity:", shoppingList[index].quantity)
  if (newName && newQuantity) {
    shoppingList[index].name = newName
    shoppingList[index].quantity = newQuantity
    saveList()
    renderItems()
  }
}

function toggleComplete(index) {
  shoppingList[index].completed = !shoppingList[index].completed
  saveList()
  renderItems()
}

document.getElementById("download-btn").onclick = () => {
  const csv = "Item,Quantity,Completed\n" + shoppingList.map(item =>
    `${item.name},${item.quantity},${item.completed ? 'Yes' : 'No'}`
  ).join("\n")
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'shopping_list.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

document.getElementById("whatsapp-btn").onclick = () => {
  const message = shoppingList.map(item =>
    `${item.completed ? "✅ " : "🛒 "}${item.name} : ${item.quantity}`
  ).join('%0A')
  const url = `https://wa.me/?text=${message}`
  window.open(url, '_blank')
}

document.getElementById("newlist-btn").onclick = async () => {
  if (shoppingList.length > 0) {
    const name = prompt("Save current list? Enter a name:")
    if (name) {
      await fetch("http://localhost:5000/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, items: shoppingList })
      })
    }
  }
  shoppingList = []
  saveList()
  renderItems()
  fetchLists()
}

document.getElementById("loadlist-btn").onclick = async () => {
  const container = document.getElementById("previous-lists")
  const listEl = document.getElementById("previous-list-names")
  listEl.innerHTML = ""
  await fetchLists()
  if (previousLists.length === 0) {
    alert("No previous lists available.")
    return
  }
  container.classList.remove("d-none")
  previousLists.forEach((list) => {
    const li = document.createElement("li")
    li.className = "text-primary"
    li.textContent = list.name
    li.onclick = () => {
      shoppingList = [...list.items]
      saveList()
      renderItems()
    }
    listEl.appendChild(li)
  })
}

function saveList() {
  localStorage.setItem("shoppingList", JSON.stringify(shoppingList))
}




window.onload = async () => {
  shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || []
  renderItems()
  await fetchLists()
}
