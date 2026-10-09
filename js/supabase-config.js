/**
 * 🔮 ElectroPitonisa - Supabase Configuration & Data Bridge
 * 
 * Si tienes cuenta de Supabase, solo introduce tu URL y ANON KEY debajo.
 * Si las dejas vacías, el sistema operará automáticamente en "Modo Local / Demo Persistente"
 * usando LocalStorage para que puedas probar todas las funciones (guardar reservas,
 * cambiar vídeo de la semana y asignar tiradas) inmediatamente en local o en GitHub Pages.
 */

const SUPABASE_CONFIG = {
  url: 'https://iejgydwrypszwacpwotg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllamd5ZHdyeXBzendhY3B3b3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mjc1MTksImV4cCI6MjEwNzEwMzUxOX0.p1CkkTc7xHmrCYh7i7HmwjvBu7Mv3FKJ2HYbppg3Hak'
};

// Contraseña por defecto para el acceso de Sandra al panel de control (puedes cambiarla aquí)
const ADMIN_SECURITY = {
  accessPin: 'sandra777' // Clave sencilla para que Sandra entre a su panel
};

// ==============================================================================
// GESTOR DE DATOS UNIFICADO (Supabase con Fallback Inteligente Local)
// ==============================================================================

class TarotDatabase {
  constructor() {
    this.isSupabaseConfigured = Boolean(
      SUPABASE_CONFIG.url && 
      SUPABASE_CONFIG.anonKey && 
      !SUPABASE_CONFIG.url.includes('TU-PROJECT') &&
      typeof window.supabase !== 'undefined'
    );

    if (this.isSupabaseConfigured) {
      try {
        this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✨ Conectado a Supabase correctamente.');
      } catch (err) {
        console.warn('⚠️ Error al inicializar Supabase, usando almacenamiento local:', err);
        this.isSupabaseConfigured = false;
      }
    } else {
      console.log('🔮 Modo Local / Demo activo (LocalStorage). Puedes sincronizar con Supabase cuando quieras.');
    }

    this._initLocalStorageDefaults();
  }

