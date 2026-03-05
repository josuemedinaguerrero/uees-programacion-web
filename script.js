// ============================================
//   MENÚ MÓVIL TOGGLE
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      const icon = this.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    const navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      });
    });
  }

  // ============================================
  //   INICIALIZACIÓN DE LA BÚSQUEDA DE API
  // ============================================
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = document.getElementById("search-input").value.trim();
      if (query) {
        buscarRepositorios(query);
      }
    });
  }

  // Búsqueda en tiempo real al presionar Enter en el input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = this.value.trim();
        if (query) {
          buscarRepositorios(query);
        }
      }
    });
  }
});

// ============================================
//   FUNCIÓN PRINCIPAL: BÚSQUEDA ASÍNCRONA
// ============================================

/**
 * Busca repositorios en GitHub usando la API pública
 * @param {string} query - Término de búsqueda ingresado por el usuario
 */
async function buscarRepositorios(query) {
  const contenedor = document.getElementById("resultados-container");
  const mensaje = document.getElementById("resultado-mensaje");

  // Limpiar resultados anteriores antes de cada nueva búsqueda
  contenedor.innerHTML = "";
  mensaje.textContent = "";

  // Mostrar indicador de carga
  mostrarCargando(contenedor);

  try {
    // Construir la URL dinámicamente con el valor del usuario
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=9`;

    // Petición fetch a la API pública de GitHub
    const response = await fetch(url);

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo conectar con la API de GitHub.`);
    }

    // Procesar la respuesta con await response.json()
    const data = await response.json();

    // Limpiar el indicador de carga
    contenedor.innerHTML = "";

    if (data.total_count === 0) {
      mensaje.innerHTML = `<i class="fas fa-search"></i> No se encontraron repositorios para "<strong>${query}</strong>". Intenta con otro término.`;
      return;
    }

    // Mostrar mensaje de resultados encontrados
    mensaje.innerHTML = `<i class="fas fa-check-circle"></i> Se encontraron <strong>${data.total_count.toLocaleString()}</strong> repositorios. Mostrando los 9 más populares.`;

    // Renderizar los resultados dinámicamente
    renderizarRepositorios(data.items, contenedor);
  } catch (error) {
    // Manejo de errores: mostrar mensaje legible al usuario
    contenedor.innerHTML = "";
    mostrarError(contenedor, error.message);
  }
}

// ============================================
//   RENDERIZADO DINÁMICO DE RESULTADOS
// ============================================

/**
 * Genera el HTML de los repositorios y lo inyecta al DOM
 * @param {Array} repositorios - Array de objetos del JSON de GitHub
 * @param {HTMLElement} contenedor - Elemento donde se inyectarán los resultados
 */
function renderizarRepositorios(repositorios, contenedor) {
  // Usar .map() para generar el HTML de cada repositorio
  const htmlCards = repositorios.map((repo) => {
    // Formatear la fecha
    const fechaActualizacion = new Date(repo.updated_at).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Propiedad 1: Nombre del repositorio
    // Propiedad 2: Descripción
    // Propiedad 3: Estrellas
    // Propiedad 4: Lenguaje de programación
    // Propiedad 5: Forks
    // Propiedad 6: Fecha de actualización
    return `
      <div class="repo-card">
        <div class="repo-card-header">
          <div class="repo-avatar">
            <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" />
          </div>
          <div class="repo-owner-info">
            <span class="repo-owner">${repo.owner.login}</span>
            <span class="repo-visibility">${repo.visibility || "public"}</span>
          </div>
        </div>
        <div class="repo-card-body">
          <h4 class="repo-nombre">
            <i class="fas fa-code-branch"></i>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
          </h4>
          <p class="repo-descripcion">
            ${repo.description || "<em>Sin descripción disponible</em>"}
          </p>
          <div class="repo-stats">
            <span class="repo-stat" title="Estrellas">
              <i class="fas fa-star"></i> ${repo.stargazers_count.toLocaleString()}
            </span>
            <span class="repo-stat" title="Forks">
              <i class="fas fa-code-fork"></i> ${repo.forks_count.toLocaleString()}
            </span>
            <span class="repo-stat" title="Issues abiertos">
              <i class="fas fa-circle-dot"></i> ${repo.open_issues_count.toLocaleString()}
            </span>
          </div>
        </div>
        <div class="repo-card-footer">
          ${repo.language ? `<span class="repo-lenguaje"><i class="fas fa-circle"></i> ${repo.language}</span>` : ""}
          <span class="repo-fecha">
            <i class="fas fa-clock"></i> ${fechaActualizacion}
          </span>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-btn">
            Ver Repo <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    `;
  });

  // Inyectar el HTML generado en el contenedor del DOM
  contenedor.innerHTML = htmlCards.join("");
}

// ============================================
//   FUNCIONES AUXILIARES
// ============================================

function mostrarCargando(contenedor) {
  contenedor.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Buscando repositorios...</p>
    </div>
  `;
}

function mostrarError(contenedor, mensaje) {
  contenedor.innerHTML = `
    <div class="error-container">
      <i class="fas fa-triangle-exclamation"></i>
      <h4>Ocurrió un error</h4>
      <p>${mensaje}</p>
      <p class="error-hint">Verifica tu conexión a internet e inténtalo nuevamente.</p>
    </div>
  `;
}
