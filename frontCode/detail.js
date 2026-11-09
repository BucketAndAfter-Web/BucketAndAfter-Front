const detailTextarea = document.getElementById("detail");
const logTextarea = document.getElementById("log");

const detailButton = document.getElementById("detailButton");
const logButton = document.getElementById("logButton");



function connectEditSave(button, textarea) {
  button.addEventListener("click", () => {
    if (textarea.disabled) {
      textarea.disabled = false;
      button.textContent = "저장";
      button.classList.replace("sec-btn", "pri-btn");
    } else {
      textarea.disabled = true;
      button.textContent = "수정";
      button.classList.replace("pri-btn", "sec-btn");
    }
  });
}

connectEditSave(detailButton, detailTextarea);
connectEditSave(logButton, logTextarea);