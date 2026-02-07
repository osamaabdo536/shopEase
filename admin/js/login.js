function validation(ele) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var passRegex = /^[A-Z][a-z_0-9]{3,}[\W]/;

  var errorDisplay = ele.parentElement.nextElementSibling;

  if (!ele.value.trim()) {
    let displayName = ele.name === "pass" ? "password" : ele.name;
    errorDisplay.textContent = `please enter ${displayName}`;
    ele.style.border = "2px solid red";
    return false;
  }

  if (
    (ele.name === "email" && !emailRegex.test(ele.value.trim())) ||
    (ele.name === "pass" && !passRegex.test(ele.value.trim()))
  ) {
    let displayName = ele.name === "pass" ? "password" : ele.name;
    errorDisplay.textContent = `invalid ${displayName}`;
    ele.style.border = "2px solid red";
    return false;
  }

  errorDisplay.textContent = "";
  ele.style.border = "2px solid green";
  return true;
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  var emailInput = document.getElementById("email");
  var passInput = document.getElementById("pass");

  var v1 = validation(emailInput);
  var v2 = validation(passInput);

  if (!v1 || !v2) return;

  const userData = {
    email: emailInput.value,
    password: passInput.value,
  };

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://ecommerce.routemisr.com/api/v1/auth/signin");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        localStorage.setItem("userData", JSON.stringify(res.user));
        window.location.replace("admin.html");
      } else {
        window.location.replace("login.html");
      }
    }
  };

  xhr.send(JSON.stringify(userData));
});
