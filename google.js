fetch("../json/GoogleForms.json")
  .then((res) => res.json())
  .then((data) => {
    const texts = data[0];

    document.querySelectorAll("input").forEach((input) => {
      const key = input.getAttribute("value");
      if (texts[key]) {
        input.value = texts[key];
      }
    });
  });

function loadLang(lang) {
  fetch(`../json/languages/${lang}.json`)
    .then((res) => res.json())
    .then((data) => {
      const texts = data[0];

      document.querySelectorAll("[data-key]").forEach((el) => {
        const key = el.dataset.key;
        el.textContent = texts[key];
      });

      document.documentElement.lang = lang;
      document.body.dir = lang === "ar" ? "rtl" : "ltr";
    });
}

function changeLang(lang) {
  localStorage.setItem("lang", lang);
  loadLang(lang);
}

const savedLang = localStorage.getItem("lang") || "ar";
loadLang(savedLang);

/// =================== goToStep =================== ///

function goToStep(stepNumber, scroll = true) {
  const target = parseInt(stepNumber);

  for (let i = 1; i <= 100; i++) {
    const stepDiv = document.getElementById("step" + i);
    if (stepDiv) {
      stepDiv.style.display = "none";
    }

    const tabBtn = document.getElementById("tab" + i);
    if (tabBtn) {
      tabBtn.classList.remove("active", "completed");

      if (i < target) {
        tabBtn.classList.add("completed");
      } else if (i === target) {
        tabBtn.classList.add("active");
      }
    }
  }
  const currentDiv = document.getElementById("step" + target);
  if (currentDiv) {
    currentDiv.style.display = "flex";
  }
  localStorage.setItem("lastStep", target);

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function goToSubStep(fullId, scroll = true) {
  const lastUnderscoreIndex = fullId.lastIndexOf("_");

  if (lastUnderscoreIndex === -1) {
    console.error("خطأ: الـ ID لازم يحتوي على شرطة سفلية مثل step7_1");
    return;
  }

  const prefix = fullId.substring(0, lastUnderscoreIndex + 1);
  const target = parseInt(fullId.substring(lastUnderscoreIndex + 1));

  for (let i = 1; i <= 200; i++) {
    const subDiv = document.getElementById(prefix + i);
    if (subDiv) {
      subDiv.style.display = "none";
    }
  }

  const currentDiv = document.getElementById(fullId);
  if (currentDiv) {
    currentDiv.style.display = "flex";
  }

  localStorage.setItem("lastSubStep", fullId);

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/// =================== checkRadioGroups =================== ///

document.querySelectorAll('input[id^="search_"]').forEach((input) => {
  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    const groupId = input.id.replace("search_", "");
    const groupDiv = document.getElementById(groupId);
    if (!groupDiv) return;
    const items = groupDiv.querySelectorAll(".radio-item");
    items.forEach((item) => {
      const label = item.querySelector("label");
      const text = label.textContent.toLowerCase();
      item.style.display = text.includes(value) ? "block" : "none";
    });
  });
});

// =================== startForm =================== //

function saveFields() {
  document.querySelectorAll("input, textarea").forEach((field) => {
    const eventType = field.type === "radio" || field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventType, () => {
      if (field.type === "radio") {
        if (field.checked) {
          localStorage.setItem(field.name, field.value);
        }
      } else if (field.type === "checkbox") {
        const checkedVals = Array.from(
          document.querySelectorAll(`input[name="${field.name}"]:checked`),
        )
          .map((i) => i.value)
          .join(",");
        localStorage.setItem(field.name, checkedVals);
      } else {
        if (field.id) {
          localStorage.setItem(field.id, field.value);
        }
      }
    });
  });
}

function loadFields() {
  document.querySelectorAll("input, textarea").forEach((field) => {
    if (field.type === "radio") {
      const saved = localStorage.getItem(field.name);
      if (saved !== null) {
        field.checked = field.value === saved;
      }
    } else if (field.type === "checkbox") {
      const saved = localStorage.getItem(field.name);
      if (saved) {
        field.checked = saved.split(",").includes(field.value);
      }
    } else {
      if (field.id) {
        const saved = localStorage.getItem(field.id);
        if (saved !== null) {
          field.value = saved;
        }
      }
    }
  });
}

