const popup = new Popup();

function loadingSwal(text = "loading...", color = "#000") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,

    color: color,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    title: text,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

function deleteUser(userID) {
  loadingSwal("Deleting...");
  fetch(`/users/delete/${userID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        errorAlert(`Failed to fetch data \n${error}`);
        stopLoadingSwal();
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      successAlert("User deleted successfully");
      stopLoadingSwal();
      setTimeout(() => {
        location.reload();
      }, 750);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      errorAlert(`An error occurred while deleting the user\n ${error}`);
      stopLoadingSwal();
    });
}

function stopLoadingSwal() {
  Swal.close();
}

function handleConnectionStatus() {
  if (navigator.onLine) {
    swalTopRightAlert("back online", "success", 3000);
  } else {
    swalTopRightAlert("You're offline, please check your internet connection", "error", 3000, "red");
  }
}
window.addEventListener("offline", handleConnectionStatus);
window.addEventListener("online", handleConnectionStatus);

$(document).ready(function () {
  $("#usersTable").DataTable();

  // Disable & enable buttons
  $("#usersTable").on("click", ".disableUserBtn", function () {
    loadingSwal("Loading...");
    const userID = $(this).attr("data-userID");
    if ($(this).text().trim() == "Disable") {
      fetch(`/users/disable/${userID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            errorAlert(`Failed to fetch data ${error}`);
            stopLoadingSwal();
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          successAlert(data);
          $(this).text("Enable");
          stopLoadingSwal();
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          errorAlert(`An error occurred while getting the user details.\n${error}`);
          stopLoadingSwal();
        });
    } else if ($(this).text().trim() == "Enable") {
      fetch(`/users/enable/${userID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            errorAlert(`Failed to enable user ${error}`);
            stopLoadingSwal();
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          successAlert(data);
          $(this).text("Disable");
          stopLoadingSwal();
        })
        .catch((error) => {
          console.error("There was a problem with the operation:", error);
          errorAlert(`An error occurred while enabling user.\n${error}`);
          stopLoadingSwal();
        });
    }
  });

  // Delete button
  $("#usersTable").on("click", ".deleteUserBtn", function () {
    loadingSwal("Loding...");
    const userID = $(this).attr("data-userID");

    popup.show({
      type: "warning",
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this user?",
      actions: [
        {
          text: "Cancel",
          variant: "secondary",
          onClick: () => popup.close(),
        },
        {
          text: "Delete",
          variant: "danger",
          onClick: () => {
            deleteUser(userID);
            popup.close();
          },
        },
      ],
    });

    stopLoadingSwal();
  });

  // Details button
  $("#usersTable").on("click", ".detailsUserBtn", function () {
    loadingSwal("Loading...");
    const userID = $(this).attr("data-userID");
    fetch(`/users/details/${userID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          errorAlert(`Failed to fetch data \n${error}`);
          stopLoadingSwal();
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        popup.showKeyValueData(data);
        stopLoadingSwal();
        document.querySelectorAll(".copy").forEach((button) => {
          button.addEventListener("click", (event) => {
            const textToCopy = event.target.parentElement.parentElement.innerText;
            navigator.clipboard
              .writeText(textToCopy)
              .then(() => {
                successAlert(`${textToCopy} has been copied to clipboard.`);
              })
              .catch((err) => {
                console.error("Failed to copy text: ", err);
              });
          });
        });
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        errorAlert("An error occurred while getting the user.", "error");
        stopLoadingSwal();
      });
  });
  $(document).on("click", "#addRole", function () {
    loadingSwal("Loading...");

    popup.showForm({
      title: "Enter Details",
      fields: [
        { type: "text", label: "uid", placeholder: "Enter uid here", name: "uid" },
        {
          type: "select",
          label: "Role",
          name: "role",
          options: [
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" },
            { value: "moderator", label: "Moderator" },
          ],
        },
      ],
      actions: [
        {
          text: "Submit",
          variant: "primary",
          onClick: (formData) => {
            fetch("/users/assign-role", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            })
              .then((res) => {
                if (!res.ok) {
                  errorAlert(`Failed to fetch data \n`);
                  stopLoadingSwal();
                  throw new Error("Network response was not ok");
                }
                return res.json();
              })
              .then((data) => {
                successAlert(data.message);
                stopLoadingSwal();
                setTimeout(() => {
                  location.reload();
                }, 750);
              })
              .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
                errorAlert(`An error occurred while assigning the role.\n${error}`);
                stopLoadingSwal();
              });

            popup.close();
          },
        },
        {
          text: "Cancel",
          variant: "secondary",
          onClick: () => popup.close(),
        },
      ],
    });

    stopLoadingSwal();
  });
});
