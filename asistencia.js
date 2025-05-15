// asistencia.js
document.addEventListener('DOMContentLoaded', () => {
  // Modal de aviso
  const modal    = document.getElementById('updateInfoModal')
  const closeBtn = document.getElementById('closeModal');
  modal.classList.add('show');
  closeBtn.addEventListener('click', () => modal.classList.remove('show'));

  // Referencias y lógica existente
  const apiUrl        = "https://script.google.com/macros/s/AKfycbz7Xq2hRJ5q72XyA8R2LA9HWFtnjKPc_dU852MZfne5h_OFyxkT1aT1TAbzTMlBa1vB8g/exec";
  const daysMarch     = ["22","23","24","25","26","27","28","29","30","31"];
  const daysApril     = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21"];
  const form          = document.getElementById("searchForm");
  const inp           = document.getElementById("dniInput");
  const msg           = document.getElementById("message");
  const fullName      = document.getElementById("fullName");
  const overlay       = document.getElementById("overlay");
  const monthCals     = document.querySelectorAll(".month-calendar");
  const statValidated = document.getElementById("stat-validated");
  const statNoShow    = document.getElementById("stat-no-show");
  const statShould    = document.getElementById("stat-should-show");

  function showMessage(text, type = "") {
    msg.textContent = text;
    msg.className   = `message ${type}`;
  }

  function resetAll() {
    document.querySelectorAll(".day").forEach(cell => {
      cell.className = "day skeleton";
      cell.querySelector(".value").textContent = "";
    });
    fullName.textContent      = "";
    statValidated.textContent = "–";
    statNoShow.textContent    = "–";
    statShould.textContent    = "–";
    showMessage("");
    monthCals.forEach(c => c.classList.remove("visible"));
  }

  async function fetchData() {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const dni = inp.value.trim();
    if (!/^\d{8}$/.test(dni)) {
      showMessage("DNI inválido (8 dígitos).", "error");
      return;
    }
    resetAll();
    showMessage("Cargando…");
    overlay.classList.add("active");

    let data;
    try {
      data = await fetchData();
    } catch {
      showMessage("Error al conectar con la API.", "error");
      overlay.classList.remove("active");
      return;
    }

    const record = data.find(r =>
      r.DNI && r.DNI.toString().trim() === dni
    );
    if (!record) {
      showMessage("No se encontró registro para ese DNI.", "error");
      overlay.classList.remove("active");
      return;
    }

    fullName.textContent = record["APELLIDOS Y NOMBRES"] || "";
    fullName.classList.add("visible");
    statValidated.textContent = record["# TOTAL ASISTENCIA VALIDADA"] || "0";
    statNoShow.textContent    = record["# NO MARCÓ"]                  || "0";
    statShould.textContent    = record["# DEBIO MARCAR"]             || "0";

    showMessage("¡Registro encontrado!", "success");
    [daysMarch, daysApril].forEach((days, idx) => {
      const cal = monthCals[idx];
      cal.classList.add("visible");
      days.forEach((d, i) => {
        const cell = cal.querySelector(`.day[data-day="${d}"]`);
        const val  = (record[d] || "").toString().trim().toUpperCase();
        cell.classList.remove("skeleton");
        if (val) {
          cell.querySelector(".value").textContent = val;
          cell.classList.add("has-value");
          if (val !== "X") cell.classList.add("val-" + val);
        } else {
          cell.classList.add("no-data");
        }
        setTimeout(() => cell.classList.add("visible"), i * 50);
      });
    });
    overlay.classList.remove("active");
  });

  window.addEventListener("load", () => {
    document.querySelector(".header").classList.add("visible");
    document.querySelector(".search-form").classList.add("visible");
  });

  document.getElementById('btn-regresar').addEventListener('click', () => {
    document.body.classList.add('fade-out');
    setTimeout(() => window.location.href = 'index.html', 500);
  });
});
