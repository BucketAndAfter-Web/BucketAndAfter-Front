const titleField = document.getElementById("titleField");
const detailTextarea = document.getElementById("detail");
const logTextarea = document.getElementById("log");

const titleButton = document.getElementById("titleButton");
const detailButton = document.getElementById("detailButton");
const logButton = document.getElementById("logButton");
const photoInput = document.getElementById("thoughtPhotoInput");
const photoControls = document.getElementById("photoControls");
const photoError = document.getElementById("photoError");
const photoGallery = document.getElementById("thoughtPhotoGallery");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImage = document.getElementById("photoViewerImage");
const closePhotoViewer = document.getElementById("closePhotoViewer");
let thoughtPhotos = [];

const params = new URLSearchParams(window.location.search);
const indexText = params.get("index");
const index = Number(indexText);
const bucketLists = JSON.parse(localStorage.getItem("bucketLists") || "[]");
const bucketList = indexText === null ? null : bucketLists[index];
const detailTitle = document.getElementById("detailTitle");
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

function validateField(field, error) {
  const isValid = field.value.trim() !== "";
  error.hidden = isValid;
  field.classList.toggle("input-error", !isValid);
  field.setAttribute("aria-invalid", String(!isValid));
  return isValid;
}

function renderThoughtPhotos() {
  photoGallery.replaceChildren();
  photoControls.hidden = logTextarea.disabled;

  thoughtPhotos.forEach((source, index) => {
    const figure = document.createElement("figure");
    figure.className = "thought-photo";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "thought-photo-open";
    openButton.setAttribute("aria-label", `사진 ${index + 1} 크게 보기`);

    const image = document.createElement("img");
    image.src = source;
    image.alt = `달성 소감 사진 ${index + 1}`;
    openButton.appendChild(image);
    openButton.addEventListener("click", () => {
      photoViewerImage.src = source;
      photoViewerImage.alt = `달성 소감 사진 ${index + 1}`;
      photoViewer.showModal();
    });
    figure.appendChild(openButton);

    if (!logTextarea.disabled) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "thought-photo-remove";
      removeButton.textContent = "×";
      removeButton.setAttribute("aria-label", `사진 ${index + 1} 삭제`);
      removeButton.addEventListener("click", () => {
        thoughtPhotos.splice(index, 1);
        renderThoughtPhotos();
      });
      figure.appendChild(removeButton);
    }

    photoGallery.appendChild(figure);
  });
}

closePhotoViewer.addEventListener("click", () => photoViewer.close());
photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) photoViewer.close();
});

function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 1200;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("사진을 읽을 수 없습니다."));
    };
    image.src = objectUrl;
  });
}

photoInput.addEventListener("change", async () => {
  const selectedFiles = Array.from(photoInput.files || []);
  photoInput.value = "";
  if (selectedFiles.length === 0) return;

  const availableSlots = 5 - thoughtPhotos.length;
  if (availableSlots <= 0) {
    photoError.textContent = "사진은 최대 5장까지 추가할 수 있어요.";
    photoError.hidden = false;
    return;
  }

  const filesToAdd = selectedFiles.slice(0, availableSlots);
  if (selectedFiles.length > availableSlots) {
    photoError.textContent = "사진은 최대 5장까지 추가할 수 있어요. 가능한 사진만 추가합니다.";
    photoError.hidden = false;
  } else {
    photoError.hidden = true;
  }

  photoInput.disabled = true;
  logButton.disabled = true;
  try {
    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) continue;
      thoughtPhotos.push(await compressPhoto(file));
      renderThoughtPhotos();
    }
  } catch (error) {
    photoError.textContent = "사진을 불러오지 못했어요. 다른 사진을 선택해주세요.";
    photoError.hidden = false;
  } finally {
    photoInput.disabled = false;
    logButton.disabled = false;
    renderThoughtPhotos();
  }
});

function setEditing(button, field, property) {
  field.disabled = false;
  button.textContent = property === "thoughts" && bucketList.completed !== true
    ? "달성 완료 및 저장"
    : "저장";
  button.classList.replace("sec-btn", "pri-btn");
  field.focus();
}

if (bucketList) {
  document.title = bucketList.title || "버킷리스트 상세";
  detailTitle.textContent = bucketList.title || "제목 없음";
  titleField.value = bucketList.title || "";
  detailTextarea.value = bucketList.info || "";
  logTextarea.value = bucketList.thoughts || "";
  thoughtPhotos = Array.isArray(bucketList.thoughtPhotos) ? bucketList.thoughtPhotos : [];
  logButton.textContent = bucketList.completed === true ? "소감 수정하기" : "소감 작성하기";
  renderThoughtPhotos();

  if (bucketList.completed === true) {
    const achievementDate = document.getElementById("achievementDate");
    const completionDate = document.getElementById("completionDate");
    achievementDate.hidden = false;
    completionDate.textContent = formatAchievementDate(bucketList.completedAt);
    if (bucketList.completedAt) completionDate.dateTime = bucketList.completedAt;
  }
}

function completeBucketList() {
  if (!bucketList) return;

  const fields = [
    { button: titleButton, field: titleField, property: "title", error: document.getElementById("titleError") },
    { button: detailButton, field: detailTextarea, property: "info", error: document.getElementById("detailError") },
    { button: logButton, field: logTextarea, property: "thoughts", error: document.getElementById("logError") },
  ];
  const invalidFields = fields.filter(({ field, error }) => !validateField(field, error));

  if (invalidFields.length > 0) {
    invalidFields.forEach(({ button, field, property }) => {
      if (field.disabled) setEditing(button, field, property);
    });
    invalidFields[0].field.focus();
    return;
  }

  bucketList.title = titleField.value.trim();
  bucketList.info = detailTextarea.value.trim();
  bucketList.thoughts = logTextarea.value.trim();
  bucketList.thoughtPhotos = [...thoughtPhotos];
  bucketList.completed = true;
  bucketList.completedAt = bucketList.completedAt || getLocalDateString();
  bucketLists[index] = bucketList;
  localStorage.setItem("bucketLists", JSON.stringify(bucketLists));
  window.location.href = "main.html";
}

function connectEditSave(button, field, property, error, onSaved = null) {
  field.addEventListener("input", () => {
    if (!error.hidden) validateField(field, error);
  });

  button.addEventListener("click", () => {
    if (field.disabled) {
      setEditing(button, field, property);
      if (property === "thoughts") renderThoughtPhotos();
      return;
    }

    if (!validateField(field, error)) {
      field.focus();
      return;
    }
    if (!bucketList) return;

    if (property === "thoughts" && bucketList.completed !== true) {
      completeBucketList();
      return;
    }

    bucketList[property] = field.value.trim();
    if (property === "thoughts") bucketList.thoughtPhotos = [...thoughtPhotos];
    bucketLists[index] = bucketList;
    localStorage.setItem("bucketLists", JSON.stringify(bucketLists));

    field.disabled = true;
    if (property === "thoughts") renderThoughtPhotos();
    error.hidden = true;
    field.classList.remove("input-error");
    field.setAttribute("aria-invalid", "false");
    button.textContent = property === "thoughts" ? "소감 수정하기" : "수정하기";
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

deleteBtn.addEventListener("click", () => {
  if (!bucketList) return;
  const confirmed = window.confirm("이 버킷리스트를 삭제할까요? 삭제한 항목은 복구할 수 없습니다.");
  if (!confirmed) return;

  bucketLists.splice(index, 1);
  localStorage.setItem("bucketLists", JSON.stringify(bucketLists));
  window.location.href = "main.html";
});
