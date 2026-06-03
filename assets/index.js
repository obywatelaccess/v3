var selector = document.querySelector(".selector_box");
selector.addEventListener("click", () => {
  if (selector.classList.contains("selector_open")) {
    selector.classList.remove("selector_open");
  } else {
    selector.classList.add("selector_open");
  }
});

const dateHolder = document.querySelector(".date");
const birthDateInput = document.getElementById("birthDate");
const datePicker = document.querySelector(".date_picker");
const dayTable = document.querySelector(".day_table");
const monthTable = document.querySelector(".month_table");
const yearTable = document.querySelector(".year_table");
const saveDateButton = document.querySelector(".save_date");
const cancelDateButton = document.querySelector(".cancel_date");
let pendingDate = createDateParts(getMinAllowedBirthDate());

if (birthDateInput) {
  birthDateInput.addEventListener("click", openDatePicker);
  birthDateInput.addEventListener("focus", openDatePicker);
}

if (datePicker) {
  datePicker.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (saveDateButton) {
  saveDateButton.addEventListener("click", () => {
    setBirthDateValue(formatDateParts(pendingDate));
    saveField("birthDate", getBirthDateValue());
    validateBirthDate(true);
    closeDatePicker();
  });
}

if (cancelDateButton) {
  cancelDateButton.addEventListener("click", () => {
    syncPendingDateFromValue();
    closeDatePicker();
  });
}

document.addEventListener("click", (event) => {
  if (!dateHolder || !dateHolder.contains(event.target)) {
    closeDatePicker();
  }
});

function openDatePicker() {
  if (!dateHolder) return;
  dateHolder.classList.add("date_picker_open");
  syncPendingDateFromValue();
  renderDatePicker();
}

function closeDatePicker() {
  if (!dateHolder) return;
  dateHolder.classList.remove("date_picker_open");
}

function getMinAllowedBirthDate() {
  const now = new Date();
  const min = new Date(now);
  min.setFullYear(min.getFullYear() - 18);
  return min;
}

function createDateParts(date) {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
}

function getBirthDateValue() {
  if (!birthDateInput) return "";
  return birthDateInput.dataset.value || "";
}

function setBirthDateValue(value) {
  if (!birthDateInput) return;
  birthDateInput.dataset.value = value;
  birthDateInput.value = formatDateForDisplay(value);
}

function formatDateParts(parts) {
  const year = String(parts.year);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value) {
  const parsedDate = parseInputDate(value);
  if (!parsedDate) return "";
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}.${month}.${year}`;
}

function parseInputDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function validateBirthDate(showEmptyError = false) {
  if (!birthDateInput || !dateHolder) return false;

  const selectedDate = parseInputDate(getBirthDateValue());
  const isValid = selectedDate && selectedDate <= getMinAllowedBirthDate();

  dateHolder.classList.toggle("date_valid", Boolean(isValid));
  dateHolder.classList.toggle("error_shown", Boolean(!isValid && (getBirthDateValue() || showEmptyError)));

  return Boolean(isValid);
}

function syncPendingDateFromValue() {
  const selectedDate = parseInputDate(getBirthDateValue());
  pendingDate = createDateParts(selectedDate || getMinAllowedBirthDate());
}

function updatePendingDate(part, value) {
  pendingDate[part] = value;
  clampPendingDate();
  renderDatePicker();
}

function clampPendingDate() {
  const daysInMonth = new Date(pendingDate.year, pendingDate.month, 0).getDate();
  if (pendingDate.day > daysInMonth) {
    pendingDate.day = daysInMonth;
  }
}

function renderDatePicker() {
  renderPickerTable(dayTable, getDayOptions(), "day");
  renderPickerTable(monthTable, getMonthOptions(), "month");
  renderPickerTable(yearTable, getYearOptions(), "year");
}

function renderPickerTable(table, options, part) {
  if (!table) return;
  table.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "date_pick_option";
    button.textContent = option.label;
    button.setAttribute("aria-label", option.ariaLabel || option.label);

    if (option.value === pendingDate[part]) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      updatePendingDate(part, option.value);
    });

    table.appendChild(button);
  });
}

function getDayOptions() {
  const daysInMonth = new Date(pendingDate.year, pendingDate.month, 0).getDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      value: day,
      label: String(day).padStart(2, "0")
    });
  }

  return days;
}

function getMonthOptions() {
  const months = [];

  for (let month = 1; month <= 12; month++) {
    months.push({
      value: month,
      label: String(month).padStart(2, "0"),
      ariaLabel: `Miesiac ${month}`
    });
  }

  return months;
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= currentYear - 120; year--) {
    years.push({
      value: year,
      label: String(year)
    });
  }

  return years;
}

// Restore saved form data, then validate the remembered date state.
document.addEventListener("DOMContentLoaded", () => {
  restoreForm();
  syncPendingDateFromValue();
  renderDatePicker();
  validateBirthDate();
});

var sex = "m";
const FORM_STORAGE_PREFIX = "mobywatel_form_";
const IMAGE_STORAGE_KEY = "mobywatel_image_url";
const SEX_STORAGE_KEY = "mobywatel_sex";
const FIELDS_TO_SAVE = [
  "name",
  "surname",
  "birthDate",
  "nationality",
  "fathersName",
  "mothersName",
  "mothersFamilyName",
  "birthPlace",
  "countryOfBirth",
  "address1",
  "address2",
  "city"
];

function saveField(key, value) {
  try {
    localStorage.setItem(FORM_STORAGE_PREFIX + key, value);

    if (key === "surname") {
      localStorage.setItem(FORM_STORAGE_PREFIX + "familyName", value);
      localStorage.setItem(FORM_STORAGE_PREFIX + "fathersFamilyName", value);
    }
  } catch (error) {
    console.warn("Unable to save field to localStorage:", error);
  }
}

function restoreImage(url) {
  upload.setAttribute("selected", url);
  upload.classList.add("upload_loaded");
  upload.classList.remove("upload_loading");
  upload.classList.remove("error_shown");
  const uploadedImg = upload.querySelector(".upload_uploaded");
  if (uploadedImg) {
    uploadedImg.src = url;
  }
}

function restoreForm() {
  FIELDS_TO_SAVE.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    const storedValue = localStorage.getItem(FORM_STORAGE_PREFIX + id);
    if (storedValue !== null) {
      if (id === "birthDate") {
        setBirthDateValue(storedValue);
      } else {
        input.value = storedValue;
      }
    }
  });

  const savedSex = localStorage.getItem(SEX_STORAGE_KEY);
  if (savedSex === "m" || savedSex === "k") {
    sex = savedSex;
    const selectedOption = document.getElementById(savedSex);
    if (selectedOption) {
      document.querySelector(".selected_text").innerHTML = selectedOption.innerHTML;
    }
  }

  const savedImage = localStorage.getItem(IMAGE_STORAGE_KEY);
  if (savedImage) {
    restoreImage(savedImage);
  }
}

document.querySelectorAll(".selector_option").forEach((option) => {
  option.addEventListener("click", () => {
    sex = option.id;
    document.querySelector(".selected_text").innerHTML = option.innerHTML;
    localStorage.setItem(SEX_STORAGE_KEY, sex);
  });
});

const SUPABASE_BUCKET = 'photos'; // Use the exact lowercase bucket ID from Supabase Storage. This value is case-sensitive.
const SUPABASE_UPLOAD_DIR = ''; // Upload directly to the bucket root.
// Resulting object path will be photos/<filename>.

var upload = document.querySelector(".upload");

var imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = ".jpeg,.png";

document.querySelectorAll(".input_holder").forEach((element) => {
  var input = element.querySelector(".input");
  input.addEventListener("click", () => {
    element.classList.remove("error_shown");
  });
  input.addEventListener("input", () => {
    saveField(input.id, input.value);
  });
});

upload.addEventListener("click", () => {
  imageInput.click();
  upload.classList.remove("error_shown");
});

imageInput.addEventListener("change", async (event) => {
  upload.classList.remove("upload_loaded");
  upload.classList.add("upload_loading");

  upload.removeAttribute("selected");

  var file = imageInput.files[0];
  if (!file) {
    upload.classList.remove("upload_loading");
    return;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = SUPABASE_UPLOAD_DIR
    ? `${SUPABASE_UPLOAD_DIR}/${fileName}`
    : fileName; // If SUPABASE_UPLOAD_DIR is blank, upload directly at the bucket root.

  if (!window.supabase) {
    console.error('Supabase client is not initialized. Check index.html module script.');
    upload.classList.add("error_shown");
    upload.classList.remove("upload_loading");
    return;
  }

  try {
    const { data, error } = await window.supabase.storage.from(SUPABASE_BUCKET).upload(filePath, file);
    if (error) throw error;

    const { data: publicData, error: publicError } = window.supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    if (publicError) throw publicError;

    const url = publicData?.publicUrl || publicData?.publicURL || publicData?.public_url;

    upload.classList.remove("error_shown");
    upload.setAttribute("selected", url);
    upload.classList.add("upload_loaded");
    upload.classList.remove("upload_loading");
    upload.querySelector(".upload_uploaded").src = url;
    try {
      localStorage.setItem(IMAGE_STORAGE_KEY, url);
    } catch (error) {
      console.warn("Unable to save uploaded image URL:", error);
    }
  } catch (err) {
    console.error('Upload error:', err);
    upload.classList.add("error_shown");
    upload.classList.remove("upload_loading");
  }
});

document.querySelector(".go").addEventListener("click", () => {
  var empty = [];

  var params = new URLSearchParams();

  params.set("sex", sex);
  if (!upload.hasAttribute("selected")) {
    empty.push(upload);
    upload.classList.add("error_shown");
  } else {
    params.set("image", upload.getAttribute("selected"));
  }

  const dateValid = validateBirthDate(true);
  if (dateValid) {
    const [yearValue, monthValue, dayValue] = getBirthDateValue().split("-");
    params.set("day", String(parseInt(dayValue, 10)));
    params.set("month", String(parseInt(monthValue, 10)));
    params.set("year", yearValue);
    params.set("birthDate", getBirthDateValue());
  } else {
    empty.push(dateHolder);
  }

  document.querySelectorAll(".input_holder").forEach((element) => {
    var input = element.querySelector(".input");

    if (isEmpty(input.value)) {
      empty.push(element);
      element.classList.add("error_shown");
    } else {
      params.set(input.id, input.value);
    }
  });

  const surnameValue = params.get("surname") || "";
  if (surnameValue) {
    params.set("familyName", surnameValue);
    params.set("fathersFamilyName", surnameValue);
  }

  if (empty.length != 0) {
    empty[0].scrollIntoView();
  } else {
    forwardToId(params);
  }
});

function isEmpty(value) {
  let pattern = /^\s*$/;
  return pattern.test(value);
}

function forwardToId(params) {
  // Keep navigation correct when GitHub Pages is hosted under a subpath (e.g. /v3/)
  const url = new URL("id.html", window.location.href);
  url.search = params.toString();
  location.href = url.toString();
}


var guide = document.querySelector(".guide_holder");
guide.addEventListener("click", () => {
  if (guide.classList.contains("unfolded")) {
    guide.classList.remove("unfolded");
  } else {
    guide.classList.add("unfolded");
  }
});
