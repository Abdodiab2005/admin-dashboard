// popup.js

class Popup2 {
  constructor(id) {
    this.id = id;
    this.popupElement = document.getElementById(id);
    this.closeButton = document.getElementById(`${id}-close`);
    this.outsideClickAllowed = true;

    // Attach close event listener
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.hide());
    }

    // Handle outside clicks
    document.addEventListener("click", (event) => {
      if (this.outsideClickAllowed && this.popupElement && !this.popupElement.contains(event.target)) {
        this.hide();
      }
    });
  }

  show(options) {
    const popup = document.getElementById(this.id);

    if (!popup) return;

    // Update popup content dynamically
    popup.querySelector(".popup-title").textContent = options.title || "Popup Title";
    popup.querySelector(".popup-description").textContent = options.message || "Default Message";

    const iconElement = popup.querySelector(".popup-icon i");
    iconElement.className = "";
    iconElement.classList.add(...(options.iconClass.split(" ") || "hidden"));

    // Clear existing buttons
    const buttonsContainer = popup.querySelector(".popup-actions");
    buttonsContainer.innerHTML = "";

    // Add new buttons
    (options.buttons || []).forEach((button) => {
      const buttonElement = document.createElement("button");
      buttonElement.className = `px-4 py-2 rounded-md ${button.className || "bg-blue-500 text-white"}`;
      buttonElement.textContent = button.label || "OK";
      buttonElement.onclick = button.onClick;
      buttonsContainer.appendChild(buttonElement);
    });

    // Show the popup
    popup.classList.remove("hidden");
  }

  hide() {
    if (this.popupElement) {
      this.popupElement.classList.add("hidden");
    }
  }

  allowOutsideClick(allow = true) {
    this.outsideClickAllowed = allow;
  }
}

// Export the Popup class for reuse
window.Popup2 = Popup2;
