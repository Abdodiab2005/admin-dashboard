/**
 * Product Manager - Client-side script for managing products
 * Handles bulk operations like applying discounts and deleting multiple products
 */
document.addEventListener("DOMContentLoaded", () => {
  // Import necessary libraries (if not already included in HTML)
  // For example, if using a CDN:
  // const $ = require('jquery'); // If using node
  // const Swal = require('sweetalert2'); // If using node

  // Elements
  const selectAllCheckbox = document.getElementById("select-all-products");
  const productCheckboxes = document.querySelectorAll(".product-checkbox");
  const bulkActionBtn = document.getElementById("bulk-action-btn");
  const bulkDiscountBtn = document.getElementById("bulk-discount-btn");
  const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
  const stockFilterSelect = document.getElementById("stock-filter");

  // Track selected products
  const selectedProducts = new Set();

  // Initialize DataTable if it exists
  let productsTable;
  if (typeof $ !== "undefined" && $.fn.DataTable && document.getElementById("products-table")) {
    productsTable = $("#products-table").DataTable({
      responsive: true,
      pageLength: 25,
      order: [[1, "asc"]], // Order by name column
      columnDefs: [
        { orderable: false, targets: [0, -1] }, // Disable ordering for checkbox and actions columns
      ],
    });
  }

  // Handle "Select All" checkbox
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      const isChecked = selectAllCheckbox.checked;

      // Update all checkboxes
      productCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;

        // Update selected products set
        const productId = checkbox.value;
        if (isChecked) {
          selectedProducts.add(productId);
        } else {
          selectedProducts.delete(productId);
        }
      });

      // Update bulk action buttons
      updateBulkActionButtons();
    });
  }

  // Handle individual product checkboxes
  productCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const productId = checkbox.value;

      if (checkbox.checked) {
        selectedProducts.add(productId);
      } else {
        selectedProducts.delete(productId);

        // Uncheck "Select All" if any individual checkbox is unchecked
        if (selectAllCheckbox) {
          selectAllCheckbox.checked = false;
        }
      }

      // Update bulk action buttons
      updateBulkActionButtons();
    });
  });

  // Update bulk action buttons based on selection
  function updateBulkActionButtons() {
    const hasSelection = selectedProducts.size > 0;

    if (bulkActionBtn) {
      bulkActionBtn.disabled = !hasSelection;
    }

    if (bulkDiscountBtn) {
      bulkDiscountBtn.disabled = !hasSelection;
    }

    if (bulkDeleteBtn) {
      bulkDeleteBtn.disabled = !hasSelection;
    }
  }

  // Handle bulk discount application
  if (bulkDiscountBtn) {
    bulkDiscountBtn.addEventListener("click", () => {
      if (selectedProducts.size === 0) return;

      // Show discount modal
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Apply Discount",
          html: `
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                <select id="discount-type" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value</label>
                <input type="number" id="discount-value" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" min="0" step="0.01">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date (Optional)</label>
                <input type="date" id="discount-expiry" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              </div>
            `,
          showCancelButton: true,
          confirmButtonText: "Apply Discount",
          showLoaderOnConfirm: true,
          preConfirm: () => {
            const discountType = document.getElementById("discount-type").value;
            const discountValue = document.getElementById("discount-value").value;
            const discountExpiry = document.getElementById("discount-expiry").value;

            if (!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) {
              Swal.showValidationMessage("Please enter a valid discount value");
              return false;
            }

            // Convert selected products set to array
            const productIds = Array.from(selectedProducts);

            // Send request to apply discount
            return fetch("/admin/products/bulk-discount", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productIds,
                discountType,
                discountValue,
                discountExpiry: discountExpiry || null,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to apply discount");
                }
                return response.json();
              })
              .catch((error) => {
                Swal.showValidationMessage(`Request failed: ${error.message}`);
              });
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Success!",
              text: `Discount applied to ${selectedProducts.size} products`,
              icon: "success",
            }).then(() => {
              // Reload page to show updated prices
              window.location.reload();
            });
          }
        });
      } else {
        console.error("SweetAlert2 is not defined. Make sure it is imported.");
      }
    });
  }

  // Handle bulk delete
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", () => {
      if (selectedProducts.size === 0) return;

      // Confirm deletion
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete ${selectedProducts.size} products. This action cannot be undone.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete them!",
          cancelButtonText: "Cancel",
          showLoaderOnConfirm: true,
          preConfirm: () => {
            // Convert selected products set to array
            const productIds = Array.from(selectedProducts);

            // Send request to delete products
            return fetch("/admin/products/bulk-delete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ productIds }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to delete products");
                }
                return response.json();
              })
              .catch((error) => {
                Swal.showValidationMessage(`Request failed: ${error.message}`);
              });
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Deleted!",
              text: `${selectedProducts.size} products have been deleted.`,
              icon: "success",
            }).then(() => {
              // Reload page to update product list
              window.location.reload();
            });
          }
        });
      } else {
        console.error("SweetAlert2 is not defined. Make sure it is imported.");
      }
    });
  }

  // Handle stock filtering
  if (stockFilterSelect) {
    stockFilterSelect.addEventListener("change", () => {
      const filterValue = stockFilterSelect.value;

      if (productsTable) {
        // Clear existing search and apply new filter
        productsTable.search("").columns().search("").draw();

        if (filterValue === "all") {
          productsTable.draw();
        } else if (filterValue === "out-of-stock") {
          productsTable.column(4).search("0$", true, false).draw();
        } else if (filterValue === "low-stock") {
          // Assuming column 4 is the stock column and low stock is < 10
          productsTable.column(4).search("^([1-9]|10)$", true, false).draw();
        }
      }
    });
  }
});
