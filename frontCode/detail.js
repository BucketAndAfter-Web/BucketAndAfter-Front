const titleField = document.getElementById("titleField");
const detailTextarea = document.getElementById("detail");
const logTextarea = document.getElementById("log");

const titleButton = document.getElementById("titleButton");
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

function setEditing(button, field) {
  field.disabled = false;
  button.textContent = "저장";
  button.classList.replace("sec-btn", "pri-btn");
  field.focus();
}

function validateField(field, error) {
  const isValid = field.value.trim() !== "";
  error.hidden = isValid;
  field.classList.toggle("input-error", !isValid);
  field.setAttribute("aria-invalid", String(!isValid));
  return isValid;
}

if (bucketList) {
  document.title = bucketList.title || "버킷리스트 상세";
  detailTitle.textContent = bucketList.title || "제목 없음";
  titleField.value = bucketList.title || "";
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

function connectEditSave(button, field, property, error, onSaved = null) {
  field.addEventListener("input", () => {
    if (!error.hidden) validateField(field, error);
  });

  button.addEventListener("click", () => {
    if (field.disabled) {
      setEditing(button, field);
      return;
    }

    if (!validateField(field, error)) {
      field.focus();
      return;
    }
    if (!bucketList) return;

    bucketList[property] = field.value.trim();
    bucketLists[index] = bucketList;
    localStorage.setItem("bucketLists", JSON.stringify(bucketLists));

    field.disabled = true;
    error.hidden = true;
    field.classList.remove("input-error");
    field.setAttribute("aria-invalid", "false");
    button.textContent = "수정하기";
    button.classList.replace("pri-btn", "sec-btn");
    if (onSaved) onSaved(field.value.trim());
  });
}

connectEditSave(
  titleButton,
  titleField,
  "title",
  document.getElementById("titleError"),
  (title) => {
    document.title = title;
    detailTitle.textContent = title;
  },
);
connectEditSave(detailButton, detailTextarea, "info", document.getElementById("detailError"));
connectEditSave(logButton, logTextarea, "thoughts", document.getElementById("logError"));

completeBtn.addEventListener("click", () => {
  if (!bucketList) return;

  const fields = [
    { button: titleButton, field: titleField, error: document.getElementById("titleError") },
    { button: detailButton, field: detailTextarea, error: document.getElementById("detailError") },
    { button: logButton, field: logTextarea, error: document.getElementById("logError") },
  ];
  const invalidFields = fields.filter(({ field, error }) => !validateField(field, error));

  if (invalidFields.length > 0) {
    invalidFields.forEach(({ button, field }) => {
      if (field.disabled) setEditing(button, field);
    });
    invalidFields[0].field.focus();
    return;
  }

  bucketList.title = titleField.value.trim();
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
