document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const addQuestionForm = document.getElementById("addQuestionForm");
  const editQuestionForm = document.getElementById("editQuestionForm");
  const editFormContainer = document.getElementById("editFormContainer");
  const cancelEditBtn = document.getElementById("cancelEdit");
  const questionsList = document.getElementById("questionsList");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const noQuestionsMessage = document.getElementById("noQuestionsMessage");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notificationMessage");
  const deleteModal = document.getElementById("deleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let currentDeleteId = null;

  // Initialize
  if (questionsList.children.length === 0) {
    noQuestionsMessage.classList.remove("hidden");
  }
  loadingIndicator.classList.add("hidden");

  // Add event listeners
  addQuestionForm.addEventListener("submit", handleAddQuestion);
  editQuestionForm.addEventListener("submit", handleEditQuestion);
  cancelEditBtn.addEventListener("click", hideEditForm);
  cancelDeleteBtn.addEventListener("click", hideDeleteModal);
  confirmDeleteBtn.addEventListener("click", confirmDelete);

  // Add event delegation for edit and delete buttons
  questionsList.addEventListener("click", (e) => {
    if (e.target.closest(".edit-btn")) {
      const questionItem = e.target.closest(".question-item");
      const id = questionItem.dataset.id;
      const questionText = questionItem.querySelector("h3").textContent;
      const answerText = questionItem.querySelector("p").textContent;
      showEditForm(id, questionText, answerText);
    } else if (e.target.closest(".delete-btn")) {
      const questionItem = e.target.closest(".question-item");
      const id = questionItem.dataset.id;
      showDeleteModal(id);
    }
  });

  // Functions
  async function handleAddQuestion(e) {
    e.preventDefault();

    const questionInput = document.getElementById("question");
    const answerInput = document.getElementById("answer");

    const questionData = {
      question: questionInput.value.trim(),
      answer: answerInput.value.trim(),
    };

    try {
      const response = await fetch("/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      const newQuestion = await response.json();

      // Add the new question to the UI
      addQuestionToUI(newQuestion);

      // Clear the form
      questionInput.value = "";
      answerInput.value = "";

      // Show success notification
      showNotification("Question added successfully!");

      // Hide the "no questions" message if it's visible
      noQuestionsMessage.classList.add("hidden");
    } catch (error) {
      console.error("Error adding question:", error);
      showNotification("Failed to add question. Please try again.", true);
    }
  }

  async function handleEditQuestion(e) {
    e.preventDefault();

    const id = document.getElementById("editQuestionId").value;
    const questionInput = document.getElementById("editQuestion");
    const answerInput = document.getElementById("editAnswer");

    const questionData = {
      question: questionInput.value.trim(),
      answer: answerInput.value.trim(),
    };

    try {
      const response = await fetch(`/admin/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const updatedQuestion = await response.json();

      // Update the question in the UI
      updateQuestionInUI(id, updatedQuestion);

      // Hide the edit form
      hideEditForm();

      // Show success notification
      showNotification("Question updated successfully!");
    } catch (error) {
      console.error("Error updating question:", error);
      showNotification("Failed to update question. Please try again.", true);
    }
  }

  async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
      const response = await fetch(`/admin/questions/${currentDeleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      // Remove the question from the UI
      const questionItem = document.querySelector(`.question-item[data-id="${currentDeleteId}"]`);
      if (questionItem) {
        questionItem.remove();
      }

      // Show success notification
      showNotification("Question deleted successfully!");

      // Show the "no questions" message if there are no more questions
      if (questionsList.children.length === 0) {
        noQuestionsMessage.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      showNotification("Failed to delete question. Please try again.", true);
    } finally {
      hideDeleteModal();
    }
  }

  function addQuestionToUI(question) {
    const questionItem = document.createElement("div");
    questionItem.className = "question-item border border-gray-200 rounded-md p-4";
    questionItem.dataset.id = question.id;

    questionItem.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium text-lg">${escapeHTML(question.Q)}</h3>
            <p class="text-gray-600 mt-2">${escapeHTML(question.A)}</p>
          </div>
          <div class="flex space-x-2">
            <button class="edit-btn text-blue-500 hover:text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button class="delete-btn text-red-500 hover:text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      `;

    questionsList.prepend(questionItem);
  }

  function updateQuestionInUI(id, question) {
    const questionItem = document.querySelector(`.question-item[data-id="${id}"]`);
    if (questionItem) {
      const questionTitle = questionItem.querySelector("h3");
      const questionAnswer = questionItem.querySelector("p");

      questionTitle.textContent = question.Q;
      questionAnswer.textContent = question.A;
    }
  }

  function showEditForm(id, question, answer) {
    document.getElementById("editQuestionId").value = id;
    document.getElementById("editQuestion").value = question;
    document.getElementById("editAnswer").value = answer;

    editFormContainer.classList.remove("hidden");

    // Scroll to the edit form
    editFormContainer.scrollIntoView({ behavior: "smooth" });
  }

  function hideEditForm() {
    editFormContainer.classList.add("hidden");
    editQuestionForm.reset();
  }

  function showDeleteModal(id) {
    currentDeleteId = id;
    deleteModal.classList.remove("hidden");
  }

  function hideDeleteModal() {
    deleteModal.classList.add("hidden");
    currentDeleteId = null;
  }

  function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.classList.remove("translate-y-20", "opacity-0");
    notification.classList.add("translate-y-0", "opacity-100");

    if (isError) {
      notification.classList.add("bg-red-500");
      notification.classList.remove("bg-gray-800");
    } else {
      notification.classList.add("bg-gray-800");
      notification.classList.remove("bg-red-500");
    }

    setTimeout(() => {
      notification.classList.add("translate-y-20", "opacity-0");
      notification.classList.remove("translate-y-0", "opacity-100");
    }, 3000);
  }

  // Helper function to escape HTML
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
