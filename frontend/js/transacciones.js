//-------------------------------------------
//  VALIDACIÓN DE FECHA (DEPÓSITO)
//-------------------------------------------
function esFechaVencimientoValida(expStr) {
  if (!/^\d{2}\/\d{2}$/.test(expStr)) return false;

  const [mesStr, anioStr] = expStr.split("/");
  const mes = Number(mesStr);
  const anio = 2000 + Number(anioStr);

  if (mes < 1 || mes > 12) return false;
  if (anio < 2000 || anio > 2099) return false;

  if (anio > 2025) return true;
  if (anio === 2025 && mes >= 12) return true;

  return false;
}

function configurarAutoFormatoExpiracion(input) {
  if (!input) return;

  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length <= 2) input.value = v;
    else input.value = v.slice(0, 2) + "/" + v.slice(2);
  });
}

//-------------------------------------------
//  MODAL CONFIRMACIÓN
//-------------------------------------------
function mostrarModalConfirmacion(texto, callbackAceptar) {
  const overlay = document.createElement("div");
  overlay.className = "overlay-confirmacion";

  const modal = document.createElement("div");
  modal.className = "modal-confirmacion";

  const titulo = document.createElement("h3");
  titulo.textContent = "Confirmación";

  const msg = document.createElement("p");
  msg.textContent = texto;

  const btns = document.createElement("div");
  btns.className = "modal-botones";

  const ok = document.createElement("button");
  ok.className = "btn-confirmar";
  ok.textContent = "Aceptar";

  const no = document.createElement("button");
  no.className = "btn-cancelar";
  no.textContent = "Cancelar";

  ok.addEventListener("click", () => {
    callbackAceptar();
    document.body.removeChild(overlay);
  });

  no.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  btns.appendChild(ok);
  btns.appendChild(no);

  modal.appendChild(titulo);
  modal.appendChild(msg);
  modal.appendChild(btns);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

//-------------------------------------------
//  HISTORIAL - LOCALSTORAGE
//-------------------------------------------
function obtenerHistorial() {
  const datos = localStorage.getItem("historial");
  return datos ? JSON.parse(datos) : [];
}

function guardarHistorial(lista) {
  localStorage.setItem("historial", JSON.stringify(lista));
}

function agregarTransaccion(tipo, monto) {
  const hoy = new Date();
  const fecha = hoy.toLocaleDateString("es-CL");

  const historial = obtenerHistorial();
  historial.push({ fecha, tipo, monto });

  guardarHistorial(historial);
  mostrarHistorial();
}

function mostrarHistorial() {
  const historial = obtenerHistorial();
  const tabla = document.getElementById("tablaHistorial");
  tabla.innerHTML = "";

  const ultimos = historial.slice(-10).reverse();

  ultimos.forEach((item) => {
    const tr = document.createElement("tr");

    const tdF = document.createElement("td");
    tdF.textContent = item.fecha;

    const tdT = document.createElement("td");
    tdT.textContent = item.tipo;

    const tdM = document.createElement("td");
    tdM.classList.add("text-right");

    tdM.textContent =
      (item.tipo === "Ingreso" ? "+ $ " : "- $ ") +
      item.monto.toLocaleString("es-CL");

    tdM.style.color = item.tipo === "Ingreso" ? "lightgreen" : "red";

    tr.appendChild(tdF);
    tr.appendChild(tdT);
    tr.appendChild(tdM);
    tabla.appendChild(tr);
  });

  const cont = document.getElementById("historialContenedor");

  if (historial.length > 10) {
    cont.style.maxHeight = "300px";
    cont.style.overflowY = "scroll";
  } else {
    cont.style.maxHeight = "none";
    cont.style.overflowY = "hidden";
  }
}

//-------------------------------------------
//  MENSAJE DE OPERACIÓN EXITOSA
//-------------------------------------------
function mostrarOperacionExitosa() {
  const mensajeOperacion = document.getElementById("mensaje-operacion");
  if (!mensajeOperacion) return;

  mensajeOperacion.textContent = "Operación exitosa";
  mensajeOperacion.classList.remove("oculto");

  setTimeout(() => {
    mensajeOperacion.classList.add("oculto");
  }, 2500);
}

//-------------------------------------------
//  REDONDEO DE MONTOS
//-------------------------------------------
function redondearMonto(valorStr) {
  const texto = valorStr.trim();
  if (texto === "") return NaN;

  let v = Number(texto);
  if (!Number.isFinite(v) || v <= 0) return NaN;

  if (v < 1000) v = 1000;
  v = Math.round(v / 100) * 100;

  return v;
}

function configurarRedondeoEnBlur(input) {
  if (!input) return;
  input.addEventListener("blur", () => {
    const valorActual = input.value.trim();
    if (valorActual === "") return; // campo vacío se mantiene vacío

    const monto = redondearMonto(valorActual);
    if (!Number.isFinite(monto)) {
      input.value = "";
      return;
    }
    input.value = monto;
  });
}

//-------------------------------------------
//  LÓGICA PRINCIPAL
//-------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

  //-------------------------------------------
  //  SALDO
  //-------------------------------------------
  let saldo = Number(localStorage.getItem("saldo"));
  if (isNaN(saldo)) {
    saldo = 0;
    localStorage.setItem("saldo", saldo);
  }

  const saldoElem = document.getElementById("saldo-actual");
  const actualizarSaldo = () => {
    saldoElem.textContent =
      "Saldo actual: $" + saldo.toLocaleString("es-CL") + " CLP";
  };
  actualizarSaldo();
  mostrarHistorial();

  //-------------------------------------------
  //  ABRIR / CERRAR MENÚS
  //-------------------------------------------
  const contDep = document.getElementById("contenedor-deposito");
  const contRet = document.getElementById("contenedor-retiro");

  document.getElementById("btn-abrir-deposito").addEventListener("click", () => {
    contRet.classList.add("oculto");
    contDep.classList.remove("oculto");
  });

  document.getElementById("btn-abrir-retiro").addEventListener("click", () => {
    contDep.classList.add("oculto");
    contRet.classList.remove("oculto");
  });

  //-------------------------------------------
  //  CAMPOS Y FORMATO
  //-------------------------------------------
  const inpExp = document.getElementById("expiracion");
  configurarAutoFormatoExpiracion(inpExp);

  const inpDepMonto = document.getElementById("monto-deposito");
  const inpRetMonto = document.getElementById("retiro-monto");

  // redondeo al salir del campo (después de escribir)
  configurarRedondeoEnBlur(inpDepMonto);
  configurarRedondeoEnBlur(inpRetMonto);

  //-------------------------------------------
  //  DEPÓSITO
  //-------------------------------------------
  const formDep = document.getElementById("form-deposito");

  formDep.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre-titular").value.trim();
    const tarjeta = document
      .getElementById("numero-tarjeta")
      .value.replace(/\s+/g, "");
    const exp = inpExp.value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    // normalizar / redondear monto en el submit también
    const montoRedondeado = redondearMonto(inpDepMonto.value);
    const monto = montoRedondeado;
    if (Number.isFinite(montoRedondeado)) {
      inpDepMonto.value = montoRedondeado;
    }

    const err = document.getElementById("mensaje-error");
    const ok = document.getElementById("mensaje-exito");

    err.textContent = "";
    ok.textContent = "";
    const errores = [];

    if (!nombre) errores.push("Ingrese nombre del titular.");
    if (!/^\d{16}$/.test(tarjeta))
      errores.push("La tarjeta debe tener 16 dígitos.");
    if (!esFechaVencimientoValida(exp))
      errores.push("Fecha de expiración inválida.");
    if (!/^\d{3}$/.test(cvv)) errores.push("CVV inválido.");

    if (!Number.isFinite(monto) || monto < 1000)
      errores.push("Monto inválido, mínimo $1.000 (se redondea al múltiplo de 100 más cercano).");

    if (errores.length > 0) {
      err.textContent = errores.join(" ");
      return;
    }

    mostrarModalConfirmacion(
      "¿Está seguro de cargar un monto de $" + monto.toLocaleString("es-CL") + "?",
      () => {
        saldo += monto;
        localStorage.setItem("saldo", saldo);
        actualizarSaldo();
        agregarTransaccion("Ingreso", monto);
        ok.textContent = "Depósito realizado.";
        formDep.reset();
        contDep.classList.add("oculto");
        mostrarOperacionExitosa();
      }
    );
  });

  //-------------------------------------------
  //  RETIRO
  //-------------------------------------------
  const formRet = document.getElementById("form-retiro");

  formRet.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("retiro-nombre").value.trim();
    const cuenta = document.getElementById("retiro-cuenta").value.trim();
    const banco = document.getElementById("retiro-banco").value.trim();

    const montoRedondeado = redondearMonto(inpRetMonto.value);
    const monto = montoRedondeado;
    if (Number.isFinite(montoRedondeado)) {
      inpRetMonto.value = montoRedondeado;
    }

    const err = document.getElementById("mensaje-retiro-error");
    const ok = document.getElementById("mensaje-retiro-exito");
    err.textContent = "";
    ok.textContent = "";

    const errores = [];

    if (!nombre) errores.push("Ingrese el nombre del titular.");
    if (!cuenta) errores.push("Ingrese el número de cuenta.");
    if (!banco) errores.push("Seleccione un banco.");

    if (!Number.isFinite(monto) || monto < 1000)
      errores.push("Monto inválido, mínimo $1.000 (se redondea al múltiplo de 100 más cercano).");

    if (monto > saldo) errores.push("Saldo insuficiente.");

    if (errores.length > 0) {
      err.textContent = errores.join(" ");
      return;
    }

    mostrarModalConfirmacion(
      "¿Estás seguro de querer retirar $" + monto.toLocaleString("es-CL") + "?",
      () => {
        saldo -= monto;
        localStorage.setItem("saldo", saldo);
        actualizarSaldo();
        agregarTransaccion("Retiro", monto);
        ok.textContent = "Retiro completado.";
        formRet.reset();
        contRet.classList.add("oculto");
        mostrarOperacionExitosa();
      }
    );
  });

});
