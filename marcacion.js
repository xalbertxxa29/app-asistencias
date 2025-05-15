// marcacion.js
document.addEventListener('DOMContentLoaded', () => {
  // ——— Modal de aviso ———
  const modal    = document.getElementById('updateInfoModal');
  const closeBtn = document.getElementById('closeModal');
  modal.classList.add('show');
  closeBtn.addEventListener('click', () => modal.classList.remove('show'));

  // ——— Rotación de fondo ———
  const bgImages = [
    'images/bg1.jpg',
    'images/bg2.jpg',
    'images/bg3.jpg',
    'images/bg4.jpg'
  ];
  let bgIndex = 0;
  const bgEl = document.querySelector('.bg-container');
  function rotateBackground() {
    bgEl.style.backgroundImage = `url('${bgImages[bgIndex]}')`;
    bgIndex = (bgIndex + 1) % bgImages.length;
  }
  rotateBackground();
  setInterval(rotateBackground, 8000);

  // ——— Referencias DOM ———
  const API_URL = "https://script.google.com/macros/s/AKfycbwGv3grN4gSG2ZYiQiMefNkUBb_7YQlA2v3of7BCf-GjE6pouZ7P8hkJeHAYeOYLTRG/exec";
  const form    = document.getElementById("searchForm");
  const inp     = document.getElementById("dniInput");
  const msg     = document.getElementById("message");
  const result  = document.querySelector(".table-wrapper");
  const overlay = document.getElementById("overlay");

  // ——— Animaciones de entrada ———
  window.addEventListener("load", () => {
    document.querySelector(".header").classList.add("visible");
    document.querySelector(".search-form").classList.add("visible");
  });

  // ——— Helpers ———
  function showMessage(text, type = "") {
    msg.textContent = text;
    msg.className   = `message ${type}`;
  }
  function clearResult() {
    result.innerHTML = "";
    showMessage("");
  }
  function showSkeleton(rows = 5) {
    clearResult();
    const table = document.createElement("table");
    table.className = "result-table visible";
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    ["Fecha","Asist. Diaria","Ingreso","Salida","Total","Obs"].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (let i = 0; i < rows; i++) {
      const tr = document.createElement("tr");
      tr.className = "skeleton-row";
      const td = document.createElement("td");
      td.colSpan = 6;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    result.appendChild(table);
  }

  // ——— Formatear fecha (corrige el offset) ———
  function formatDate(iso) {
    // 1. Parsear
    const d = new Date(iso);
    // 2. Añadir el offset para volver a "medianoche local"
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    // 3. Generar dd/mm/aa
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  // ——— Renderizar tabla ———
  function renderTable(records) {
    clearResult();
    if (!records.length) {
      showMessage("No se encontraron registros.", "error");
      return;
    }
    const table = document.createElement("table");
    table.className = "result-table";
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    const cols = ["Fecha","Asist. Diaria","Ingreso","Salida","Total","Obs"];
    cols.forEach(c => {
      const th = document.createElement("th");
      th.textContent = c;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    records.forEach(r => {
      const tr = document.createElement("tr");
      cols.forEach(c => {
        const td = document.createElement("td");
        if (c === "Fecha") {
          td.textContent = formatDate(r.Fecha || r.fecha);
        } else {
          const keyMap = {
            "Asist. Diaria": "Asistencia Diaria",
            "Ingreso":       "Marcación Ingreso",
            "Salida":        "Marcación Salida",
            "Total":         "Tiempo Total",
            "Obs":           "Observacion"
          };
          td.textContent = r[keyMap[c]] != null ? r[keyMap[c]] : "";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    result.appendChild(table);
    // pequeña animación
    setTimeout(() => table.classList.add("visible"), 50);
  }

  // ——— Fetch + render (con bust de caché) ———
  async function fetchAndRender(dni) {
    clearResult();
    showSkeleton(5);
    overlay.classList.add("active");
    try {
      const url = `${API_URL}?cacheBust=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let records = data.filter(r =>
        r.DNI && r.DNI.toString().trim() === dni
      );
      records.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
      renderTable(records);
    } catch (e) {
      clearResult();
      showMessage("Error al cargar datos.", "error");
      console.error(e);
    } finally {
      overlay.classList.remove("active");
    }
  }

  // ——— Submit handler ———
  form.addEventListener("submit", e => {
    e.preventDefault();
    const dni = inp.value.trim();
    if (!/^\d{8}$/.test(dni)) {
      showMessage("Ingrese un DNI válido (8 dígitos).", "error");
      return;
    }
    fetchAndRender(dni);
  });

  // ——— Botón Regresar ———
  const btnReg = document.getElementById('btn-regresar');
  if (btnReg) {
    btnReg.addEventListener('click', () => {
      document.body.classList.add('fade-out');
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  }
});