window.addEventListener("load", () => {
  const savedStep = localStorage.getItem("lastStep") || 1;
  goToStep(savedStep, false);

  const savedSubStep = localStorage.getItem("lastSubStep");

  if (savedSubStep) {
    goToSubStep(savedSubStep, false);
  }
});

window.addEventListener("load", () => {
  const observer = new MutationObserver((mutations, obs) => {
    const inputs = document.querySelectorAll('input[type="radio"]');
    if (inputs.length > 0) {
      loadFields();
      saveFields();
      obs.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

window.addEventListener("load", () => {
  loadFields();
});

document.addEventListener("click", function (e) {
  const el = e.target;
  if (el.hasAttribute("nextBtn")) {
    const parts = el.id.split("_");
    const itemNumber = parts[parts.length - 1];

    if (itemNumber === "1") goToStep(3);
    else if (itemNumber === "2") goToStep(4);
    else if (itemNumber === "3") goToStep(5);
  }
});

function generateRadioButtons(containerId, totalItems, entryName, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let htmlContent = "";

  https: for (let i = 1; i <= totalItems; i++) {
    const valueAttribute = `${prefix}${i}`;
    const elementId = `opt_${containerId}_${i}`;

    const isNext = prefix === "a" ? "nextBtn" : "";

    htmlContent += `
      <div class="radio-item">
        <input type="radio" name="${entryName}" data-required value="${valueAttribute}" id="${elementId}" ${isNext} />
        <label for="${elementId}" data-key="${valueAttribute}"></label>
      </div>`;
  }

  container.innerHTML = htmlContent;
}

generateRadioButtons("1593134746", 3, "entry.1593134746", "a");
generateRadioButtons("11479402", 157, "entry.11479402", "q");
generateRadioButtons("103065307", 73, "entry.103065307", "w");
generateRadioButtons("1121630026", 92, "entry.1121630026", "k");
generateRadioButtons("288080024", 8, "entry.288080024", "m");

function injectAndControl(parentId, totalItems, googleEntries, charPrefix) {
  const container = document.getElementById(parentId);
  if (!container) return;

  let html = "";

  for (let i = 0; i < totalItems; i++) {
    const stepNum = i + 1;
    const currentId = `${parentId}_${stepNum}`;

    const titleKey = `${charPrefix}${stepNum}`;

    const entryName = `entry.${googleEntries[i]}`;

    html += `
        <div id="${currentId}" class="evaluation_content" style="display: ${stepNum === 1 ? "flex" : "none"}">
            <h4 data-key="${titleKey}"></h4>

            <div class="step_radio container-fluid">
                ${[1, 2, 3, 4]
                  .map(
                    (optNum) => `
                    <div class="radio-item1">
                        <input type="radio" name="${entryName}" data-required value="evaluation${optNum}" id="${currentId}_opt${optNum}">
                        <label for="${currentId}_opt${optNum}" data-key="evaluation${optNum}"></label>
                    </div>
                `,
                  )
                  .join("")}
            </div>

            <div class="step-buttons">
                <button type="button" class="btn step-button"
                    onclick="${stepNum === 1 ? `goToStep(2)` : `goToSubStep('${parentId}_${stepNum - 1}')`}">
                    السابق
                </button>

                <button type="button" class="btn step-button"
                    onclick="${stepNum === totalItems ? `goToStep(99)` : `injectEvaluation('${parentId}_${stepNum + 1}')`}">
                    التالي
                </button>
            </div>
        </div>`;
  }

  container.innerHTML = html;
}

const myIds1 = [
"1651461674",
"1120403019",
"769639348",
"868825774",
"1653588789",
"646681837",
"433077419",
"1065039191",
"916864479",
"259976496",
"256937676",
"921512909",
"1906652562",
"1468752453",
"840282981",
"1938738609",
"882618301",
"581142474",
"1876574467",
"726810435",
"1314515757",
"1119556799",
"2051749387",
"1478080960",
"556368536",
"51869828",
"1333046096",
"1468578341",
"476933559",
"1022313869",
"2003947345",
"2142290840",
"1697611337",
"1300534607",
"614569849",
"447655625",
"764297104",
"1246431186",
"1231743901",
"1891306018",
"57232792",
"118273576",
"1931602464",
"681409738",
"1519547449",
"1297253302",
"1134882973",
"1452864318",
"102632168",
"1787275125",
"1804132750",
"1119639164",
"1534421767",
"1261139044",
"1713260066",
"761386466",
"1494445593",
"788772604",
"913858878",
"764101963",
"2000074240",
"559153263",
"452203553"
]
;
injectAndControl("step7", 85, myIds1, "s");
const myIds2 = [
  "106948619",
  "149432561",
  "390537237",
  "32520453",
  "999494494",
  "1407521226"
]
;
injectAndControl("step8", 6, myIds2, "g");
const myIds3 = [
  "1295327135",
  "1816585272",
  "1679536833",
  "1684566038",
  "2084108278",
  "1148047256",
  "2037201518",
  "2120975473",
  "1105091709",
  "932374790",
  "1776923735",
  "292655809",
  "152082500",
  "1643608916",
  "1125151155",
  "1380115236",
  "1140824152",
  "1693088296",
  "2072697462",
  "2055244231",
  "1622053043",
  "2008279004",
  "1115155880",
  "178639488",
  "1350606120",
  "1160883452",
  "1354108983",
  "1458305190",
  "1769447092",
  "653330217",
  "1549060678",
  "1568278319",
  "650856484",
  "1492583196",
  "108109494",
  "200729032",
  "783135341",
  "2080320561",
  "1156020496",
  "920908843",
  "1354469954",
  "1050363702",
  "721638045",
  "438129725",
  "682534156",
  "803742781",
  "415987554",
  "1178475941",
  "1838861950",
  "1728580993",
  "941279366",
  "289005696",
  "1885261389",
  "477977220",
  "688377351",
  "1534344925",
  "621749476",
  "593157584",
  "1855902238",
  "83213971",
  "1872368056",
  "1100355409",
  "2033755054",
  "37310104",
  "1204350340",
  "1903778694",
  "1705453767",
  "609949087",
  "2069000342",
  "1950127865",
  "134408993",
  "1088447909",
  "1984880572",
  "1303887664",
  "1529615624",
  "1123794780",
  "1228729154",
  "1069446257",
  "1636245557",
  "1700653949",
  "34051332",
  "571096580",
  "220850901",
  "1034949190",
  "1364793536"
]
;
injectAndControl("step9", 63, myIds3, "x"); 

function submitToGoogle() {
  const form = document.getElementById("steps_container");
  const googleUrl =
        "https://docs.google.com/forms/d/e/1FAIpQLScslpFIA8_XxJb8Nj-QFTkyC-Nac7HNRqb8lh58Gy1vS4Jo4Q/formResponse"
  const formData = new FormData(form);

  fetch(googleUrl, {
    method: "POST",
    body: formData,
    mode: "no-cors",
  })
    .then(() => {
      alert("تم الإرسال!");
      form.reset();
      if (typeof goToStep === "function") goToStep(1);
    })
    .catch(() => {
      alert("فشل الإرسال");
    });
}

let currentVisibleStep = null;
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentVisibleStep = entry.target;
      }
    });
  },
  {
    threshold: 0.6,
  },
);
document.querySelectorAll(".step, .evaluation_content").forEach((step) => observer.observe(step));

function validateCurrentStep() {
  if (!currentVisibleStep) return true;

  const requiredInputs = currentVisibleStep.querySelectorAll("[data-required]");

  for (let input of requiredInputs) {
    if (input.type === "radio") {
      const isChecked = currentVisibleStep.querySelector(`input[name="${input.name}"]:checked`);

      if (!isChecked) {
        alert("فضلاً اختر أحد الخيارات المطلوبة.");
        return false;
      }
    } else {
      if (!input.value || !input.value.trim()) {
        alert("هذا الحقل مطلوب.");
        input.focus();
        return false;
      }
    }
  }

  return true;
}


function validateAndGo(stepNumber) {
  if (validateCurrentStep()) {
    goToStep(stepNumber);
  }
}

function injectEvaluation(stepNumber) {
  if (validateCurrentStep()) {
    goToSubStep(stepNumber);
  }
}



