# ⚡ ElectroPitonisa · Tarot Digital & Cósmico con Sandra 🔮

Web moderna, mística y profesional de tarot online para Sandra, lista para ser alojada de forma 100% gratuita en **GitHub Pages** y con base de datos en la nube mediante **Supabase** (o en modo local/demo inmediato).

---

## 🌟 Características de la Web

1. **Página Principal (`index.html`)**:
   - **Hero con retrato de Sandra** en estética *Cyber-Mystic* y arcanos dorados.
   - **La Tirada de la Semana**: Sección destacada con la fotografía de la tirada colectiva ampliable con zoom + reproductor embebido de YouTube de Sandra analizando las cartas de la semana.
   - **Tarifas & Selección de Tiradas**: Lista de precios interactiva (Tirada Exprés 15€, Cruz Celta 35€, Gran Oráculo 60€, S.O.S. Mercurio Retrógrado 25€). Al hacer clic en un plan, se selecciona automáticamente en el formulario.
   - **Formulario de Reserva**: Permite a las clientas solicitar fecha, modalidad (vídeo grabado, videollamada o WhatsApp) y formular su pregunta.
   - **Sobre Sandra**: Galería con fotografías reales de Sandra (`s1.jpg`, `s2.jpg`, `s3.jpg`) y su filosofía intuitiva, cálida y sin dramatismos.

2. **Portal Privado de Clientas (`clientas.html`)**:
   - Cada clienta accede introduciendo su email.
   - Historial cronológico de sus tiradas personalizadas.
   - Cada tirada incluye la **fotografía en alta resolución de sus cartas** (con visor lightbox) + el **vídeo privado de YouTube** donde Sandra le lee la tirada + el mensaje escrito de orientación.

3. **Panel de Gestión de Sandra (`admin.html`)**:
   - Acceso con PIN de seguridad (por defecto: `sandra777`, modificable).
   - **Pestaña 1 - Cambiar la Tirada de la Semana**: Sandra puede cambiar en cualquier momento el enlace al vídeo de YouTube, la foto de la tirada, el título y el análisis escrito, con vista previa en vivo antes de guardar.
   - **Pestaña 2 - Gestión de Citas**: Ver todas las reservas recibidas con nombre, email, teléfono, tipo de servicio, fecha y consulta. Incluye botón directo para abrir **WhatsApp** con la clienta y selector para marcar el estado (Pendiente / Confirmada / Completada / Cancelada).
   - **Pestaña 3 - Asignar Tirada a Clienta**: Formulario para subir la lectura a una clienta (indicando su email, enlace de YouTube oculto, imagen y notas), la cual aparecerá al instante en su portal privado.

---

## 🚀 Publicación en GitHub Pages (Paso a Paso)

Dado que es una aplicación web estática pura (HTML5, CSS3 y Vanilla JavaScript modular):

1. Sube estos archivos a un repositorio de GitHub (público o privado).
2. En GitHub, entra en tu repositorio y haz clic en **Settings** (Configuración) -> pestaña **Pages**.
3. En **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: Selecciona `main` (o `master`) y carpeta `/ (root)`.
   - Haz clic en **Save**.
4. En 1-2 minutos tendrás tu web disponible en una URL del tipo:  
   `https://tu-usuario.github.io/nombre-del-repo/`

---

## ☁️ Conexión con Supabase (Base de Datos en la Nube)

Si quieres que las reservas y lecturas se sincronicen en la nube desde cualquier dispositivo:

1. Entra en tu panel de [Supabase](https://supabase.com).
2. Ve al menú **SQL Editor** -> **New Query**.
3. Abre el archivo [`supabase_setup.sql`](supabase_setup.sql) de este proyecto, copia todo su contenido, pégalo en el editor y pulsa **Run**. (Creará automáticamente las tablas `weekly_reading`, `bookings` y `client_readings` con sus permisos).
4. Ve a **Project Settings** -> **API** en Supabase y copia:
   - **Project URL**
   - **Project API Anon Key**
5. Abre el archivo [`js/supabase-config.js`](js/supabase-config.js) y pégalas:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://tu-proyecto.supabase.co',
     anonKey: 'tu-clave-anon-aqui'
   };
   ```
6. ¡Listo! La web se sincronizará automáticamente con tu base de datos Supabase.

> 💡 **Nota:** Si aún no has puesto las claves de Supabase, la web funciona inmediatamente al 100% en **Modo Local / Demo Persistente** utilizando el almacenamiento local del navegador, permitiéndote probar la reserva, el cambio de vídeo semanal y el área de clientas desde ya.

---

## 🔒 Credenciales de Acceso

- **Panel de Sandra**: [admin.html](admin.html) -> PIN por defecto: `sandra777` (puedes cambiarlo en `js/supabase-config.js`).
- **Cuenta de Clienta de Ejemplo**: [clientas.html](clientas.html) -> Email: `clienta@test.com` (o pulsa el botón *"Probar como Clienta Demo"*).
