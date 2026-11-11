const detailTextarea = document.getElementById("detail");
const logTextarea = document.getElementById("log");

const detailButton = document.getElementById("detailButton");
const logButton = document.getElementById("logButton");

const params = new URLSearchParams(window.location.search);
const indexText = params.get("index");
const index = Number(indexText);

const bucketLists = JSON.parse(localStorage.getItem("bucketLists") || "[]");

const bucketList = indexText === null ? null : bucketLists[index];

const completeBtn = document.getElementById("completeButton");

console.log("선택한 번호:", index);
console.log("찾은 버킷:", bucketList);

if (bucketList) {
  // detailTitle.textContet에 bucketList.title 넣거나 비우거나
  document.getElementById("detailTitle").textContent = bucketList.title || "";
  detailTextarea.value = bucketList.info || "";
  logTextarea.value = bucketList.thoughts || "";
}

function connectEditSave(button, textarea, property) {
  button.addEventListener("click", () => {
    if (textarea.disabled) {
      textarea.disabled = false;
      button.textContent = "저장";
      button.classList.replace("sec-btn", "pri-btn");
    } else {
      //내용 저장
      bucketList[property] = textarea.value.trim();
      bucketLists[index] = bucketList;
      localStorage.setItem("bucketLists", JSON.stringify(bucketLists))

      textarea.disabled = true;
      button.textContent = "수정";
      button.classList.replace("pri-btn", "sec-btn");
    }
  });
}

connectEditSave(detailButton, detailTextarea, "info");
connectEditSave(logButton, logTextarea, "thoughts");

completeBtn.addEventListener("click", () => {
  bucketList.info = detailTextarea.value.trim();
  bucketList.thoughts = logTextarea.value.trim();
  bucketList.completed = true;

  bucketLists[index] = bucketList;
  localStorage.setItem("bucketLists", JSON.stringify(bucketLists));

  window.location.href = "main.html";
})