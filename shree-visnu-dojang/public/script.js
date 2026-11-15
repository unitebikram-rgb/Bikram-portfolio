import { db } from "./firebase-config.js";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

console.log("Firebase connected successfully for:", db.app.options.projectId);

const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".schedule-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentFilter = button.dataset.filter;

    cards.forEach((card) => {
      const show =
        currentFilter === "all" || card.dataset.group === currentFilter;
      card.hidden = !show;
    });

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
  });
});

const trialForm = document.querySelector("#trial-form");
const formStatus = document.querySelector("#form-status");

if (trialForm && formStatus && !trialForm.dataset.bound) {
  trialForm.dataset.bound = "true";
  trialForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = trialForm.querySelector('button[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("The trial form submit button is missing.");
    }
    if (submitButton.disabled) return;

    const formData = new FormData(trialForm);
    const studentName = String(formData.get("studentName") ?? "").trim();
    const contactInfo = String(formData.get("contactInfo") ?? "").trim();
    const ageGroup = String(formData.get("ageGroup") ?? "");

    if (!studentName || !contactInfo || !ageGroup) {
      formStatus.textContent = "Please complete all fields before submitting.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    formStatus.textContent = "";

    try {
      await addDoc(collection(db, "inquiries"), {
        studentName,
        contactInfo,
        ageGroup,
        createdAt: serverTimestamp(),
      });

      trialForm.reset();
      formStatus.textContent = "Success! We will contact you soon.";
    } catch (error) {
      console.error("Error submitting trial request:", error);
      formStatus.textContent = "Error submitting. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Book Free Trial";
    }
  });
}
