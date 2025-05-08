// 1) Imágenes de fondo
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
  
  // 2) Resto tal cual
  const API_URL = "https://script.google.com/macros/s/AKfycbwGv3grN4gSG2ZYiQiMefNkUBb_7YQlA2v3of7BCf-GjE6pouZ7P8hkJeHAYeOYLTRG/exec";
  const form    = document.getElementById("searchForm");
  const inp     = document.getElementById("dniInput");
  const msg     = document.getElementById("message");
  const result  = document.querySelector(".table-wrapper");
  const overlay = document.getElementById("overlay");
  
  // Animaciones de entrada
  window.addEventListener("load", () => {
    document.querySelector(".header").classList.add("visible");
    document.querySelector(".search-form").classList.add("visible");
  });
  
  // Mostrar mensaje
  function showMessage(text, type="") {
    msg.textContent = text;
    msg.className   = `message ${type}`;
  }
  
  // Limpiar resultados
  function clearResult() {
    result.innerHTML = "";
    showMessage("");
  }
  
  // Skeleton loader
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
    for(let i=0;i<rows;i++){
      const tr = document.createElement("tr");
      tr.className="skeleton-row";
      const td = document.createElement("td");
      td.colSpan = 6;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    result.appendChild(table);
  }
  
  // Formatear fecha
  function formatDate(iso) {
    const d = new Date(iso);
    if(isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }
  
  // Render tabla
  function renderTable(records) {
    clearResult();
    if(!records.length){
      showMessage("No se encontraron registros.","error");
      return;
    }
    const table = document.createElement("table");
    table.className="result-table";
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    const cols = ["Fecha","Asist. Diaria","Ingreso","Salida","Total","Obs"];
    cols.forEach(c=>{
      const th = document.createElement("th");
      th.textContent = c;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
  
    const tbody = document.createElement("tbody");
    records.forEach(r=>{
      const tr = document.createElement("tr");
      cols.forEach(c=>{
        const td = document.createElement("td");
        if(c==="Fecha"){
          td.textContent = formatDate(r.Fecha);
        } else {
          const key = {
            "Asist. Diaria":"Asistencia Diaria",
            "Ingreso":"Marcación Ingreso",
            "Salida":"Marcación Salida",
            "Total":"Tiempo Total",
            "Obs":"Observacion"
          }[c];
          td.textContent = r[key] != null ? r[key] : "";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    result.appendChild(table);
    setTimeout(() => table.classList.add("visible"), 50);
  }
  
  // Fetch y render
  async function fetchAndRender(dni) {
    clearResult();
    showSkeleton(5);
    overlay.classList.add("active");
    try {
      const res  = await fetch(API_URL);
      if(!res.ok) throw new Error(res.status);
      let data = await res.json();
      let records = data.filter(r=>r.DNI&&r.DNI.toString().trim()===dni);
      records.sort((a,b)=>new Date(a.Fecha)-new Date(b.Fecha));
      renderTable(records);
    } catch(e) {
      clearResult();
      showMessage("Error al cargar datos.","error");
      console.error(e);
    } finally {
      overlay.classList.remove("active");
    }
  }
  
  // Submit handler
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const dni = inp.value.trim();
    if(!/^\d{8}$/.test(dni)){
      showMessage("Ingrese un DNI válido (8 dígitos).","error");
      return;
    }
    showMessage("");
    fetchAndRender(dni);
  });
  
// Botón Regresar: vuelve al index
const btnReg = document.getElementById('btn-regresar');
if (btnReg) {
  btnReg.addEventListener('click', () => {
    // animación fade-out si usas la misma lógica
    document.body.classList.add('fade-out');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  });
}
