import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("transaction-form");
const list = document.getElementById("list");
const balanceEl = document.getElementById("balance");

let transactions = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  try {

    await addDoc(collection(db, "expenses"), {
      title,
      amount,
      category,
      type,
      date: serverTimestamp()
    });

    form.reset();

    console.log("Transaction Added");

  } catch (error) {
    console.error(error);
  }
});

const q = query(
  collection(db, "expenses"),
  orderBy("date", "desc")
);

onSnapshot(q, (snapshot) => {

  transactions = [];

  snapshot.forEach((docSnap) => {
    transactions.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderTransactions();

});

function renderTransactions() {

  list.innerHTML = "";

  let balance = 0;

  transactions.forEach((item) => {

    if(item.type === "income"){
      balance += item.amount;
    } else {
      balance -= item.amount;
    }

    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${item.title}</strong><br>
        ₦${item.amount} - ${item.category}
      </div>

      <button class="delete-btn" data-id="${item.id}">
        Delete
      </button>
    `;

    list.appendChild(li);

  });

  balanceEl.textContent = `₦${balance}`;

}

list.addEventListener("click", async (e) => {

  if(e.target.classList.contains("delete-btn")){

    const id = e.target.dataset.id;

    try {

      await deleteDoc(doc(db, "expenses", id));

      console.log("Deleted");

    } catch(error){
      console.error(error);
    }

  }

});
