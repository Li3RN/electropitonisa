/**
 * 🔮 ElectroPitonisa - Panel de Control de Sandra
 * Permite actualizar la tirada semanal, gestionar reservas y asignar tiradas a clientas
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
});

function initAdminAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const authSection = document.getElementById('adminAuthSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Comprobar sesión
  if (sessionStorage.getItem('ep_admin_auth') === 'true') {
    showAdminDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('adminPin').value.trim();
      const expectedPin = window.ADMIN_SECURITY.accessPin;

      if (pin === expectedPin) {
        sessionStorage.setItem('ep_admin_auth', 'true');
        showAdminDashboard();
      } else {
        alert('❌ Clave incorrecta. Pista: por defecto es sandra777');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('ep_admin_auth');
      dashboardSection.style.display = 'none';
      authSection.style.display = 'block';
    });
  }

  function showAdminDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    initAdminTabs();
    loadWeeklyEditor();
    loadBookings();
    loadAssignedReadings();
  }
}

// ==============================================================================
// GESTIÓN DE PESTAÑAS (TABS)
// ==============================================================================
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const sections = document.querySelectorAll('.admin-panel-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add('active');
    });
  });
}

// ==============================================================================
// 1. EDITOR DE LA TIRADA DE LA SEMANA
// ==============================================================================
async function loadWeeklyEditor() {
  try {
    const reading = await window.tarotDB.getWeeklyReading();
    if (!reading) return;

    const titleInput = document.getElementById('adminWeeklyTitle');
    const descInput = document.getElementById('adminWeeklyDesc');
    const videoInput = document.getElementById('adminWeeklyVideo');
    const photoInput = document.getElementById('adminWeeklyPhoto');

    if (titleInput) titleInput.value = reading.title || '';
    if (descInput) descInput.value = reading.description || '';
    if (videoInput) videoInput.value = reading.youtube_url || '';
    if (photoInput) photoInput.value = reading.image_url || '';

    updateWeeklyPreview();

    // Eventos para actualizar la vista previa en vivo
    [videoInput, photoInput].forEach(inp => {
      if (inp) inp.addEventListener('input', updateWeeklyPreview);
    });

    const form = document.getElementById('weeklyReadingForm');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '⚡ Guardando cambios...';

        const updatedData = {
          title: titleInput.value.trim(),
          description: descInput.value.trim(),
          youtube_url: videoInput.value.trim(),
          image_url: photoInput.value.trim()
        };

        await window.tarotDB.updateWeeklyReading(updatedData);
        alert('✨ ¡Tirada de la semana actualizada con éxito!');
        submitBtn.innerHTML = '🔮 Guardar y Publicar en la Web';
      };
    }
  } catch (err) {
    console.error('Error al cargar editor semanal:', err);
  }
}

function updateWeeklyPreview() {
  const videoInput = document.getElementById('adminWeeklyVideo');
  const photoInput = document.getElementById('adminWeeklyPhoto');
  const previewIframe = document.getElementById('adminPreviewIframe');
  const previewImg = document.getElementById('adminPreviewImg');

  if (videoInput && previewIframe) {
    previewIframe.src = window.getYoutubeEmbedUrl(videoInput.value);
  }
  if (photoInput && previewImg) {
    previewImg.src = photoInput.value || 'img/tirada_semana.jpg';
  }
}

// ==============================================================================
// 2. GESTIÓN DE RESERVAS DE CITAS
// ==============================================================================
async function loadBookings(filter = 'todos') {
  const tbody = document.getElementById('bookingsTableBody');
  const countBadge = document.getElementById('pendingCountBadge');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando reservas...</td></tr>';

  try {
    const bookings = await window.tarotDB.getBookings();
    
    // Contar pendientes
    const pendingCount = bookings.filter(b => b.status === 'pendiente').length;
    if (countBadge) countBadge.textContent = `${pendingCount} pendientes`;

    // Filtrar
    const filtered = filter === 'todos' 
      ? bookings 
      : bookings.filter(b => b.status === filter);

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px;">No hay reservas para este filtro.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    filtered.forEach(b => {
      const tr = document.createElement('tr');
      
      const cleanPhone = (b.client_phone || '').replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(b.client_name)},%20te%20contacto%20desde%20ElectroPitonisa%20para%20tu%20lectura%20de%20tarot.` : '';

      const dateStr = b.preferred_date ? new Date(b.preferred_date).toLocaleDateString('es-ES') : 'Sin fecha';

      tr.innerHTML = `
        <td><strong>${escapeHTML(b.client_name)}</strong></td>
        <td>
          <a href="mailto:${escapeHTML(b.client_email)}" style="color:var(--cyan-neon); text-decoration:none;">${escapeHTML(b.client_email)}</a>
          ${waLink ? `<br><a href="${waLink}" target="_blank" style="color:#22c55e; font-size:0.8rem; font-weight:600;">💬 Abrir WhatsApp</a>` : ''}
        </td>
        <td><span style="font-size:0.85rem; color:var(--gold-light);">${escapeHTML(b.service_type || 'Tirada')}</span></td>
        <td>📅 ${dateStr}</td>
        <td style="max-width:200px; font-size:0.82rem; color:var(--text-dim);">${escapeHTML(b.notes || 'Sin notas adicionales')}</td>
        <td>
          <span class="status-badge ${b.status}">${b.status}</span>
        </td>
        <td>
          <select class="form-control" style="padding:4px 8px; font-size:0.8rem;" onchange="changeStatus('${b.id}', this.value)">
            <option value="pendiente" ${b.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="confirmada" ${b.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
            <option value="completada" ${b.status === 'completada' ? 'selected' : ''}>Completada</option>
            <option value="cancelada" ${b.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error al cargar reservas:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Error al cargar las reservas.</td></tr>';
  }
}

// Función global para cambiar estado desde el select
window.changeStatus = async function(id, newStatus) {
  await window.tarotDB.updateBookingStatus(id, newStatus);
  loadBookings();
};

// Filtros de reservas
window.filterBookings = function(status) {
  loadBookings(status);
};

// ==============================================================================
// 3. ASIGNAR TIRADA PERSONALIZADA A CLIENTA
// ==============================================================================
async function loadAssignedReadings() {
  const form = document.getElementById('assignReadingForm');
  const listContainer = document.getElementById('assignedReadingsList');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '⚡ Publicando lectura...';

      const readingData = {
        client_email: document.getElementById('assignClientEmail').value.trim(),
        title: document.getElementById('assignTitle').value.trim(),
        spread_name: document.getElementById('assignSpread').value.trim(),
        reading_date: document.getElementById('assignDate').value || new Date().toISOString().split('T')[0],
        youtube_url: document.getElementById('assignVideoUrl').value.trim(),
        image_url: document.getElementById('assignImageUrl').value.trim() || 'img/tirada_semana.jpg',
        interpretation: document.getElementById('assignNotes').value.trim()
      };

      await window.tarotDB.addClientReading(readingData);
      alert(`✨ ¡Tirada asignada correctamente a ${readingData.client_email}! Ya puede verla en su área personal.`);
      form.reset();
      submitBtn.innerHTML = '🔮 Asignar y Publicar en su Rincón Privado';
      renderReadingsList();
    };
  }

  async function renderReadingsList() {
    if (!listContainer) return;
    const all = await window.tarotDB.getAllClientReadings();

    if (all.length === 0) {
      listContainer.innerHTML = '<p style="color:var(--text-dim); text-align:center;">No hay tiradas personalizadas registradas aún.</p>';
      return;
    }

    listContainer.innerHTML = '';
    all.forEach(item => {
      const div = document.createElement('div');
      div.style.cssText = 'background:rgba(15,7,30,0.6); padding:16px; border-radius:12px; border:1px solid var(--border-mystic); margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;';
      div.innerHTML = `
        <div>
          <strong style="color:var(--gold-primary);">${escapeHTML(item.title)}</strong> 
          <span style="font-size:0.8rem; color:var(--text-dim);">para ${escapeHTML(item.client_email)}</span>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">📅 ${item.reading_date} · 🎥 ${escapeHTML(item.youtube_url)}</div>
        </div>
        <a href="${escapeHTML(item.youtube_url)}" target="_blank" class="nav-btn" style="font-size:0.8rem;">Ver Vídeo ↗</a>
      `;
      listContainer.appendChild(div);
    });
  }

  renderReadingsList();
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