  // Inicializa datos de muestra si es la primera vez que se abre la web en local
  _initLocalStorageDefaults() {
    if (!localStorage.getItem('ep_weekly_reading')) {
      const defaultWeekly = {
        title: 'El Sol, La Estrella y La Rueda: Renacimiento y Claridad Cósmica',
        description: 'Esta semana las energías del cosmos nos impulsan a cerrar capítulos antiguos con serenidad y dar el paso hacia nuevos proyectos con total confianza. Los Arcanos Mayores anuncian buenas noticias y sincronías mágicas.',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Link de ejemplo
        image_url: 'img/tirada_semana.jpg',
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('ep_weekly_reading', JSON.stringify(defaultWeekly));
    }

    if (!localStorage.getItem('ep_bookings')) {
      const defaultBookings = [
        {
          id: 'demo-1',
          client_name: 'Marta Gómez',
          client_email: 'marta@example.com',
          client_phone: '+34 612 345 678',
          service_type: 'Tirada Profunda Cruz Celta (35€)',
          service_price: '35€',
          preferred_date: '2026-10-15',
          preferred_time: '18:00',
          modality: 'online_video',
          notes: 'Quiero consultar sobre un cambio de trabajo inminente y cómo afectará a mi familia.',
          status: 'pendiente',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'demo-2',
          client_name: 'Laura Soler',
          client_email: 'clienta@test.com',
          client_phone: '+34 699 888 777',
          service_type: 'Tirada Exprés 3 Arcanos (15€)',
          service_price: '15€',
          preferred_date: '2026-10-12',
          preferred_time: '11:30',
          modality: 'grabacion_personalizada',
          notes: 'Consulta sobre un reencuentro con alguien especial.',
          status: 'confirmada',
          created_at: new Date(Date.now() - 86400000 * 4).toISOString()
        }
      ];
      localStorage.setItem('ep_bookings', JSON.stringify(defaultBookings));
    }

    if (!localStorage.getItem('ep_client_readings')) {
      const defaultClientReadings = [
        {
          id: 'reading-1',
          client_email: 'clienta@test.com',
          title: 'Tirada de Orientación Laboral & Nuevos Caminos',
          spread_name: 'Cruz de la Claridad',
          reading_date: '2026-10-02',
          image_url: 'img/tirada_semana.jpg',
          youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          interpretation: 'Hola Laura! En esta tirada El Mago y El Mundo te marcan que tienes todas las herramientas en tus manos para dar ese salto profesional. El bloqueo temporal de El Colgado se disolverá a mediados de mes. ¡Confía en tu intuición cósmica!'
        }
      ];
      localStorage.setItem('ep_client_readings', JSON.stringify(defaultClientReadings));
    }
  }

  // ==================== 1. TIRADA DE LA SEMANA ====================
  async getWeeklyReading() {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('weekly_reading')
          .select('*')
          .eq('id', 1)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Error obteniendo tirada de Supabase:', e);
      }
    }
    return JSON.parse(localStorage.getItem('ep_weekly_reading'));
  }

  async updateWeeklyReading(data) {
    if (this.isSupabaseConfigured) {
      try {
        const { error } = await this.client
          .from('weekly_reading')
          .upsert({ id: 1, ...data, updated_at: new Date().toISOString() });
        if (error) throw error;
      } catch (e) {
        console.error('Error actualizando tirada en Supabase:', e);
      }
    }
    localStorage.setItem('ep_weekly_reading', JSON.stringify({ ...data, updated_at: new Date().toISOString() }));
    return true;
  }

  // ==================== 2. RESERVAS DE CITAS ====================
  async createBooking(booking) {
    const bookingData = {
      ...booking,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b_' + Date.now(),
      status: 'pendiente',
      created_at: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      try {
        const { error } = await this.client.from('bookings').insert([bookingData]);
        if (error) console.warn('Supabase insert booking warning:', error);
      } catch (e) {
        console.error('Error insertando reserva en Supabase:', e);
      }
    }

    const current = JSON.parse(localStorage.getItem('ep_bookings') || '[]');
    current.unshift(bookingData);
    localStorage.setItem('ep_bookings', JSON.stringify(current));
    return bookingData;
  }

  async getBookings() {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.error('Error listando reservas en Supabase:', e);
      }
    }
    return JSON.parse(localStorage.getItem('ep_bookings') || '[]');
  }

  async updateBookingStatus(id, newStatus) {
    if (this.isSupabaseConfigured) {
      try {
        await this.client
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (e) {
        console.error('Error actualizando estado en Supabase:', e);
      }
    }
    const current = JSON.parse(localStorage.getItem('ep_bookings') || '[]');
    const updated = current.map(b => b.id === id ? { ...b, status: newStatus } : b);
    localStorage.setItem('ep_bookings', JSON.stringify(updated));
    return true;
  }

  // ==================== 3. TIRADAS PERSONALIZADAS CLIENTAS ====================
  async getClientReadings(email) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('client_readings')
          .select('*')
          .ilike('client_email', normalizedEmail)
          .order('reading_date', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.error('Error obteniendo tiradas de clienta en Supabase:', e);
      }
    }
    const all = JSON.parse(localStorage.getItem('ep_client_readings') || '[]');
    return all.filter(r => (r.client_email || '').trim().toLowerCase() === normalizedEmail);
  }

  async addClientReading(reading) {
    const readingData = {
      ...reading,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'r_' + Date.now(),
      created_at: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      try {
        const { error } = await this.client.from('client_readings').insert([readingData]);
        if (error) console.warn('Supabase add reading warning:', error);
      } catch (e) {
        console.error('Error agregando lectura en Supabase:', e);
      }
    }

    const current = JSON.parse(localStorage.getItem('ep_client_readings') || '[]');
    current.unshift(readingData);
    localStorage.setItem('ep_client_readings', JSON.stringify(current));
    return readingData;
  }

  async getAllClientReadings() {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('client_readings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.error('Error obteniendo todas las lecturas de Supabase:', e);
      }
    }
    return JSON.parse(localStorage.getItem('ep_client_readings') || '[]');
  }
}

// Helper para extraer ID de vídeo de YouTube y devolver el iframe embed seguro
function getYoutubeEmbedUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  // Si ya es un embed
  if (trimmed.includes('youtube.com/embed/')) {
    const id = trimmed.split('embed/')[1].split(/[?&]/)[0];
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  // Formato standard watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;

  // Formato acortado youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}`;

  // Formato shorts
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;

  // Si se pasa solo el ID de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}`;
  }

  return trimmed;
}

// Instancia global disponible en toda la aplicación
window.tarotDB = new TarotDatabase();
window.getYoutubeEmbedUrl = getYoutubeEmbedUrl;
window.ADMIN_SECURITY = ADMIN_SECURITY;
