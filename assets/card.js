var confirmElement = document.querySelector(".confirm");

var time = document.getElementById("time");

if (localStorage.getItem("update") == null) {
  localStorage.setItem("update", "24.12.2024");
}

var date = new Date();

var updateText = document.querySelector(".bottom_update_value");
updateText.innerHTML = localStorage.getItem("update");

var update = document.querySelector(".update");
update.addEventListener("click", () => {
  var newDate = date.toLocaleDateString("pl-PL", options);
  localStorage.setItem("update", newDate);
  updateText.innerHTML = newDate;

  scroll(0, 0);
});

setClock();
function setClock() {
  date = new Date();
  time.innerHTML =
    "Czas: " +
    date.toLocaleTimeString("pl-PL", optionsTime) +
    " " +
    date.toLocaleDateString("pl-PL", options);
  delay(1000).then(() => {
    setClock();
  });
}

var unfold = document.querySelector(".info_holder");
unfold.addEventListener("click", () => {
  if (unfold.classList.contains("unfolded")) {
    unfold.classList.remove("unfolded");
  } else {
    unfold.classList.add("unfolded");
  }
});

var params = new URLSearchParams(window.location.search);
const FORM_STORAGE_PREFIX = "mobywatel_form_";
const IMAGE_STORAGE_KEY = "mobywatel_image_url";
const SEX_STORAGE_KEY = "mobywatel_sex";

function loadReadyData(result) {
  Object.keys(result).forEach((key) => {
    result[key] = htmlEncode(result[key] || "");
  });

  const birthdayDate = new Date();
  const hasBirthday = result["year"] && result["month"] && result["day"];

  if (hasBirthday) {
    birthdayDate.setFullYear(result["year"], result["month"] - 1, result["day"]);
  }

  var sex = result["sex"];

  let day = hasBirthday ? birthdayDate.getDate() : "";
  let month = hasBirthday ? birthdayDate.getMonth() + 1 : "";
  let year = hasBirthday ? birthdayDate.getFullYear() : "";
  const dayNumber = hasBirthday ? birthdayDate.getDate() : 0;
  const monthNumber = hasBirthday ? birthdayDate.getMonth() + 1 : 0;

  var textSex;
  if (sex === "m") {
    textSex = "Mężczyzna";
  } else if (sex === "k") {
    textSex = "Kobieta";
  }

  var seriesAndNumber = localStorage.getItem("seriesAndNumber");
  if (!seriesAndNumber) {
    seriesAndNumber = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUWXYZ".split("");
    for (var i = 0; i < 4; i++) {
      seriesAndNumber += chars[getRandom(0, chars.length)];
    }
    seriesAndNumber += " ";
    for (var i = 0; i < 5; i++) {
      seriesAndNumber += getRandom(0, 9);
    }
    localStorage.setItem("seriesAndNumber", seriesAndNumber);
  }

  if (hasBirthday) {
    day =
      dayNumber > 9
        ? String(dayNumber)
        : "0" + dayNumber;
    month =
      monthNumber > 9
        ? String(monthNumber)
        : "0" + monthNumber;
  } else {
    day = "";
    month = "";
    year = "";
  }

  setData("seriesAndNumber", seriesAndNumber);
  setData("name", result["name"] ? result["name"].toUpperCase() : "");
  setData("surname", result["surname"] ? result["surname"].toUpperCase() : "");
  setData("nationality", result["nationality"] ? result["nationality"].toUpperCase() : "");
  setData("fathersName", result["fathersName"] ? result["fathersName"].toUpperCase() : "");
  setData("mothersName", result["mothersName"] ? result["mothersName"].toUpperCase() : "");
  setData(
    "birthday",
    hasBirthday
      ? day + "." + month + "." + birthdayDate.getFullYear()
      : ""
  );
  setData("familyName", result["familyName"] || result["surname"] || "");
  setData("sex", textSex || "");
  setData("fathersFamilyName", result["fathersFamilyName"] || result["surname"] || "");
  setData("mothersFamilyName", result["mothersFamilyName"] || "");
  setData("birthPlace", result["birthPlace"] || "");
  setData("countryOfBirth", result["countryOfBirth"] || "");
  setData(
    "adress",
    "ul. " +
      result["address1"] +
      "<br>" +
      result["address2"] +
      " " +
      result["city"],
  );

  if (hasBirthday) {
    var givenDate = new Date(birthdayDate);
    givenDate.setFullYear(givenDate.getFullYear() + 18);

    var offsetDays = getRandom(-30, 30); // -90 .. +10 days
    givenDate.setDate(givenDate.getDate() + offsetDays);

    setData("givenDate", givenDate.toLocaleDateString("pl-PL", options));

    var expiryDate = new Date(givenDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);
    setData("expiryDate", expiryDate.toLocaleDateString("pl-PL", options));
  } else {
    setData("givenDate", "");
    setData("expiryDate", "");
  }

  if (!localStorage.getItem("homeDate")) {
    var homeDay = getRandom(1, 25);
    var homeMonth = getRandom(0, 12);
    var homeYear = getRandom(2012, 2019);

    var homeDate = new Date();
    homeDate.setDate(homeDay);
    homeDate.setMonth(homeMonth);
    homeDate.setFullYear(homeYear);

    localStorage.setItem(
      "homeDate",
      homeDate.toLocaleDateString("pl-PL", options),
    );
  }

  document.querySelector(".home_date").innerHTML =
    localStorage.getItem("homeDate");

  let peselMonth = monthNumber;
  if (parseInt(year, 10) >= 2000) {
    peselMonth += 20;
  }

  var later;

  if (hasBirthday && (sex === "m" || sex === "k")) {
    if (sex === "m") {
      later = "0295";
    } else {
      later = "0382";
    }

    const peselMonthText = peselMonth < 10 ? "0" + peselMonth : String(peselMonth);
    const peselDayText = dayNumber < 10 ? "0" + dayNumber : String(dayNumber);

    var pesel = year.toString().substring(2) + peselMonthText + peselDayText + later + "7";
    setData("pesel", pesel);
  } else {
    setData("pesel", "");
  }
}

