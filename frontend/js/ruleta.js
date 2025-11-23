// =======================
//  STATE GLOBAL
// =======================
document.addEventListener("dragstart", e => {
  e.preventDefault();
});

document.addEventListener("contextmenu", function(e) {
  if (e.target.closest(".ghost-chip") || e.target.closest(".chip")) {
    e.preventDefault();
  }
});


let saldoTotal = 0;
let saldoDisponible = 0;

let chipSeleccionada = null;
let ghostChip = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

const fichasColocadas = [];
const apuestas = {};

// =======================
// DOM READY
// =======================

document.addEventListener("DOMContentLoaded", () => {

  // --------- DOM ---------
  const saldoBox = document.getElementById("saldoApuestasBox");
  const saldoTexto = document.getElementById("saldoApuestasTexto");
  const limpiarBtn = document.getElementById("limpiarApuestas");
  const spinBtn = document.getElementById("spinBtn");
  const board = document.querySelector(".board");

  // --------- SALDO ---------
  function sincronizarSaldo() {
    const saldoGuardado = localStorage.getItem("saldo");

    if (!saldoGuardado || isNaN(Number(saldoGuardado))) {
      localStorage.setItem("saldo", 0);
      saldoTotal = 0;
    } else {
      saldoTotal = Number(saldoGuardado);
    }

    saldoDisponible = saldoTotal;
    actualizarSaldoDisplay();
  }

  function actualizarSaldoDisplay() {
    saldoTexto.textContent = "$" + saldoDisponible.toLocaleString("es-CL");
  }

  function mostrarErrorSaldo() {
    saldoBox.classList.add("saldo-error");
    setTimeout(() => saldoBox.classList.remove("saldo-error"), 1500);
  }

  sincronizarSaldo();

  // =======================
  // CAPTURAR CAMBIO DE SALDO DESDE OTRA PÁGINA
  // =======================
  window.addEventListener("storage", (event) => {
    if (event.key === "saldo") {
      sincronizarSaldo();
    }
  });

  // =======================
  // CHIPS
  // =======================

  const chips = document.querySelectorAll(".chip");

  chips.forEach(chip => {
    chip.addEventListener("mousedown", (e) => {

      const valorFicha = Number(chip.dataset.valor);

      if (!valorFicha || valorFicha > saldoDisponible || saldoDisponible <= 0) {
        mostrarErrorSaldo();
        chipSeleccionada = null;
        return;
      }

      chipSeleccionada = chip;
      iniciarDrag(chip, e);
    });
  });

  // =======================
  // DRAG & DROP
  // =======================

  function iniciarDrag(chip, e) {

    isDragging = true;

    ghostChip = chip.cloneNode(true);
    ghostChip.classList.add("ghost-chip");
    document.body.appendChild(ghostChip);

    const rect = chip.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    moverGhost(e.clientX, e.clientY);
  }

  function moverGhost(x, y) {
    if (!ghostChip) return;

    ghostChip.style.position = "fixed";
    ghostChip.style.left = (x - offsetX) + "px";
    ghostChip.style.top = (y - offsetY) + "px";
    ghostChip.style.pointerEvents = "none";
    ghostChip.style.opacity = "0.8";
    ghostChip.style.zIndex = "9999";
  }

  document.addEventListener("mousemove", (e) => {
    if (isDragging) moverGhost(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", () => {

    if (!isDragging) return;
    isDragging = false;

    const zonas = detectarZonas(ghostChip);

    if (zonas.length === 0) {
      ghostChip.remove();
      ghostChip = null;
      return;
    }

    const valorFicha = Number(ghostChip.dataset.valor);

    if (valorFicha > saldoDisponible) {
      ghostChip.remove();
      mostrarErrorSaldo();
      ghostChip = null;
      return;
    }

    confirmarApuesta(ghostChip, zonas, valorFicha);
    ghostChip = null;
  });

  // =======================
  // DETECTAR ZONAS
  // =======================

  function detectarZonas(chipEl) {
    const zonas = [];
    const cells = document.querySelectorAll(".cell");
    const chipRect = chipEl.getBoundingClientRect();

    cells.forEach(cell => {
      const r = cell.getBoundingClientRect();

      if (
        !(chipRect.right < r.left ||
          chipRect.left > r.right ||
          chipRect.bottom < r.top ||
          chipRect.top > r.bottom)
      ) {
        zonas.push(cell);
      }
    });

    return zonas;
  }

  // =======================
  // CONFIRMAR APUESTA
  // =======================

  function confirmarApuesta(chipEl, zonas, valor) {

    fichasColocadas.push({
      el: chipEl,
      valor: valor
    });

    saldoDisponible -= valor;
    actualizarSaldoDisplay();

    fijarFichaEnTablero(chipEl);
    agregarEventoBorrado(chipEl, valor);
  }

  function fijarFichaEnTablero(chipEl) {
  const boardRect = board.getBoundingClientRect();
  const chipRect = chipEl.getBoundingClientRect();

  const x = chipRect.left - boardRect.left;
  const y = chipRect.top - boardRect.top;

  chipEl.style.position = "absolute";
  chipEl.style.left = x + "px";
  chipEl.style.top = y + "px";
  chipEl.style.pointerEvents = "auto";
  chipEl.style.zIndex = "500";

  board.appendChild(chipEl);
}


  // =======================
  // BORRAR FICHA
  // =======================

  function agregarEventoBorrado(el, valor) {
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      el.remove();
      saldoDisponible += valor;
      actualizarSaldoDisplay();
    });
  }

  // =======================
  // LIMPIAR APUESTAS
  // =======================

  limpiarBtn.addEventListener("click", () => {
    fichasColocadas.forEach(f => f.el.remove());
    fichasColocadas.length = 0;

    saldoDisponible = saldoTotal;
    actualizarSaldoDisplay();
  });

  // =======================
  // GIRAR RULETA
  // =======================

  spinBtn.addEventListener("click", () => {

    // aquí después metemos cálculo de ganancias/pérdidas

    fichasColocadas.forEach(f => f.el.remove());
    fichasColocadas.length = 0;

    saldoDisponible = saldoTotal;
    actualizarSaldoDisplay();
  });
});
