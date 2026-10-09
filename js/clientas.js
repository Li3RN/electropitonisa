/**
 * 🔮 ElectroPitonisa - Portal Privado de Clientas
 * Permite a las clientas ver su historial de tiradas con vídeo y foto
 */

document.addEventListener('DOMContentLoaded', () => {
  initClientAuth();
  initLightbox();
});

function initClientAuth() {
  const loginForm = document.getElementById('clientLoginForm');
  const authSection = document.getElementById('clientAuthSection');
  const dashboardSection = document.getElementById('clientDashboardSection');
  const clientEmailDisplay = document.getElementById('clientEmailDisplay');
  const logoutBtn = document.getElementById('clientLogoutBtn');
  const demoClientBtn = document.getElementById('demoClientBtn');

  // Comprobar si ya había sesión iniciada
  const savedEmail = sessionStorage.getItem('ep_current_client');
  if (savedEmail) {
    showDashboard(savedEmail);
  }

  // Submit formulario login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('clientLoginEmail');
      const email = emailInput.value.trim();
      if (!email) return;

      sessionStorage.setItem('ep_current_client', email);
      showDashboard(email);
    });
  }

  // Botón Demo Rápido
  if (demoClientBtn) {
    demoClientBtn.addEventListener('click', () => {
      const demoEmail = 'clienta@test.com';
      sessionStorage.setItem('ep_current_client', demoEmail);
      showDashboard(demoEmail);
    });
  }

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('ep_current_client');
      dashboardSection.style.display = 'none';
      authSection.style.display = 'block';
    });
  }

  async function showDashboard(email) {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    if (clientEmailDisplay) clientEmailDisplay.textContent = email;

    await loadClientReadings(email);
  }
}

async function loadClientReadings(email) {
  const listContainer = document.getElementById('clientReadingsList');
  const emptyState = document.getElementById('clientEmptyState');
  if (!listContainer) return;

  listContainer.innerHTML = '<p style="text-align:center; color: var(--gold-light);">🔮 Conectando con tus archivos cósmicos...</p>';

  try {
    const readings = await window.tarotDB.getClientReadings(email);

    if (!readings || readings.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    listContainer.innerHTML = '';

    readings.forEach(reading => {
      const card = document.createElement('div');
      card.className = 'reading-card';

      const embedUrl = window.getYoutubeEmbedUrl(reading.youtube_url);
      const dateFormatted = reading.reading_date 
        ? new Date(reading.reading_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Fecha reciente';

      card.innerHTML = `
        <div class="reading-card-info">
          <div>
            <h3 class="reading-card-title">${escapeHTML(reading.title || 'Tirada Personalizada')}</h3>
            <span style="font-size: 0.82rem; color: var(--purple-primary); font-weight:600;">✦ ${escapeHTML(reading.spread_name || 'Lectura de Tarot')}</span>
          </div>
          <span class="reading-card-date">📅 ${dateFormatted}</span>
        </div>

        <!-- Foto de las Cartas -->
        <div class="weekly-photo-box">
          <label style="font-size:0.85rem; color:var(--gold-light); font-weight:600; margin-bottom:6px; display:block;">
            🃏 Fotografía de tu tirada
          </label>
          <div class="photo-preview-wrap">
            <img src="${escapeHTML(reading.image_url || 'img/tirada_semana.jpg')}" alt="Cartas de tu tirada" class="zoomable-tarot">
            <span class="photo-zoom-hint">🔍 Clic para ampliar cartas</span>
          </div>
        </div>

        <!-- Vídeo de YouTube Embebido -->
        <div class="weekly-video-box">
          <label style="font-size:0.85rem; color:var(--cyan-neon); font-weight:600; margin-bottom:6px; display:block;">
            🎥 Tu lectura personalizada en vídeo con Sandra
          </label>
          <div class="video-container">
            <iframe 
              src="${embedUrl}" 
              title="Tu vídeo de tarot personalizado" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          </div>
        </div>

        <!-- Interpretación y Mensaje de Sandra -->
        <div class="reading-interpretation">
          <div style="font-weight: 700; color: var(--gold-light); margin-bottom: 8px; font-size: 0.92rem;">
            💌 Mensaje de Sandra para ti:
          </div>
          <p>${escapeHTML(reading.interpretation || 'Sandra ha preparado esta lectura con toda su energía cósmica para guiarte.')}</p>
        </div>
      `;

      listContainer.appendChild(card);
    });

    // Re-activar zoom de fotos añadidas dinámicamente
    initDynamicLightbox();

  } catch (err) {
    console.error('Error cargando tiradas de clienta:', err);
    listContainer.innerHTML = '<p style="color:#ef4444; text-align:center;">Error al recuperar tus lecturas. Por favor, reintenta más tarde.</p>';
  }
}

// Lightbox
function initLightbox() {
  const modal = document.getElementById('imageLightbox');
  const closeBtn = document.getElementById('lightboxClose');
  if (!modal) return;

  const closeModal = () => modal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function initDynamicLightbox() {
  const modal = document.getElementById('imageLightbox');
  const modalImg = document.getElementById('lightboxImg');
  if (!modal || !modalImg) return;

  document.querySelectorAll('.zoomable-tarot').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.onclick = () => {
      modalImg.src = img.src;
      modal.classList.add('active');
    };
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
