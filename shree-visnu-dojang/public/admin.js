import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection,
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

    const cards = snapshot.docs.map((inquiry) => {
      const data = inquiry.data();
      const card = document.createElement("article");
      card.style.cssText =
        "padding:16px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,0.02);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;";

      const details = document.createElement("div");
      const name = document.createElement("h4");
      name.textContent = String(data.studentName ?? "");
      name.style.cssText = "margin-bottom:4px;color:var(--text);";

      const contactLine = document.createElement("p");
      contactLine.style.cssText =
        "color:var(--muted);font-size:0.9rem;margin:0;";
      contactLine.append("Contact: ");
      const contact = document.createElement("strong");
      contact.textContent = String(data.contactInfo ?? "");
      contactLine.append(contact, " | Program: ");
      const program = document.createElement("em");
      program.textContent = String(data.ageGroup ?? "");
      contactLine.appendChild(program);
      details.append(name, contactLine);

      const dateBox = document.createElement("div");
      dateBox.style.textAlign = "right";
      const date = data.createdAt?.toDate?.();
      const dateLabel = document.createElement("span");
      dateLabel.textContent =
        date instanceof Date ? date.toLocaleString() : "Just now";
      dateLabel.style.cssText = "font-size:0.75rem;color:var(--gold);";
      dateBox.appendChild(dateLabel);

      card.append(details, dateBox);
      return card;
    });

    inquiriesList.replaceChildren(...cards);
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

function showMessage(message, color = "var(--muted)") {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  paragraph.style.color = color;
  inquiriesList.replaceChildren(paragraph);
}
