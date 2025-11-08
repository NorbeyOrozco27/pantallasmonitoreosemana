// Variables globales
let intervaloContador, datosCompletosDelDia = [], activeToasts = {};
let ultimaActualizacionClima = 0;

// Variables globales para GIFs
let gifRotationInterval = null;
let currentGifIndex = 0;
let activeGifs = [];

const vehiculosMap = {
  101: "Buseta", 9: "Vans", 6: "Vans", 102: "Bus", 103: "Bus", 104: "Bus", 105: "Buseta",
  106: "Buseta", 107: "Bus", 108: "Bus", 109: "Bus", 110: "Bus",
  111: "Buseta", 112: "Bus", 113: "Bus", 114: "Bus", 115: "Bus",
  116: "Bus", 117: "Buseta", 118: "Bus", 119: "Bus", 120: "Bus",
  121: "Buseta", 122: "Bus", 123: "Bus", 124: "Buseta", 125: "Bus",
  126: "Bus", 127: "Bus", 128: "Buseta", 129: "Bus", 130: "Bus",
  131: "Bus", 132: "Bus", 133: "Buseta", 134: "Buseta", 135: "Bus",
  136: "Bus", 137: "Bus", 138: "Buseta", 139: "Bus", 140: "Buseta",
  141: "Buseta", 142: "Buseta", 143: "Buseta", 144: "Bus", 145: "Bus",
  146: "Bus", 147: "Bus", 148: "Buseta", 149: "Buseta", 150: "Buseta",
  151: "Microbus", 152: "Microbus", 153: "Microbus", 154: "Microbus", 155: "Microbus",
  156: "Microbus", 157: "Buseta", 158: "Microbus", 159: "Microbus", 160: "Microbus",
  161: "Microbus", 162: "Microbus", 163: "Microbus", 164: "Microbus", 165: "Microbus",
  166: "Microbus", 167: "Microbus", 168: "Microbus", 169: "Buseta", 170: "Microbus",
  171: "Bus", 172: "Microbus", 173: "Bus", 174: "Bus", 175: "Bus",
  176: "Bus", 177: "Buseta", 178: "Microbus", 179: "Microbus", 180: "Microbus",
  181: "Microbus", 182: "Microbus", 183: "Microbus", 184: "Buseta", 185: "Microbus",
  186: "Microbus", 187: "Microbus", 188: "Microbus", 189: "Microbus", 190: "Microbus",
  191: "Microbus", 192: "Microbus", 193: "Microbus", 194: "Microbus", 195: "Microbus",
  196: "Microbus", 197: "Bus", 198: "Microbus", 2: "Vans", 3: "Vans", 4: "Vans"
}; 

// === Mapeo clima por origen ===
const CLIMA_MAPPINGS = {
  "Medellín": ["La Ceja", "La Unión", "Abejorral"],
  "La Ceja": ["La Unión", "Medellín", "Abejorral"],
  "Rionegro": ["La Ceja", "La Unión"],
  "Abejorral": ["Medellín", "La Unión", "La Ceja", "Abejorral"]
};

// === Funciones para GIFs contextuales ===
function normalizarNombreDestino(destino) {
  return destino
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina tildes
    .replace(/\s+/g, '_'); // Reemplaza espacios por _
}

function actualizarGifsContextuales(turnosCriticos) {
  const gifsContainer = document.getElementById('gifs-contextuales');
  const gifsInner = document.getElementById('gifs-inner');
  
  // Limpiar contenedor y detener intervalo anterior
  gifsInner.innerHTML = '';
  if (gifRotationInterval) {
    clearInterval(gifRotationInterval);
    gifRotationInterval = null;
  }
  
  // Ocultar si no hay turnos críticos
  if (turnosCriticos.length === 0) {
    gifsContainer.style.display = 'none';
    activeGifs = [];
    return;
  }
  
  // Obtener destinos ÚNICOS de los primeros 3 turnos críticos
  const destinosUnicos = [];
  const destinosVistos = new Set();
  
  turnosCriticos.slice(0, 3).forEach(t => {
    const destino = t.Horarios.destino;
    if (!destinosVistos.has(destino)) {
      destinosVistos.add(destino);
      destinosUnicos.push(destino);
    }
  });
  
  // Cargar GIFs
  activeGifs = [];
  destinosUnicos.forEach((destino, index) => {
    const nombreNormalizado = normalizarNombreDestino(destino);
    const gifItem = document.createElement('img');
    gifItem.className = 'gif-item';
    gifItem.src = `assets/gifs/${nombreNormalizado}.gif`;
    gifItem.alt = `Destino: ${destino}`;
    gifItem.onerror = function() {
      // Si el GIF no existe, ocultar este elemento
      this.style.display = 'none';
    };
    gifsInner.appendChild(gifItem);
    activeGifs.push(gifItem);
  });
  
  // Mostrar contenedor y comenzar rotación si hay GIFs
  if (activeGifs.length > 0) {
    gifsContainer.style.display = 'block';
    currentGifIndex = 0;
    activeGifs[0].classList.add('active');
    
    // Iniciar rotación si hay más de un GIF
    if (activeGifs.length > 1) {
      gifRotationInterval = setInterval(rotarGifs, 4000);
    }
  }
}

