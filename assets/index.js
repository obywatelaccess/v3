var selector = document.querySelector(".selector_box");
selector.addEventListener("click", () => {
  if (selector.classList.contains("selector_open")) {
    selector.classList.remove("selector_open");
  } else {
    selector.classList.add("selector_open");
  }
});

document.querySelectorAll(".date_input").forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelector(".date").classList.remove("error_shown");
  });
  element.addEventListener("input", () => {
    saveField(element.id, element.value);
  });
});

var sex = "m";
const FORM_STORAGE_PREFIX = "mobywatel_form_";
const IMAGE_STORAGE_KEY = "mobywatel_image_url";
const SEX_STORAGE_KEY = "mobywatel_sex";
const FIELDS_TO_SAVE = [
  "name",
  "surname",
  "day",
  "month",
  "year",
  "nationality",
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
      input.value = storedValue;
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

document.addEventListener("DOMContentLoaded", restoreForm);

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

console.log('Supabase config:', {
  bucket: SUPABASE_BUCKET,
  uploadDir: SUPABASE_UPLOAD_DIR,
  url: window.supabase ? window.supabase.supabaseUrl : 'supabase not initialized',
});

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

  let dateEmpty = false;
  const day = document.getElementById("day");
  const month = document.getElementById("month");
  const year = document.getElementById("year");

  [day, month, year].forEach((input) => {
    if (isEmpty(input.value)) {
      dateEmpty = true;
    } else {
      params.set(input.id, input.value);
    }
  });

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
