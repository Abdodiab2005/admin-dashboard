// Theme management for dark/light mode
document.addEventListener("DOMContentLoaded", () => {
  // Check for saved theme preference or use system preference
  const getThemePreference = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    // Update toggle button state
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", theme === "dark");

      // Update icon
      const darkIcon = toggleBtn.querySelector(".dark-icon");
      const lightIcon = toggleBtn.querySelector(".light-icon");

      if (darkIcon && lightIcon) {
        if (theme === "dark") {
          darkIcon.classList.remove("hidden");
          lightIcon.classList.add("hidden");
        } else {
          darkIcon.classList.add("hidden");
          lightIcon.classList.remove("hidden");
        }
      }
    }
  };

  // Initialize theme
  applyTheme(getThemePreference());

  // Set up theme toggle
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentTheme = localStorage.getItem("theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
    });
  }

  // Listen for system preference changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
});