loadData();
async function loadData() {
  var db = await getDb();
  var data = await getData(db, "data");

  if (data) {
    loadReadyData(data);
  }

  let result = Object.fromEntries(params);

  if (Object.keys(result).length > 0) {
    result["data"] = "data";
    loadReadyData(result);
    saveData(db, result);
  } else if (!data) {
    const savedFormData = loadSavedFormData();
    if (savedFormData) {
      loadReadyData(savedFormData);
    }
  }
}

function loadSavedFormData() {
  const keys = [
    "name",
    "surname",
    "nationality",
    "fathersName",
    "mothersName",
    "familyName",
    "fathersFamilyName",
    "mothersFamilyName",
    "birthPlace",
    "countryOfBirth",
    "address1",
    "address2",
    "city",
    "day",
    "month",
    "year",
  ];

  const result = { data: "data" };
  let hasValue = false;

  keys.forEach((key) => {
    const value = localStorage.getItem(FORM_STORAGE_PREFIX + key);
    if (value !== null) {
      result[key] = value;
      hasValue = true;
    }
  });

  const savedSex = localStorage.getItem(SEX_STORAGE_KEY);
  if (savedSex === "m" || savedSex === "k") {
    result.sex = savedSex;
    hasValue = true;
  }

  const savedImage = localStorage.getItem(IMAGE_STORAGE_KEY);
  if (savedImage) {
    result.image = savedImage;
    hasValue = true;
  }

  return hasValue ? result : null;
}

loadImage();
async function loadImage() {
  var db = await getDb();
  var image = await getData(db, "image");

  const paramImage = params.get("image");
  const savedImage = localStorage.getItem(IMAGE_STORAGE_KEY);

  if (image) {
    setImage(image.image);
  } else if (paramImage) {
    setImage(paramImage);
  } else if (savedImage) {
    setImage(savedImage);
  }

  if (!paramImage) {
    return;
  }

  console.log(paramImage);
  fetch(paramImage, {
    method: "GET",
    headers: {
      Authorization: "Client-ID e4d98a899c8c946",
    },
  })
    .then((response) => response.blob())
    .then((result) => {
      var reader = new FileReader();
      reader.readAsDataURL(result);
      reader.onload = (event) => {
        var base = event.target.result;

        if (base !== image) {
          setImage(base);

          var data = {
            data: "image",
            image: base,
          };

          saveData(db, data);
        }
      };
    });
}

function setImage(image) {
  document.querySelector(".id_own_image").style.backgroundImage =
    `url(${image})`;
}

function setData(id, value) {
  document.getElementById(id).innerHTML = value;
}

function getDb() {
  return new Promise((resolve, reject) => {
    var request = window.indexedDB.open("cwelObywatel", 1);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    var name = "data";

    request.onupgradeneeded = (event) => {
      var db = event.target.result;

      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, {
          keyPath: name,
        });
      }
    };

    request.onsuccess = (event) => {
      var db = event.target.result;
      resolve(db);
    };
  });
}

function getData(db, name) {
  return new Promise((resolve, reject) => {
    var store = getStore(db);

    var request = store.get(name);

    request.onsuccess = () => {
      var result = request.result;
      if (result) {
        resolve(result);
      } else {
        resolve(null);
      }
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function getStore(db) {
  var name = "data";
  var transaction = db.transaction(name, "readwrite");
  return transaction.objectStore(name);
}

function saveData(db, data) {
  return new Promise((resolve, reject) => {
    var store = getStore(db);

    console.log(data);
    var request = store.put(data);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
