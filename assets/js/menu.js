const { remote } = require("electron");
const closeBtn = document.getElementById("close");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const maximizeIcon = maximizeBtn.querySelector("IMG");
const Win = remote.getCurrentWindow();
closeBtn.addEventListener("click", () => {
  Win.close();
});
minimizeBtn.addEventListener("click", () => {
  // let window = remote.getCurrentWindow();
  Win.minimize();
});
maximizeBtn.addEventListener("click", () => {
  // let window = remote.getCurrentWindow();
  // window.isMaximized() ? window.unmaximize() : window.maximize();
  if (Win.isMaximized()) {
    Win.unmaximize();
    maximizeIcon.src = "./assets/svg/Maximize.svg";
  } else {
    Win.maximize();
    maximizeIcon.src = "./assets/svg/Unmaximize.svg";
  }
});

/*
if (remote.getCurrentWindow().isMaximized()) {
  console.log("windows maximized");
  let maximizeBtn = document.getElementById("maximize");
  maximizeBtn.src = "././assets/svg/Unmaximize.svg";
} else {
  console.log("windows unmaximized");
}
*/
