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
const deleteBtn = document.getElementById("deleteButton");

function formatAchievementDate(value) {
  if (!value) return "미기록";
  const [year, month, day] = value.split("-");
  return `${year}.${month}.${day}`;
}

function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

console.log("선택한 번호:", index);
console.log("찾은 버킷:", bucketList);

if (bucketList) {
  document.title = bucketList.title;
  document.getElementById("detailTitle").textContent = bucketList.title || "";
  detailTextarea.value = bucketList.info || "";
  logTextarea.value = bucketList.thoughts || "";

  if (bucketList.completed === true) {
    const achievementDate = document.getElementById("achievementDate");
    const completionDate = document.getElementById("completionDate");
    achievementDate.hidden = false;
    completionDate.textContent = formatAchievementDate(bucketList.completedAt);
    if (bucketList.completedAt) completionDate.dateTime = bucketList.completedAt;
  }
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
      localStorage.setItem("bucketLists", JSON.stringify(bucketLists));

      textarea.disabled = true;
      button.textContent = "수정";
      button.classList.replace("pri-btn", "sec-btn");
    }
  });
}

connectEditSave(detailButton, detailTextarea, "info");
connectEditSave(logButton, logTextarea, "thoughts");

completeBtn.addEventListener("click", () => {
  if (!bucketList) return;

  bucketList.info = detailTextarea.value.trim();
  bucketList.thoughts = logTextarea.value.trim();
  bucketList.completed = true;
  bucketList.completedAt = bucketList.completedAt || getLocalDateString();

  bucketLists[index] = bucketList;
  localStorage.setItem("bucketLists", JSON.stringify(bucketLists));

  window.location.href = "main.html";
});

deleteBtn.addEventListener("click", () => {
  if (!bucketList) return;
  const confirmed = window.confirm("이 버킷리스트를 삭제할까요? 삭제한 항목은 복구할 수 없습니다.");
  if (!confirmed) return;

  bucketLists.splice(index, 1);
  localStorage.setItem("bucketLists", JSON.stringify(bucketLists));
  window.location.href = "main.html";
});
