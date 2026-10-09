/**
 * 🔮 ElectroPitonisa - Lógica de la Página Principal (Index)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Cargar y mostrar la Tirada de la Semana
  await loadWeeklyReading();

  // 2. Inicializar eventos de interacción (precios, reserva, lightbox, menú móvil)
  initPricingSelector();
  initBookingForm();
  initLightbox();
  initMobileMenu();
});

// ==============================================================================
// 1. CARGA DE LA TIRADA DE LA SEMANA
// ==============================================================================
async function loadWeeklyReading() {
  const weeklyContainer = document.getElementById('weeklyReadingContainer');
  if (!weeklyContainer) return;

  try {
    const reading = await window.tarotDB.getWeeklyReading();
    if (!reading) return;

    // Actualizar Título y Descripción
    const titleEl = document.getElementById('weeklyTitle');
    const descEl = document.getElementById('weeklyDescription');
    const dateEl = document.getElementById('weeklyDate');
    const photoEl = document.getElementById('weeklyPhoto');
    const videoIframe = document.getElementById('weeklyVideoIframe');

    if (titleEl) titleEl.textContent = reading.title;
    if (descEl) descEl.textContent = reading.description;

    if (dateEl && reading.updated_at) {
      const d = new Date(reading.updated_at);
      dateEl.textContent = `Actualizado: ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }

    if (photoEl && reading.image_url) {
      photoEl.src = reading.image_url;
      photoEl.alt = reading.title;
    }

    if (videoIframe && reading.youtube_url) {
      const embedUrl = window.getYoutubeEmbedUrl(reading.youtube_url);
      videoIframe.src = embedUrl;
    }
  } catch (err) {
    console.error('Error al cargar la tirada de la semana:', err);
  }
}

// ==============================================================================
// 2. SELECCIÓN DINÁMICA DE TARIFAS
// ==============================================================================
function initPricingSelector() {
  const cards = document.querySelectorAll('.pricing-card');
  const serviceSelect = document.getElementById('bookingService');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Quitar clase selected de todas
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const serviceName = card.getAttribute('data-service');
      if (serviceSelect && serviceName) {
        serviceSelect.value = serviceName;
      }

      // Scroll suave hacia el formulario de reserva
      const formEl = document.getElementById('reserva');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ==============================================================================
// 3. ENVÍO DE RESERVAS DE CITAS
// ==============================================================================
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⚡ Alineando astros...';
    submitBtn.disabled = true;

    const bookingData = {
      client_name: document.getElementById('clientName').value.trim(),
      client_email: document.getElementById('clientEmail').value.trim(),
      client_phone: document.getElementById('clientPhone').value.trim(),
      service_type: document.getElementById('bookingService').value,
      preferred_date: document.getElementById('bookingDate').value,
      preferred_time: document.getElementById('bookingTime').value,
      modality: document.getElementById('bookingModality').value,
      notes: document.getElementById('bookingNotes').value.trim()
    };

    try {
      await window.tarotDB.createBooking(bookingData);
      showTarotToast('✨ ¡Reserva enviada con éxito! Sandra contactará contigo muy pronto.');
      form.reset();

      // Desplazar feedback
      submitBtn.innerHTML = '🔮 ¡Cita Solicitada con Éxito!';
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 4000);
    } catch (err) {
      console.error('Error al reservar:', err);
      showTarotToast('⚠️ Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ==============================================================================
// 4. LIGHTBOX MODAL PARA VER CARTAS EN GRANDE
// ==============================================================================
function initLightbox() {
  const modal = document.getElementById('imageLightbox');
  const modalImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !modalImg) return;

  // Click en fotos marcadas para zoom
  document.querySelectorAll('.zoomable-tarot').forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modal.classList.add('active');
    });
  });

  const closeModal = () => modal.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ==============================================================================
// 5. MENÚ MÓVIL
// ==============================================================================
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// Toast Notifier
function showTarotToast(message) {
  let toast = document.getElementById('tarotToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'tarotToast';
    toast.className = 'tarot-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
