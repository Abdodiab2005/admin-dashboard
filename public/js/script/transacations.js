document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("reusable-popup");

  const popupContent = document.getElementById("popup-content");
  const closeButtons = document.querySelectorAll(".close-popup");

  // Show popup with custom title, content, and action
  function showPopup(title, contentHTML) {
    popupTitle.textContent = title;
    popupContent.innerHTML = contentHTML;
    popup.classList.remove("hidden");
  }
  // Close popup
  function closePopup() {
    popup.classList.add("hidden");
  }

  // Attach close event to all close buttons
  closeButtons.forEach((btn) => btn.addEventListener("click", closePopup));

  // Export showPopup for external use
  window.showPopup = showPopup;

  // Utility function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
$(document).ready(function () {
  $("#loadingContainer").html("").addClass("!hidden");

  $("#pendingTable, #approvedTable, #rejectedTable").DataTable();

  let transactionId = null; // Store transaction ID

  // Show popup
  $(".changeStateButton").on("click", function () {
    transactionId = $(this).data("id"); // Get transaction ID from data-id
    $("#statusPopup").removeClass("hidden");
  });

  // Hide popup
  $("#cancelPopup").on("click", function () {
    $("#statusPopup").addClass("hidden");
    $("#keyValueInputs").empty(); // Clear dynamic inputs
  });

  // Add key-value input
  $("#addInput").on("click", function () {
    const inputHtml = `
<div class="flex space-x-2">
  <input type="text" class="w-1/2 p-2 border rounded" placeholder="Key">
  <input type="text" class="w-1/2 p-2 border rounded" placeholder="Value">
</div>
`;
    $("#keyValueInputs").append(inputHtml);
  });
  // Submit data
  $("#submitPopup").on("click", async function () {
    const status = $("#statusSelect").val();
    const keyValuePairs = [];

    // Collect key-value pairs
    $("#keyValueInputs > div").each(function () {
      const key = $(this).find("input").eq(0).val();
      const value = $(this).find("input").eq(1).val();
      if (key && value) keyValuePairs.push({ key, value });
    });

    const data = { transactionId, status };
    if (keyValuePairs.length > 0) {
      data.keyValuePairs = keyValuePairs;
    }

    // Send data to the backend
    try {
      await fetch("/admin/transaction/update-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((data) => {
          successAlert(data.message);
          setTimeout(() => {
            location.reload();
          }, 500);
        })
        .catch((err) => {
          console.error(err);
          errorAlert(`Error while updating transaction: \n${err}`);
        });
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert(`Error while updating transaction: \n${error}`);
    }

    // Close popup
    $("#statusPopup").addClass("hidden");
    $("#keyValueInputs").empty();
  });
});
