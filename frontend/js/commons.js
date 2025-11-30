document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;
    const isProtected = path.includes("perfil") || path.includes("transacciones") || path.includes("ruleta");
    const isAuthPage = path.includes("login") || path.includes("registro");

    // 1. Verificar estado de la sesión
    let user = null;
    try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
            user = await res.json();
        } else if (res.status === 401 && isProtected) {
            window.location.href = "login.html";
            return;
        }
    } catch (e) {
        console.error("Error verificando sesión", e);
    }

    // 2. Actualizar Barra de Navegación
    actualizarNavbar(user);

    // 3. Redirección inversa (si estoy logueado, no debo estar en login/registro)
    if (user && isAuthPage) {
        window.location.href = "perfil.html";
    }

    // 4. Listeners globales
    configurarBotonesGlobales();
});

function actualizarNavbar(user) {
    const navUl = document.querySelector("nav ul");
    if (!navUl) return;

    // Limpiamos la navegación actual para reconstruirla según estado
    navUl.innerHTML = `
        <li><a href="index.html">Inicio</a></li>
        <li><a href="desarrolladores.html">Sobre Nosotros</a></li>
        <li><a href="historia.html">Reglas</a></li>
    `;

    if (user) {
        // Usuario Autenticado
        const liPerfil = document.createElement("li");
        liPerfil.innerHTML = `<a href="perfil.html">Perfil (${user.username})</a>`;
        
        const liRuleta = document.createElement("li");
        liRuleta.innerHTML = `<a href="ruleta.html">Ruleta</a>`;

        const liTrans = document.createElement("li");
        liTrans.innerHTML = `<a href="transacciones.html">Transacciones</a>`;

        const liLogout = document.createElement("li");
        liLogout.innerHTML = `<a href="#" id="btn-logout">Salir</a>`;
        liLogout.addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "login.html";
        });

        navUl.appendChild(liPerfil);
        navUl.appendChild(liRuleta);
        navUl.appendChild(liTrans);
        navUl.appendChild(liLogout);
    } else {
        // Usuario No Autenticado
        const liLogin = document.createElement("li");
        liLogin.innerHTML = `<a href="login.html">Iniciar Sesión</a>`;
        navUl.appendChild(liLogin);
    }
}

function configurarBotonesGlobales() {
    // Botones de la Home
    const btnLoginIndex = document.querySelector(".btn-iniciar-sesion");
    if (btnLoginIndex) btnLoginIndex.addEventListener("click", () => location.href = 'login.html');

    const btnRegisterIndex = document.querySelector(".btn-registrarse");
    if (btnRegisterIndex) btnRegisterIndex.addEventListener("click", () => location.href = 'registro.html');
}