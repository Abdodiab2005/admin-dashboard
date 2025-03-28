import { animateBtns, validation } from "./inputs-functions.js";
animateBtns.initAnimations();

async function checkPasswordStrength(password) {
  const minLength = 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  let strength = 0;
  if (password.length >= minLength) {
    strength++;
  } else {
    strength = 0;
  }
  hasLowercase ? strength++ : strength--;
  if (hasUppercase) {
    strength++;
  } else {
    strength--;
  }
  if (hasNumber) {
    strength++;
  } else {
    strength--;
  }
  if (hasSpecialChar) {
    strength++;
  } else {
    strength--;
  }
  switch (strength) {
    case 5:
      return true;
    case 4:
      return false;
    case 3:
      return false;
    case 2:
      return false;
    default:
      return false;
  }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  animateBtns.loadingBtnActive();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password) {
    errorAlert("Please fill all fields");
    animateBtns.loadingBtnDisable();
    return;
  }
  if (!(await validation.checkEmail(email))) {
    errorAlert("Invalid email");
    animateBtns.loadingBtnDisable();
    return;
  }

  if (!(await checkPasswordStrength(password))) {
    errorAlert(
      "Password must be at least 8 characters long, contain a capital letter, a number and a special character"
    );
    animateBtns.loadingBtnDisable();
    return;
  }

  try {
    await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then(async (res) => {
      if (res.redirected) {
        window.location.href = res.url;
      }
      if (!res.ok) {
        const errorData = await res.json();
        errorAlert(`Error : ${errorData.error}`);
        throw new Error(`Error : ${errorData.message}`);
      }
    });
  } catch (error) {
    console.error("Login failed:", error);
    errorAlert(`Invalid email or password ${error}`);
    animateBtns.loadingBtnDisable();
  }
});
