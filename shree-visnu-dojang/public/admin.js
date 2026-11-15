import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutButton = document.getElementById("logout-btn");
const inquiriesList = document.getElementById("inquiries-list");

let isLoading = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    loadInquiries();
  } else {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  loginError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in:", error);
    loginError.textContent = `Login failed: ${error.message}`;
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    loginError.textContent = "Could not log out. Please try again.";
  }
});

async function loadInquiries() {
  if (isLoading) return;

  isLoading = true;
  showMessage("Loading inquiries...");

  try {
    const inquiriesQuery = query(
      collection(db, "inquiries"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(inquiriesQuery);

    if (snapshot.empty) {
      showMessage("No trial inquiries yet.");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "inquiry-table-wrap";

    const table = document.createElement("table");
    table.className = "inquiry-table";
    const tableHead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    for (const heading of ["Student", "Contact", "Program", "Date", "Action"]) {
      const cell = document.createElement("th");
      cell.textContent = heading;
      if (heading === "Action") cell.className = "action-column";
      headerRow.appendChild(cell);
    }

    tableHead.appendChild(headerRow);
    table.appendChild(tableHead);

    const tableBody = document.createElement("tbody");

    snapshot.forEach((inquiry) => {
      const data = inquiry.data();
      const row = document.createElement("tr");
      const date = data.createdAt?.toDate?.();
      const values = [
        data.studentName,
        data.contactInfo,
        data.ageGroup,
        date instanceof Date ? date.toLocaleString() : "Just now",
      ];

      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = String(value ?? "");
        row.appendChild(cell);
      }

      const actionCell = document.createElement("td");
      actionCell.className = "action-column";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "inquiry-delete";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", "Delete inquiry");
      deleteButton.addEventListener("click", () =>
        deleteInquiry(inquiry.id, deleteButton),
      );

      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    wrapper.appendChild(table);
    inquiriesList.replaceChildren(wrapper);
  } catch (error) {
    console.error("Error loading inquiries:", error);
    showMessage(
      "Error loading inquiries. Check Firestore permissions.",
      "var(--red)",
    );
  } finally {
    isLoading = false;
  }
}

async function deleteInquiry(inquiryId, button) {
  if (!window.confirm("Delete this inquiry? This action cannot be undone.")) {
    return;
  }

  button.disabled = true;

  try {
    await deleteDoc(doc(db, "inquiries", inquiryId));
    await loadInquiries();
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    button.disabled = false;
    showMessage("Error deleting inquiry. Check Firestore permissions.", "var(--red)");
  }
}

function showMessage(message, color = "var(--muted)") {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  paragraph.style.color = color;
  inquiriesList.replaceChildren(paragraph);
}
