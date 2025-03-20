async function $removeLoadingAnimation(animateElement) {
  const $loadingAnimation = animateElement;
  $loadingAnimation.addClass("hidden");
  $loadingAnimation.html(``);
}
async function $showLoadingAnimation(animateElement) {
  const $loadingAnimation = animateElement;
  $loadingAnimation.html(`<svg
        viewBox="25 25 50 50"
        class="w-13 transform origin-center animate-rotate4"
      >
        <circle
          r="20"
          cy="50"
          cx="50"
          fill="none"
          stroke="hsl(214, 97%, 59%)"
          stroke-width="2"
          stroke-dasharray="1, 200"
          stroke-dashoffset="0"
          stroke-linecap="round"
          class="animate-dash4"
        ></circle>
      </svg>
    `);
  $loadingAnimation.removeClass("hidden");
}

$(document).ready(function () {
  $("#productTable").DataTable({
    pageLength: 10,
    responsive: true,
  });

  $("#loadingContainer").html("");
  $("#loadingContainer").addClass("!hidden");

  const $modal = $("#crud-modal");
  const $dropzone = $("#dropzone");

  // Function to close the modal
  function closeModal() {
    $("#popup").addClass("!hidden");
    $modal.addClass("!hidden");
    $("input").val("");
    $("textarea").val("");
    $dropzone.html(`
        <img id="image-preview" src="" alt="Preview" class="hidden w-24 h-24 object-cover rounded-lg" />
        <i id="upload-icon" class="fas fa-cloud-upload-alt text-6xl text-black"></i>
        <p id="upload-text" class="text-center text-black">
          Drag & Drop an image or <span class="text-blue-600 cursor-pointer underline">browse</span> to upload!
        </p>
      `);
  }

  $("#close-popup").on("click", () => {
    closeModal();
  });
  $(document).on("click", ".delete-btn", function () {
    const $deleteBtn = $(this);
    const productId = $deleteBtn.attr("data-id");
    const delPop = $("#conf-popup");
    delPop.removeClass("!hidden");
    delPop.find(".popup-text").text(`Are you sure you want to delete product with ID: ${productId}?`);
    const handleDelete = () => {
      $showLoadingAnimation($("#loadingContainer"));

      $.ajax({
        url: `/admin/product/delete/${productId}`,
        type: "DELETE",
        success: (response) => {
          console.log(response);
          if (response.success) {
            successAlert("Product deleted successfully!");
            delPop.addClass("!hidden");
            $("#productTable").DataTable().row($deleteBtn.parents("tr")).remove().draw();
            $removeLoadingAnimation($("#loadingContainer"));
          } else {
            errorAlert(response.message || "An error occurred while deleting the product.");
            $removeLoadingAnimation($("#loadingContainer"));
          }
        },
        error: (err) => {
          $removeLoadingAnimation($("#loadingContainer"));
          console.error("Error deleting product:", err);
          errorAlert("An error occurred while deleting the product. Please try again.");
        },
      });
    };
    delPop.find("#conf-delte-btn-popup").off("click").on("click", handleDelete);
    delPop
      .find("#cancel-btn-popup")
      .off("click")
      .on("click", function () {
        delPop.addClass("!hidden");
      });
  });
});
