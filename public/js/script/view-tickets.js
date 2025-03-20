document.addEventListener("DOMContentLoaded", function () {
  const message = document.getElementById("message");
  const fileAlert = document.getElementById("fileAlert");
  const fileInput = document.getElementById("fileInput");
  const fileLabel = document.getElementById("fileUpload");
  const statusInput = document.getElementById("changeStatus");
  const submitBtn = document.getElementById("submitButton");

  fileLabel.addEventListener("click", function () {
    fileInput.click();
  });
  const ticketId = location.pathname.split("/")[3];
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitBtn.disabled = true;

      if (message.value.trim() === "") {
        errorAlert("Message cannot be empty.");
        submitBtn.disabled = false;
        return;
      }

      const files = fileInput.files;

      const formData = new FormData();
      formData.append("status", statusInput.value);
      formData.append("message", message.value);
      formData.append("ticketId", ticketId);
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      fetch("/admin/reply/ticket", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            message.textContent = data.error;
            submitBtn.disabled = false;
            return;
          }
          successAlert("Reply sent successfully.");
          setTimeout(() => {
            location.reload();
          }, 500);
        })
        .catch((error) => {
          console.error("Error:", error);
          message.textContent = "An error occurred while uploading the files.";
          submitBtn.disabled = false;
        });
    });
  });
  fileInput.addEventListener("change", function () {
    const files = fileInput.files;
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    let fileInfo = "";

    if (files.length > maxFiles) {
      fileAlert.textContent = "You can only upload a maximum of 5 files.";
      fileInput.value = ""; // Clear the input
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        fileAlert.textContent = `File ${files[i].name} exceeds the 5MB size limit.`;
        fileInput.value = ""; // Clear the input
        return;
      }
      fileInfo += `<li class="list-disc mb-1">File: ${files[i].name}, Size: ${(files[i].size / (1024 * 1024)).toFixed(
        2
      )} MB\n</li>`;
    }

    fileAlert.innerHTML = `<ul>${fileInfo}</ul>`;
  });
});