function rotarGifs() {
  if (activeGifs.length <= 1) return;
  
  // Ocultar GIF actual
  activeGifs[currentGifIndex].classList.remove('active');
  
  // Calcular siguiente índice
  currentGifIndex = (currentGifIndex + 1) % activeGifs.length;
  
  // Mostrar siguiente GIF
  activeGifs[currentGifIndex].classList.add('active');
}

// === Cargar clima - VERSIÓN MEJORADA ===
async function cargarClimaContextual(origen) {
  const ahora = Date.now();
  
  // Verificar si pasaron 10 minutos desde la última actualización
  if (ahora - ultimaActualizacionClima < 10 * 60 * 1000 && ultimaActualizacionClima !== 0) {
    return;
  }

  const cont = document.getElementById('clima-contextual');
  if (!cont) return;

  // Ocultar clima si no hay origen seleccionado o no está en el mapeo
  if (!origen || !CLIMA_MAPPINGS[origen]) {
    cont.style.display = 'none';
    return;
  }

  // API Key - REEMPLAZA CON TU KEY VÁLIDA
  const API_KEY = 'TU_API_KEY_AQUI'; 
  
  // Verificar si la API Key es válida
  if (!API_KEY || API_KEY === 'TU_API_KEY_AQUI') {
    console.warn("API Key del clima no configurada correctamente");
    cont.style.display = 'none';
    return;
  }

  const ciudades = CLIMA_MAPPINGS[origen];
  const promesas = ciudades.map(ciudad => {
    // Codificar el nombre de la ciudad para la URL
    const ciudadCodificada = encodeURIComponent(ciudad + ', Antioquia, Colombia');
    return fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${ciudadCodificada}&lang=es`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.warn(`Error al obtener clima para ${ciudad}:`, error);
        return null;
      });
  });

  try {
    const resultados = await Promise.all(promesas);
    const datosValidos = resultados.filter(r => r && r.current && !r.error);
    
    if (datosValidos.length === 0) {
      cont.style.display = 'none';
      return;
    }

    const html = datosValidos.map(r => {
      const c = r.current;
      const temp = Math.round(c.temp_c);
      const lluvia = c.precip_mm > 0 ? `🌧️ ${c.precip_mm} mm/h` : '☀️ Sin lluvia';
      const humedad = `💧 ${c.humidity}%`;
      return `${r.location.name}: ${temp}°C • ${lluvia} • ${humedad}`;
    }).join('<br>');
    
    cont.innerHTML = html;
    cont.style.display = 'block';
    ultimaActualizacionClima = ahora;
    
  } catch (error) {
    console.error("Error general al cargar el clima:", error);
    cont.style.display = 'none';
  }
}

// === Reloj digital ===
function iniciarRelojDigital() {
  const reloj = document.getElementById('reloj-digital');
  if (!reloj) return;
  function actualizar() {
    const ahora = new Date();
    reloj.textContent = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;
  }
  actualizar();
  setInterval(actualizar, 1000);
}

// === Iconos de reloj ===
function getIconoReloj(hora) {
  const iconos = {
    0:'🕛',1:'🕐',2:'🕑',3:'🕒',4:'🕓',5:'🕔',6:'🕕',7:'🕖',8:'🕗',
    9:'🕘',10:'🕙',11:'🕚',12:'🕛',13:'🕐',14:'🕑',15:'🕒',16:'🕓',
    17:'🕔',18:'🕕',19:'🕖',20:'🕗',21:'🕘',22:'🕙',23:'🕚'
  };
  return iconos[hora] || '🕒';
}

// === Círculos de color por minuto ===
function getColorPorMinuto(minuto) {
  const m = minuto % 60;
  if (m < 10) return '🔵';
  if (m < 20) return '🟢';
  if (m < 30) return '🟡';
  if (m < 40) return '🟠';
  if (m < 50) return '🟣';
  return '🔴';
}

// === Inicialización ===
document.addEventListener("DOMContentLoaded", function() {
  iniciarRelojDigital();
  cargarMonitorSalidas();
  setInterval(cargarMonitorSalidas, 60000);
  
  const filtroOrigen = document.getElementById('filtro-origen');
  filtroOrigen.addEventListener('change', () => {
    actualizarTablaProximos();
    // Forzar actualización del clima al cambiar filtro
    ultimaActualizacionClima = 0;
    cargarClimaContextual(filtroOrigen.value);
  });
});

// === Cargar datos ===
function cargarMonitorSalidas() {
  obtenerRodamientoDelDia()
    .then(datos => {
      datosCompletosDelDia = datos;
      if (intervaloContador) clearInterval(intervaloContador);
      llenarFiltroOrigen();
      document.getElementById('proximos-content').style.display = 'block';
      document.getElementById('proximos-loader').style.display = 'none';
      intervaloContador = setInterval(actualizarTablaProximos, 1000);
      
      // Cargar clima con el filtro actual
      const filtroActual = document.getElementById('filtro-origen').value;
      cargarClimaContextual(filtroActual);
    })
    .catch(err => {
      console.error(err);
      showToast('Error', 'No se pudieron cargar los turnos.', 'warning');
    });
}

function llenarFiltroOrigen() {
  const select = document.getElementById('filtro-origen');
  const valorActual = select.value;
  const origenes = [...new Set(datosCompletosDelDia.filter(d => d.Horarios?.origen).map(d => d.Horarios.origen))].sort();
  select.innerHTML = '<option value="">Todos los orígenes</option>';
  origenes.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    select.appendChild(opt);
  });
  if (valorActual && origenes.includes(valorActual)) select.value = valorActual;
}

async function obtenerRodamientoDelDia() {
  const fecha = new Date().toISOString().slice(0, 10);
  // Incluye 'via'
  const url = `${SUPABASE_CONFIG.url}/rest/v1/operacion_diaria?select=id,Vehículos(numero_interno),Horarios!inner(hora,origen,destino,via)&fecha=eq.${fecha}`;
  const res = await fetch(url, {
    headers: { 'apikey': SUPABASE_CONFIG.key, 'Authorization': `Bearer ${SUPABASE_CONFIG.key}` }
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return await res.json();
}

function actualizarTablaProximos() {
  const ahoraSeg = new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds();
  const filtro = document.getElementById('filtro-origen').value;

  const turnos = datosCompletosDelDia
    .filter(d => d.Horarios?.hora)
    .map(d => ({ ...d, segundos: (() => { const [h, m] = d.Horarios.hora.split(':'); return +h * 3600 + +m * 60; })() }))
    .filter(d => d.segundos >= ahoraSeg && (!filtro || d.Horarios.origen === filtro))
    .sort((a, b) => a.segundos - b.segundos);

  const tbody = document.querySelector("#tabla-proximos tbody");
  tbody.innerHTML = '';

  // Detectar turnos críticos (≤ 2 minutos)
  const turnosCriticos = turnos.filter(t => (t.segundos - ahoraSeg) / 60 <= 2);
  
  // Actualizar GIFs contextuales
  actualizarGifsContextuales(turnosCriticos);

  // MOSTRAR TODOS LOS TURNOS - SIN LÍMITE
  turnos.forEach(t => {
    const diffSeg = t.segundos - ahoraSeg;
    const minRest = diffSeg / 60;
    const porc = Math.max(0, Math.min(100, (minRest / 60) * 100));

    let colorBarra = "#69db7c";
    if (minRest <= 2) colorBarra = "#8ce99a";
    else if (minRest <= 5) colorBarra = "#f77c08ff";
    else if (minRest <= 10) colorBarra = "#fab005";
    else if (minRest <= 20) colorBarra = "#ffd43b";
    else if (minRest <= 30) colorBarra = "#38d9a9";

    const esCritico = minRest <= 2;
    const viaRaw = t.Horarios.via;
    const via = viaRaw && viaRaw.trim().toLowerCase() !== "principal" ? viaRaw : "";
    const tipo = vehiculosMap[t.Vehículos.numero_interno] || "Desconocido";
    let icono = "🚌";
    if (tipo === "Buseta") icono = "🚐";
    else if (tipo === "Microbus") icono = "🚍";
    else if (tipo === "Vans") icono = "🚙";

    const [h, m] = t.Horarios.hora.split(':');
    const iconoHora = getIconoReloj(parseInt(h));
    const colorMinuto = getColorPorMinuto(parseInt(m));

    tbody.innerHTML += `
      <tr class="${esCritico ? 'fila-parpadeante' : ''}">
        <td>${iconoHora} ${t.Horarios.hora} <span style="margin-left: 6px;">${colorMinuto}</span></td>
        <td>${icono} ${t.Vehículos.numero_interno} (${tipo})</td>
        <td>${t.Horarios.origen} → ${t.Horarios.destino}</td>
        <td>${via}</td>
        <td class="tiempo-cell">
          <div class="barra-progreso-container">
            <div class="barra-progreso" style="width: ${porc}%; background-color: ${colorBarra};${esCritico ? ' animation: brillo-lateral 1s ease-in-out infinite;' : ''}"></div>
          </div>
          <span class="etiqueta-tiempo">${Math.round(minRest)} min</span>
        </td>
      </tr>`;
  });

  // Ocultar clima si hay turno crítico
  const hayCritico = turnos.some(t => (t.segundos - ahoraSeg) / 60 <= 2);
  document.getElementById('clima-contextual').style.display = hayCritico ? 'none' : 'block';
}

// === Toasts ===
function showToast(title, msg, type = 'info') {
  const id = 'toast-' + Date.now();
  const cont = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.id = id;
  toast.innerHTML = `<i class="fa-solid ${type === 'warning' ? 'fa-triangle-exclamation' : 'fa-bell'}"></i><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${msg}</div></div>`;
  cont.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
  }, 5000);
}