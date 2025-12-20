// Variables globales
let intervaloContador, datosCompletosDelDia = [], activeToasts = {};
let ultimaActualizacionClima = 0;
let intervaloClima = null;
let climaTimeout = null; // Variable para controlar el timeout de ocultamiento
let lastCriticalTurnoId = null; // Para evitar reproducir el mismo sonido de alerta por segundo
let lastSpokenText = ''; // Para evitar que la voz repita el mismo mensaje en cada ciclo

// Objetos de Audio para diferentes eventos (Asumiendo assets/attention.mp3, assets/special.mp3, assets/bip.mp3)
const attentionSound = new Audio('assets/attention.mp3'); // Para la ventana de 15-11 min
const specialSound = new Audio('assets/special.mp3'); // Para rutas especiales
const criticalSound = new Audio('assets/bip.mp3'); // El sonido más urgente (2 min o menos)

// Array de todos los sonidos para el desbloqueo inicial
const allSounds = [attentionSound, specialSound, criticalSound];
let audioUnlocked = false; // Nueva variable de control


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
  136: "Bus", 137: "Bus", 138: "Bus", 139: "Bus", 140: "Buseta",
  141: "Buseta", 142: "Buseta", 143: "Buseta", 144: "Bus", 145: "Bus",
  146: "Bus", 147: "Bus", 148: "Buseta", 149: "Buseta", 150: "Buseta",
  151: "Microbus", 152: "Microbus", 153: "Microbus", 154: "Microbus", 155: "Microbus",
  156: "Microbus", 157: "Bus", 158: "Microbus", 159: "Microbus", 160: "Microbus",
  161: "Microbus", 162: "Microbus", 163: "Microbus", 164: "Microbus", 165: "Microbus",
  166: "Microbus", 167: "Microbus", 168: "Microbus", 169: "Buseta", 170: "Microbus",
  171: "Bus", 172: "Microbus", 173: "Bus", 174: "Bus", 175: "Bus",
  176: "Bus", 177: "Buseta", 178: "Microbus", 179: "Microbus", 180: "Microbus",
  181: "Microbus", 182: "Microbus", 183: "Microbus", 184: "Buseta", 185: "Microbus",
  186: "Microbus", 187: "Microbus", 188: "Microbus", 189: "Microbus", 190: "Microbus",
  191: "Microbus", 192: "Microbus", 193: "Microbus", 194: "Microbus", 195: "Microbus",
  196: "Microbus", 197: "Bus", 198: "Microbus",1: "Vans", 2: "Vans", 3: "Vans", 4: "Vans", 4: "Vans", 5: "Vans", 7: "Vans", 8: "Vans", 9: "Vans"
};

// ========== HORARIOS ESPECIALES CORREGIDOS - NOMBRES EXACTOS DE LA BD Y AJUSTADOS PARA COINCIDENCIA ==========
const horariosEspeciales = {
    "Medellin Term.Norte": [
        { hora: "05:20", mensaje: "Conexion a Los Municipios de La Ceja y La Union con ruta hacia Abejorral x Mesopotamia" },
        { hora: "05:36", mensaje: "Ruta hacia Abejorral por el Guaico" },
        { hora: "05:48", mensaje: "Ruta hacia La Union" },
        { hora: "06:00", mensaje: "Ruta hacia Abejorral por Colmenas" },
        { hora: "06:15", mensaje: "Ruta por el tunel de oriente, aeropuerto Jose Maria Cordoba, LLanogrande, San Antonio" },
        { hora: "06:20", mensaje: "Ruta Hacia La Union" },
        { hora: "08:00", mensaje: "Ruta Hacia Abejorral por Colmenas" },
        { hora: "09:20", mensaje: "Ruta hacia La Union" },
        { hora: "10:00", mensaje: "Ruta Hacia Abejorral colmenas y Pantanillo" },
        { hora: "11:20", mensaje: "Ruta Hacia la Union" },
        { hora: "12:00", mensaje: "Ruta hacia Abejorral por Colmenas" },
        { hora: "12:20", mensaje: "Conexion a Los Municipios de La Ceja y La Union con ruta hacia Abejorral x Mesopotamia" },
        { hora: "13:00", mensaje: "Ruta Abejorral Por el Guaico" },
        { hora: "13:20", mensaje: "Ruta hacia La Union" },
        { hora: "14:20", mensaje: "Ruta hacia La Union" },
        { hora: "14:40", mensaje: "Ruta hacia Abejorral por Colmenas" },
        { hora: "15:20", mensaje: "Ruta hacia la Union" },
        { hora: "15:40", mensaje: "Ruta hacia Abejorral--Ultima Linea del dia, abordar con antelacion" },
        { hora: "17:00", mensaje: "Ruta hacia la Union" },
        { hora: "18:00", mensaje: "Ruta hacia la Union" }
    ],
    "Medellin Term.Sur": [
        { hora: "04:50", mensaje: "ruta hacia Abejorral" },
        { hora: "06:35", mensaje: "Ruta hacia LLanogrande San Antonio" },
        { hora: "07:00", mensaje: "Ruta hacia Abejorral" },
        { hora: "08:10", mensaje: "Ruta hacia La Union" },
        { hora: "08:15", mensaje: "Ruta hacia LLanogrande San Antonio" },
        { hora: "09:00", mensaje: "Ruta Hacia Abejorral" },
        { hora: "10:10", mensaje: "Ruta hacia la Union" },
        { hora: "10:15", mensaje: "Ruta hacia LLanogrande San Antonio" },
        { hora: "13:30", mensaje: "Ruta hacia Abejorral" },
        { hora: "14:50", mensaje: "Ruta hacia La Union" },
        { hora: "16:30", mensaje: "Ruta Hacia Abejorral - ultima Linea" } 
    ],
     "La Ceja": [
        { hora: "05:00", mensaje: "Medellín Sur X San Antonio LLanogrande", destino: "Medellin Term.Sur", via: "San Antonio LLanogrande" },
        { hora: "05:30", mensaje: "Medellín Sur X San Antonio LLanogrande", destino: "Medellin Term.Sur", via: "San Antonio LLanogrande" },
        { hora: "05:45", mensaje: "Rionegro por Pontezuela", destino: "Rionegro", via: "Pontezuela" },
        { hora: "06:00", mensaje: "Rionegro por Pontezuela", destino: "Rionegro", via: "Pontezuela" },
        { hora: "06:00", mensaje: "Medellín Norte Tunel de Oriente", destino: "Medellin Term.Norte", via: "Tunel de Oriente" },
        { hora: "06:00", mensaje: "", destino: "La Union" },
        { hora: "06:15", mensaje: "", destino: "La Union" },
        { hora: "06:20", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "06:40", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "07:00", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "07:20", mensaje: "", destino: "La Union" },
        { hora: "07:40", mensaje: " ", destino: "La Union" },
        { hora: "07:50", mensaje: " ", destino: "La Union" },
        { hora: "08:10", mensaje: " ", destino: "La Union" },
        { hora: "08:50", mensaje: " ", destino: "La Union" },
        { hora: "09:50", mensaje: " ", destino: "La Union" },
        { hora: "10:00", mensaje: " ", destino: "La Union" },
        { hora: "10:50", mensaje: " ", destino: "La Union" },
        { hora: "11:10", mensaje: " ", destino: "La Union" },
        { hora: "11:50", mensaje: "", destino: "La Union" },
        { hora: "12:00", mensaje: "", destino: "La Union" },
        { hora: "12:20", mensaje: " ", destino: "La Union" },
        { hora: "12:50", mensaje: " ", destino: "La Union" },
        { hora: "13:10", mensaje: "", destino: "La Union" },
        { hora: "13:50", mensaje: "", destino: "La Union" },
        { hora: "14:50", mensaje: " ", destino: "La Union" },
        { hora: "15:10", mensaje: "", destino: "La Unión" },
        { hora: "15:50", mensaje: "", destino: "La Union" },
        { hora: "16:00", mensaje: "", destino: "La Union" },
        { hora: "16:10", mensaje: " ", destino: "La Union" },
        { hora: "16:40", mensaje: "", destino: "La Unión" },
        { hora: "16:50", mensaje: "", destino: "La Unión" },
        { hora: "17:00", mensaje: " ", destino: "La Union" },
        { hora: "17:10", mensaje: " ", destino: "La Union" },
        { hora: "18:00", mensaje: " ", destino: "La Union" },
        { hora: "18:30", mensaje: " ", destino: "La Union" },
        { hora: "18:50", mensaje: " ", destino: "La Union" },
        { hora: "19:00", mensaje: " ", destino: "La Union" },
        { hora: "19:50", mensaje: " ", destino: "La Union" },
        { hora: "20:00", mensaje: " ", destino: "La Union" },
        { hora: "20:50", mensaje: " ", destino: "La Union" },
        { hora: "06:40", mensaje: "", destino: "Abejorral", via: "Colmenas" },
        { hora: "07:10", mensaje: " ", destino: "Abejorral", via: "Mesopotamia" },
        { hora: "07:30", mensaje: " ", destino: "Abejorral", via: "Guaico" },
        { hora: "07:50", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "09:00", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "09:50", mensaje: "", destino: "Abejorral", via: "Colmenas" },
        { hora: "11:00", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "11:50", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "13:50", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "14:10", mensaje: " ", destino: "Abejorral", via: "Mesopotamia" },
        { hora: "14:50", mensaje: " ", destino: "Abejorral", via: "El Guaico" },
        { hora: "15:20", mensaje: " Abordar con Antelacion", destino: "Abejorral", via: "Colmenas" },
        { hora: "16:30", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "17:30", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "18:30", mensaje: " ", destino: "Abejorral", via: "Colmenas" },
        { hora: "07:30", mensaje: " ", destino: "Rionegro", via: "Pontezuela" },
        { hora: "09:40", mensaje: " ", destino: "Rionegro", via: "Pontezuela" },
        { hora: "11:20", mensaje: " ", destino: "Rionegro", via: "Pontezuela" },
        { hora: "12:40", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "14:05", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "15:00", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "15:00", mensaje: " ", destino: "Medellin Term.Sur", via: "San Antonio" },
        { hora: "16:00", mensaje: " ", destino: "Medellin Term. Norte", via: "San Antonio" },
        { hora: "17:00", mensaje: " ", destino: "Medellin Term.Su", via: "San Antonio" },
        { hora: "16:00", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "16:30", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "17:00", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "17:30", mensaje: "", destino: "Rionegro", via: "Pontezuela" },
        { hora: "18:00", mensaje: "Ultimo Vehiculo por Pontezuela", destino: "Rionegro", via: "Pontezuela" }
    ],
    // ======================================
    // HORARIOS LA UNION (NUEVOS)
    // ======================================
    "La Union": [
        // Rutas que pasan por La Ceja/Rionegro o Medellín
        { hora: "05:00", mensaje: "Ruta Vía La Ceja - Rionegro", destino: "Rionegro", via: "Vía La Ceja" },
        { hora: "05:15", mensaje: "Medellín Norte", destino: "Medellin Term.Norte" },
        { hora: "05:30", mensaje: "", destino: "Medellin Term.Sur", via: "La Ceja" },
        { hora: "05:40", mensaje: "Rionegro (Vía La Ceja)", destino: "Rionegro", via: "Vía La Ceja" },
        { hora: "05:55", mensaje: "No entra al Municipio de La Ceja", destino: "Rionegro", via: "Variante" },
        { hora: "06:00", mensaje: " ", destino: "Medellin Term.Norte" },
        { hora: "06:20", mensaje: " ", destino: "Rionegro", via: "La Ceja" },
        { hora: "06:40", mensaje: " ", destino: "Rionegro", via: "La Ceja" },
        { hora: "07:00", mensaje: "Linea Fija", destino: "Medellin Term.Norte" },
        { hora: "07:05", mensaje: "No entra al Municipio de La Ceja", destino: "Rionegro", via: "Variante" },
        { hora: "07:30", mensaje: " ", destino: "Medellin Term.Norte" },
        { hora: "08:00", mensaje: "Linea Fija", destino: "Medellin Term.Norte" },
        { hora: "08:20", mensaje: " ", destino: "La Ceja" },
        { hora: "09:00", mensaje: " ", destino: "La Ceja" },
        { hora: "09:20", mensaje: "Medellín Norte", destino: "La Ceja",},
        { hora: "10:00", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "10:30", mensaje: "Medellín Norte (Conexión en La Ceja)", destino: "Medellin Term.Norte", via: "Conexión en La Ceja" },
        { hora: "11:00", mensaje: "Medellín Norte", destino: "La Ceja" },
        { hora: "11:15", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "11:30", mensaje: "Medellín Sur", destino: "La Ceja" },
        { hora: "11:45", mensaje: "Rionegro", destino: "La Ceja" }, // Cambié destino a Rionegro para simplificar
        
        { hora: "12:00", mensaje: "Medellín Norte", destino: "Medellin Term.Norte"}, // OK: Coincide con el turno Vehículo 6
        
        // CORRECCIÓN APLICADA AQUÍ: El turno 147 va a 'La Ceja' (en la DB), no a 'Medellin Term.Norte'.
        { hora: "12:20", mensaje: " Medellín Norte", destino: "La Ceja"}, 
        
        { hora: "12:40", mensaje: "La Ceja", destino: "Rionegro" },
        { hora: "13:00", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "13:20", mensaje: "Medellín Norte", destino: "Medellin Term.Norte" },
        { hora: "13:40", mensaje: " y Rionegro", destino: "La Ceja" },
        { hora: "14:00", mensaje: "La Ceja", destino: "La Ceja" },
        { hora: "14:20", mensaje: "Medellín Norte", destino: "La Ceja" },
        { hora: "14:40", mensaje: "  ", destino: "La Ceja" },
        { hora: "15:00", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "15:30", mensaje: "Medellín Sur", destino: "La Ceja" },
        { hora: "16:00", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "16:10", mensaje: "  ", destino: "La Ceja" },
        { hora: "16:20", mensaje: "Medellín Norte", destino: "La Ceja" },
        { hora: "16:45", mensaje: "La Ceja", destino: "Rionegro" },
        { hora: "17:00", mensaje: "Medellín Norte", destino: "Medellin Term.Norte" },
        { hora: "17:10", mensaje: "La Ceja", destino: "La Ceja" },
        { hora: "17:20", mensaje: "La Ceja", destino: "La Ceja" },
        { hora: "17:30", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "17:45", mensaje: "La Ceja", destino: "La Ceja" },
        { hora: "18:00", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "18:20", mensaje: "Medellín Norte", destino: "La Ceja" },
        { hora: "19:00", mensaje: "Rionegro", destino: "La Ceja" },
        { hora: "19:20", mensaje: "Medellín Norte", destino: "La Ceja" }
    ],
    "Rionegro": [
        // Las rutas a La Ceja/La Union que pasan por La Ceja como punto intermedio
        // DEBEN tener destino: "La Ceja" para coincidir con el registro de la DB (Rodamiento Actual)
        
        // HORARIOS CON DESTINO FINAL DENTRO DEL TRAYECTO O COINCIDENTE
        { hora: "06:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "06:32", mensaje: "Ruta Hacia La Union ", destino: "La Ceja" }, // Corregido: Destino La Ceja (DB) para ruta a La Union
        { hora: "07:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "07:00", mensaje: "Ruta Hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "08:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "08:00", mensaje: "Ruta Hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "09:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "09:00", mensaje: "Ruta Hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "10:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "10:00", mensaje: "Ruta Hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "11:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "11:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" }, // Corregido
        { hora: "11:30", mensaje: "Ruta Hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "12:00", mensaje: "Ruta hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "13:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "13:00", mensaje: "Ruta hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "14:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "14:00", mensaje: "Ruta hacia la Union", destino: "La Ceja" }, // Corregido
        { hora: "15:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "15:00", mensaje: "Ruta Hacia La Union", destino: "La Ceja" }, // Corregido
        
        // Bloque de 16:00 (Caso de prueba)
        { hora: "16:00", mensaje: "Ruta Hacia La Ceja por Pontezuela", destino: "La Ceja", via: "Pontezuela" },
        { hora: "16:00", mensaje: "Ruta Hacia La Union (Vía La Ceja)", destino: "La Ceja" }, // Corregido (asume vía principal/vacía)
        
        // HORARIOS RESTANTES AJUSTADOS
        { hora: "16:30", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "17:00", mensaje: "Ruta hacia La Union", destino: "La Ceja" },
        { hora: "17:00", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "17:15", mensaje: "Ruta hacia La Union por La Variante", destino: "La Union", via: "La Variante" }, // Mantiene La Union (asume registro final)
        { hora: "17:30", mensaje: " ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "17:42", mensaje: "Linea Fija hacia La Union ", destino: "La Ceja" }, // Corregido
        { hora: "18:00", mensaje: "  ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "18:00", mensaje: "Linea Fija hacia la Union (Vía La Ceja)", destino: "La Ceja" }, // Corregido
        { hora: "18:30", mensaje: "Ultima Ruta ", destino: "La Ceja", via: "Pontezuela" },
        { hora: "19:20", mensaje: "Linea Fija hacia La Union", destino: "La Union" }, // Mantiene La Union (asume registro final)
        { hora: "20:00", mensaje: "Ultimo Vehiculo hacia La Union", destino: "La Union" } // Mantiene La Union (asume registro final)
    ]
};

// Configuración de ciudades para el clima - NOMBRES EXACTOS DE LA BD
const CLIMA_MAPPINGS = {
    "Medellin Term.Norte": "Medellín",
    "Medellin Term.Sur": "Medellín",
    "La Ceja": "La Ceja",
    "Rionegro": "Rionegro",
    "Abejorral": "Abejorral",
    "default": "Medellín"
};

// ======================================
// CONFIGURACIÓN DE COORDENADAS PARA EL CLIMA (ANTIOQUIA)
// ======================================
const CLIMA_COORDS = {
    "La Union": "5.975,-75.367", // La Unión, Antioquia
    "Rionegro": "6.142,-75.373",
    "La Ceja": "5.971,-75.433",
    "Medellin Term.Norte": "6.251,-75.567",
    "Medellin Term.Sur": "6.251,-75.567",
    "Abejorral": "5.877,-75.394"
};
// ======================================

// ========== FUNCIONES PARA GIFS CONTEXTUALES ==========
function normalizarNombreDestino(destino) {
    return destino
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_');
}

function actualizarGifsContextuales(turnosCriticos) {
    const gifsContainer = document.getElementById('gifs-contextuales');
    const gifsInner = document.getElementById('gifs-inner');
    
    gifsInner.innerHTML = '';
    if (gifRotationInterval) {
        clearInterval(gifRotationInterval);
        gifRotationInterval = null;
    }
    
    if (turnosCriticos.length === 0) {
        gifsContainer.style.display = 'none';
        activeGifs = [];
        return;
    }
    
    const destinosUnicos = [];
    const destinosVistos = new Set();
    
    turnosCriticos.slice(0, 3).forEach(t => {
        const destino = t.Horarios.destino;
        if (!destinosVistos.has(destino)) {
            destinosVistos.add(destino);
            destinosUnicos.push(destino);
        }
    });
    
    activeGifs = [];
    destinosUnicos.forEach((destino, index) => {
        const nombreNormalizado = normalizarNombreDestino(destino);
        const gifItem = document.createElement('img');
        gifItem.className = 'gif-item';
        gifItem.src = `assets/gifs/${nombreNormalizado}.gif`;
        gifItem.alt = `Destino: ${destino}`;
        gifItem.onerror = function() {
            this.style.display = 'none';
        };
        gifsInner.appendChild(gifItem);
        activeGifs.push(gifItem);
    });
    
    if (activeGifs.length > 0) {
        gifsContainer.style.display = 'block';
        currentGifIndex = 0;
        activeGifs[0].classList.add('active');
        
        if (activeGifs.length > 1) {
            gifRotationInterval = setInterval(rotarGifs, 4000);
        }
    }
}

function rotarGifs() {
    if (activeGifs.length <= 1) return;
    
    activeGifs[currentGifIndex].classList.remove('active');
    currentGifIndex = (currentGifIndex + 1) % activeGifs.length;
    activeGifs[currentGifIndex].classList.add('active');
}

// ========== FUNCIÓN DE NORMALIZACIÓN PARA CLAVES DE HORARIOS ==========
function normalizeOriginKey(origin) {
    if (typeof origin !== 'string') return origin;
    // Normaliza el nombre del origen (y destino) para asegurar la coincidencia sin tildes/espacios/etc.
    // Ej: "Medellín Term. Norte " -> "Medellin Term.Norte"
    return origin
        .trim()
        .replace(/\s+/g, ' ') // Quita espacios múltiples
        .replace(/ Term\. Norte/i, ' Term.Norte')
        .replace(/ Term\. Sur/i, ' Term.Sur')
        .replace(/Medellín/i, 'Medellin')
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita tildes, etc.
}

// ===================================
// FUNCIÓN PARA REPRODUCIR SONIDO GENÉRICO/CRÍTICO
// ===================================
function playCriticalSound(currentTurnoId, audioObject) {
    if (!audioUnlocked) {
        console.log("🔊 Audio bloqueado. Requiere interacción del usuario.");
        return; 
    }
    
    // Si ya lo reproducimos para este ID de evento, salir
    if (currentTurnoId === lastCriticalTurnoId) {
        return;
    }

    // Intentar reproducir
    audioObject.currentTime = 0; 
    audioObject.play().then(() => {
        lastCriticalTurnoId = currentTurnoId;
        console.log(`🔊 Sonido ('${audioObject.src.split('/').pop()}') reproducido para ID: ${currentTurnoId}`);
    }).catch(error => {
        console.warn("❌ Fallo al reproducir sonido:", error);
    });
}

// ===================================
// FUNCIÓN PARA SÍNTESIS DE VOZ
// ===================================
function speak(text, rate = 1.0, pitch = 1.0) {
    if (!audioUnlocked) {
        console.log("🗣️ Voz bloqueada. Requiere interacción del usuario.");
        return;
    }
    
    // Evitar repeticiones en el mismo ciclo del ticker (30 segundos)
    if (text === lastSpokenText) {
        return;
    }

    // Limpiar cualquier voz que se esté reproduciendo
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // ==============================================================
    // LÓGICA MEJORADA DE SELECCIÓN DE VOZ (Para mayor naturalidad)
    // ==============================================================
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // 1. Buscar la voz más natural (Microsoft Raul o Helena son buenas opciones)
    const preferredVoices = ['Microsoft Raul - Spanish (Mexico)', 'Microsoft Helena - Spanish (Spain)', 'Google Spanish'];
    
    // 2. Intentar encontrar una voz de la lista de preferidas
    selectedVoice = voices.find(voice => 
        preferredVoices.some(pref => voice.name.includes(pref)) || voice.lang.startsWith('es')
    );
    
    // 3. Si se encuentra, usarla
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🗣️ Usando voz: ${selectedVoice.name}`);
    } else {
        // Fallback: usar la primera voz en español que encuentre
        selectedVoice = voices.find(voice => voice.lang.startsWith('es'));
        if (selectedVoice) {
             utterance.voice = selectedVoice;
             console.log(`🗣️ Fallback: Usando voz en español: ${selectedVoice.name}`);
        }
    }
    // ==============================================================

    utterance.rate = rate; // Velocidad de habla (1.0 es normal)
    utterance.pitch = pitch; // Tono (1.0 es normal)
    
    window.speechSynthesis.speak(utterance);
    lastSpokenText = text;
    console.log(`🗣️ Leyendo: "${text}"`);
}
// ===================================

// ========== SISTEMA DE TICKER MEJORADO CON COINCIDENCIA EXACTA ==========
function iniciarTickerAvisos() {
    const tickerContainer = document.getElementById('ticker-avisos');
    const tickerContent = document.getElementById('ticker-contenido');
    const avisosContainer = document.getElementById('avisos-especiales');
    const avisoTexto = document.getElementById('aviso-texto');
    
    if (!tickerContainer) return;
    
    // Obtener el origen seleccionado
    const filtroOrigen = document.getElementById('filtro-origen');
    const origenSeleccionadoRaw = filtroOrigen ? filtroOrigen.value : null;
    
    // Normalizar la clave para la búsqueda en horariosEspeciales
    const origenSeleccionado = normalizeOriginKey(origenSeleccionadoRaw);

    console.log("🔍 Origen seleccionado (Raw/Normalized):", origenSeleccionadoRaw, "/", origenSeleccionado);
    console.log("📋 Horarios disponibles:", Object.keys(horariosEspeciales));
    
    if (!origenSeleccionado) {
        console.log("❌ No hay origen seleccionado");
        tickerContainer.style.display = 'none';
        avisosContainer.style.display = 'none';
        return;
    }
    
    if (!horariosEspeciales[origenSeleccionado]) {
        console.log("❌ No hay horarios especiales para (Cleaned Key):", origenSeleccionado);
        tickerContainer.style.display = 'none';
        avisosContainer.style.display = 'none';
        return;
    }
    
    // Obtener hora actual
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const [hHActual, mMActual] = horaActual.split(':');
    const minutosActual = parseInt(hHActual) * 60 + parseInt(mMActual);
    
    const horariosUbicacion = horariosEspeciales[origenSeleccionado];
    let avisosActivos = [];
    let vozMessage = ''; // Variable para el mensaje de voz

    console.log(`⏰ Hora actual: ${horaActual} (${minutosActual} minutos)`);
    console.log(`📍 Horarios para ${origenSeleccionado}:`, horariosUbicacion.length);
    
    // Buscar avisos que cumplan con las condiciones de tiempo
    horariosUbicacion.forEach((horarioEspecial) => {
        const { hora: horaAviso, mensaje, destino, via } = horarioEspecial;
        const [hH, mM] = horaAviso.split(':');
        const minutosAviso = parseInt(hH) * 60 + parseInt(mM);
        const diferenciaMinutos = minutosAviso - minutosActual;
        
        // REGLA CORREGIDA:
        // - Aparece 15 minutos antes (diferencia = 15) hasta 11 minutos antes
        // - Se apaga (diferencia 10 a 3)
        // - Vuelve a aparecer 2 minutos antes (diferencia = 2) hasta que pase la hora
        const enPrimeraVentana = (diferenciaMinutos <= 15 && diferenciaMinutos > 10); // 15-11 min antes
        const enSegundaVentana = (diferenciaMinutos <= 2 && diferenciaMinutos >= 0);  // 2-0 min antes
        
        console.log(`⏱️ Hora aviso: ${horaAviso} (${minutosAviso} min) - Diferencia: ${diferenciaMinutos} min - Ventana1: ${enPrimeraVentana} - Ventana2: ${enSegundaVentana}`);
        
        if (enPrimeraVentana || enSegundaVentana) {
            // Buscar vehículos que coincidan con este origen, hora, destino y vía
            const vehiculosCoincidentes = datosCompletosDelDia.filter(turno => {
                if (!turno.Horarios) return false;
                
                const horaTurno = turno.Horarios.hora;
                const [hTurno, mTurno] = horaTurno.split(':');
                const minutosTurno = parseInt(hTurno) * 60 + parseInt(mTurno);
                
                // Coincidencia básica de origen y hora
                let coincide = normalizeOriginKey(turno.Horarios.origen) === origenSeleccionado && 
                              minutosTurno === minutosAviso;
                
                // Si el horario especial tiene destino específico, verificar coincidencia
                if (coincide && destino) {
                    // CORRECCIÓN APLICADA AQUÍ: Normalizar destino del Turno y del Horario Especial
                    const destinoTurnoNormalizado = turno.Horarios.destino
                        ? normalizeOriginKey(turno.Horarios.destino)
                        : '';
                        
                    const destinoEspecialNormalizado = normalizeOriginKey(destino);
                    
                    coincide = destinoTurnoNormalizado === destinoEspecialNormalizado;
                }
                
                // Si el horario especial tiene vía específica, verificar coincidencia
                if (coincide && via) {
                    // Si el horario especial pide una vía, el turno debe tenerla exactamente.
                    coincide = turno.Horarios.via === via;
                } else if (coincide && !via && (turno.Horarios.via && turno.Horarios.via.trim().toLowerCase() !== "principal")) {
                    // Si el horario especial NO pide vía (asume Principal), pero el turno SÍ tiene una vía, no coinciden
                    coincide = false; 
                }
                
                return coincide;
            });
            
            console.log(`🚌 Vehículos coincidentes para ${horaAviso}:`, vehiculosCoincidentes.length);
            
            // Formatear mensaje con los vehículos encontrados
            if (vehiculosCoincidentes.length > 0) {
                vehiculosCoincidentes.forEach(vehiculo => {
                    const numeroVehiculo = vehiculo.Vehículos.numero_interno;
                    const tipoVehiculo = vehiculosMap[numeroVehiculo] || "Vehículo";
                    const destinoVehiculo = vehiculo.Horarios.destino;
                    const viaVehiculo = vehiculo.Horarios.via;
                    
                    let mensajeFormateado = `${numeroVehiculo} (${tipoVehiculo}) para las ${horaAviso}`;
                    
                    // Construcción del mensaje para la voz (más natural)
                    let vozTurno = `Turno de las ${horaAviso.replace(':', ' y ')}, vehículo ${numeroVehiculo}, tipo ${tipoVehiculo}, con destino ${destinoVehiculo}. ${mensaje}.`;
                    
                    // Agregar información de destino y vía si es relevante
                    if (destinoVehiculo && viaVehiculo && viaVehiculo.trim().toLowerCase() !== "principal") {
                        mensajeFormateado += ` - ${destinoVehiculo} por ${viaVehiculo}`;
                        vozTurno = `Turno de las ${horaAviso.replace(':', ' y ')}, vehículo ${numeroVehiculo}, tipo ${tipoVehiculo}, con destino a ${destinoVehiculo} por ${viaVehiculo}. ${mensaje}.`;
                    } else if (destinoVehiculo) {
                        mensajeFormateado += ` - ${destinoVehiculo}`;
                    }
                    
                    mensajeFormateado += ` - ${mensaje}`;
                    avisosActivos.push(mensajeFormateado);
                    // Si es el primer aviso, guardarlo para la voz
                    if (!vozMessage) vozMessage = vozTurno;
                });
            } else {
                // Si no hay vehículos específicos, mostrar mensaje general
                let mensajeFormateado = `Vehículo por confirmar para las ${horaAviso}`;
                
                // Construcción del mensaje para la voz (más natural)
                let vozTurno = `Turno por confirmar a las ${horaAviso.replace(':', ' y ')}. ${mensaje}.`;

                // Agregar información de destino y vía del horario especial
                if (destino && via) {
                    mensajeFormateado += ` - ${destino} por ${via}`;
                    vozTurno = `Turno por confirmar a las ${horaAviso.replace(':', ' y ')}, con destino a ${destino} por ${via}. ${mensaje}.`;
                } else if (destino) {
                    mensajeFormateado += ` - ${destino}`;
                }
                
                mensajeFormateado += ` - ${mensaje}`;
                avisosActivos.push(mensajeFormateado);
                // Si es el primer aviso, guardarlo para la voz
                if (!vozMessage) vozMessage = vozTurno;
            }
        }
    });
    
    console.log("📢 Avisos activos:", avisosActivos);
    
    // Mostrar avisos
    if (avisosActivos.length > 0) {
        const tickerTexto = avisosActivos.join(' ⚡ ');
        tickerContent.textContent = tickerTexto;
        tickerContainer.style.display = 'block';
        
        // ===============================================
        // SOLUCIÓN PARA EL AVISO ESPECIAL (CAJA AMARILLA)
        // ===============================================
        let primeraHora = 'próximas horas';
        const primeraHoraMatch = avisosActivos[0].match(/para las (\d{2}:\d{2})/);
        if (primeraHoraMatch) {
             primeraHora = primeraHoraMatch[1];
        }
        
        if (avisosActivos.length > 1) {
             avisoTexto.textContent = `⚡ ¡ATENCIÓN! Múltiples salidas especiales a las ${primeraHora}. Ver Pantalla mejor informacion para detalles.`;
             // Mensaje de voz consolidado para múltiples turnos
             vozMessage = `Alerta señor pasajero. Hay varias salidas especiales programadas para las ${primeraHora.replace(':', ' y ')}. Por favor, consulte la pantalla para los detalles.`;
        } else {
             avisoTexto.textContent = avisosActivos[0];
        }
        avisosContainer.style.display = 'flex';
        // ===============================================

        // ===================================
        // LÓGICA DE SONIDO ESPECIAL + VOZ (Turno Especial)
        // ===================================
        const especialId = `${origenSeleccionado}-${primeraHora}-TICKER`;
        playCriticalSound(especialId, specialSound); // Sonido de alerta
        speak(vozMessage); // Anuncio de voz
        // ===================================
        
        console.log("✅ Ticker activado con mensajes");
    } else {
        tickerContainer.style.display = 'none';
        avisosContainer.style.display = 'none';
        lastSpokenText = ''; // Limpiar la última voz si no hay avisos
        console.log("❌ No hay avisos activos en este momento");
    }
}

// ========== SISTEMA DE CLIMA CON ACTUALIZACIÓN CADA 20 MINUTOS ==========
async function cargarClimaContextual(origen) {
    const cont = document.getElementById('clima-contextual');
    if (!cont || !origen) {
        cont.style.display = 'none';
        // Limpiar el timeout si está configurado
        if (climaTimeout) clearTimeout(climaTimeout);
        return;
    }

    // Normalizar el origen para buscar el mapeo de la ciudad
    const origenNormalizado = normalizeOriginKey(origen);
    
    // ✅ API KEY REAL DE WEATHERAPI.COM
    const API_KEY = '3dea565aac6849d8863154432251011';
    
    // Datos de respaldo compactos
    const datosRespaldo = {
        "Medellín": { temp: 22, lluvia: false, humedad: 65, viento: 8 },
        "La Ceja": { temp: 17, lluvia: true, humedad: 85, viento: 6 },
        "Rionegro": { temp: 19, lluvia: false, humedad: 70, viento: 10 },
        "Abejorral": { temp: 16, lluvia: true, humedad: 80, viento: 5 }
    };
    
    // Determinar la consulta (usar coordenadas para La Union)
    const coord = CLIMA_COORDS[origenNormalizado];
    let query = '';
    let displayLocation = '';

    if (coord) {
        query = coord; // Usar coordenadas para La Union, Antioquia
        displayLocation = origenNormalizado.replace(/Term\./g, 'Term. ');
    } else {
        const ciudadPrincipal = CLIMA_MAPPINGS[origenNormalizado] || CLIMA_MAPPINGS.default;
        query = encodeURIComponent(ciudadPrincipal + ', Colombia');
        displayLocation = ciudadPrincipal;
    }


    try {
        // Verificar cache (20 minutos)
        const ahora = Date.now();
        if (ultimaActualizacionClima > 0 && (ahora - ultimaActualizacionClima) < 1200000) {
            console.log("✅ Usando cache de clima (20 min)");
            return;
        }
        
        // Hacer solicitud con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&lang=es`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        
        // Procesar datos reales - formato compacto
        const temp = Math.round(data.current.temp_c);
        const lluvia = data.current.precip_mm > 0;
        const lluviaTexto = lluvia ? `🌧️ ${data.current.precip_mm}mm` : '☀️ Seco';
        const humedad = data.current.humidity;
        const viento = data.current.wind_kph;
        const icono = data.current.condition.icon;
        
        // Mostrar datos compactos
        cont.innerHTML = `
            <div class="clima-compacto">
                <div class="clima-header-compacto">
                    <img src="${icono.startsWith('//') ? 'https:' + icono : icono}" 
                         alt="${data.current.condition.text}" class="clima-icono-compacto">
                    <div class="clima-temp">${temp}°C</div>
                </div>
                <div class="clima-detalles-compacto">
                    <span>${lluviaTexto}</span>
                    <span>💧 ${humedad}%</span>
                    <span>💨 ${viento}km/h</span>
                </div>
                <div class="clima-ubicacion">${data.location.name}</div>
                <div class="clima-actualizado">🕒 ${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
    } catch (error) {
        console.warn("API de clima falló, usando datos de respaldo:", error);
        
        // Usar datos de respaldo compactos
        const ciudad = CLIMA_MAPPINGS[origenNormalizado] || CLIMA_MAPPINGS.default;
        const datos = datosRespaldo[ciudad] || datosRespaldo["Medellín"];
        const lluviaTexto = datos.lluvia ? "🌧️ Lluvia" : "☀️ Seco";
        
        cont.innerHTML = `
            <div class="clima-compacto respaldo">
                <div class="clima-header-compacto">
                    <div class="clima-emoji">${datos.lluvia ? '🌧️' : '☀️'}</div>
                    <div class="clima-temp">${datos.temp}°C</div>
                </div>
                <div class="clima-detalles-compacto">
                    <span>${lluviaTexto}</span>
                    <span>💧 ${datos.humedad}%</span>
                    <span>💨 ${datos.viento}km/h</span>
                </div>
                <div class="clima-ubicacion">${ciudad} (Simulado)</div>
                <div class="clima-actualizado">🕒 ${new Date().toLocaleTimeString()}</div>
            </div>
        `;
    }
    
    cont.style.display = 'block';
    ultimaActualizacionClima = Date.now();
    
    // ===================================
    // LÓGICA DE OCULTAMIENTO DEL CLIMA (2 minutos)
    // ===================================
    if (climaTimeout) clearTimeout(climaTimeout);
    climaTimeout = setTimeout(() => {
        cont.style.display = 'none';
        console.log("🌦️ Clima ocultado después de 2 minutos.");
    }, 120000); // 2 minutos = 120000 ms
    // ===================================
}

// ========== INICIALIZACIÓN DEL CLIMA CADA 20 MINUTOS ==========
function iniciarActualizacionClima() {
    // Limpiar intervalo anterior si existe
    if (intervaloClima) {
        clearInterval(intervaloClima);
    }
    
    // Actualizar clima cada 20 minutos (1200000 ms)
    intervaloClima = setInterval(() => {
        const filtroActual = document.getElementById('filtro-origen').value;
        if (filtroActual) {
            console.log("🔄 Actualizando clima automáticamente (cada 20 min)");
            ultimaActualizacionClima = 0; // Forzar actualización
            cargarClimaContextual(filtroActual);
        }
    }, 1200000); // 20 minutos = 1200000 ms
}

// ========== RELOJ DIGITAL ==========
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

// ========== ICONOS DE RELOJ ==========
function getIconoReloj(hora) {
    const iconos = {
        0:'🕛',1:'🕐',2:'🕑',3:'🕒',4:'🕓',5:'🕔',6:'🕕',7:'🕖',8:'🕗',
        9:'🕘',10:'🕙',11:'🕚',12:'🕛',13:'🕐',14:'🕑',15:'🕒',16:'🕓',
        17:'🕔',18:'🕕',19:'🕖',20:'🕗',21:'🕘',22:'🕙',23:'🕚'
    };
    return iconos[hora] || '🕒';
}

// ========== CÍRCULOS DE COLOR POR MINUTO ==========
function getColorPorMinuto(minuto) {
    const m = minuto % 60;
    if (m < 10) return '🔵';
    if (m < 20) return '🟢';
    if (m < 30) return '🟡';
    if (m < 40) return '🟠';
    if (m < 50) return '🟣';
    return '🔴';
}

// ===================================
// FUNCIÓN DE DESBLOQUEO DE AUDIO (Debe estar aquí o antes de su uso)
// ===================================
function unlockAudio() {
    if (audioUnlocked) return;
    
    let unlockedCount = 0;
    // Iterar sobre el array global allSounds
    allSounds.forEach(sound => {
        // Intentar cargar y reproducir/pausar un sonido silencioso para desbloquear el contexto de audio
        sound.volume = 0; 
        sound.play().then(() => {
            sound.pause();
            sound.volume = 1; 
            unlockedCount++;
            if (unlockedCount === allSounds.length) { // Usar allSounds.length
                audioUnlocked = true;
                console.log(`🔊 Contexto de audio desbloqueado para ${allSounds.length} sonidos.`);
                
                // Eliminar los listeners después del desbloqueo exitoso
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('touchstart', unlockAudio);
            }
        }).catch(error => {
            console.warn("❌ Fallo al intentar desbloquear un sonido:", error);
        });
    });
}
// ===================================

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", function() {
    iniciarRelojDigital();
    cargarMonitorSalidas();
    setInterval(cargarMonitorSalidas, 60000);
    iniciarTickerAvisos();
    setInterval(iniciarTickerAvisos, 30000); // Verificar cada 30 segundos
    iniciarActualizacionClima(); // Iniciar actualización automática cada 20 min
    
    // Escuchar el primer clic o toque para desbloquear el audio
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    
    const filtroOrigen = document.getElementById('filtro-origen');
    filtroOrigen.addEventListener('change', () => {
        actualizarTablaProximos();
        ultimaActualizacionClima = 0; // Forzar actualización inmediata al cambiar filtro
        cargarClimaContextual(filtroOrigen.value);
        iniciarTickerAvisos();
    });
});

// ========== CARGAR DATOS ==========
function cargarMonitorSalidas() {
    obtenerRodamientoDelDia()
        .then(datos => {
            datosCompletosDelDia = datos;
            if (intervaloContador) clearInterval(intervaloContador);
            llenarFiltroOrigen();
            document.getElementById('proximos-content').style.display = 'block';
            document.getElementById('proximos-loader').style.display = 'none';
            intervaloContador = setInterval(actualizarTablaProximos, 1000);
            
            const filtroActual = document.getElementById('filtro-origen').value;
            if (filtroActual) {
                cargarClimaContextual(filtroActual);
            }
            iniciarTickerAvisos();
        })
        .catch(err => {
            console.error(err);
            showToast('Error', 'No se pudieron cargar los turnos.', 'warning');
        });
}

function llenarFiltroOrigen() {
    const select = document.getElementById('filtro-origen');
    const valorActual = select.value;
    
    // Obtener origenes únicos de los datos reales - EXACTAMENTE como vienen
    const origenesUnicos = [...new Set(
        datosCompletosDelDia
            .filter(d => d.Horarios?.origen)
            .map(d => d.Horarios.origen)
    )].sort();
    
    console.log("📍 Orígenes encontrados en datos:", origenesUnicos);
    
    select.innerHTML = '<option value="">Todos los orígenes</option>';
    origenesUnicos.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        select.appendChild(opt);
    });
    
    // Restaurar selección anterior si existe
    if (valorActual && origenesUnicos.includes(valorActual)) {
        select.value = valorActual;
    } else if (origenesUnicos.length > 0) {
        // Seleccionar el primer origen por defecto
        select.value = origenesUnicos[0];
    }
    
    console.log("🎯 Origen seleccionado:", select.value);
}

async function obtenerRodamientoDelDia() {
    const fecha = new Date().toISOString().slice(0, 10);
    // AGREGAMOS: hora_estimada, estado
    const url = `${SUPABASE_CONFIG.url}/rest/v1/operacion_diaria?select=id,hora_estimada,estado,Vehículos(numero_interno),Horarios!inner(hora,origen,destino,via)&fecha=eq.${fecha}`;
    const res = await fetch(url, {
        headers: { 'apikey': SUPABASE_CONFIG.key, 'Authorization': `Bearer ${SUPABASE_CONFIG.key}` }
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return await res.json();
}

function actualizarTablaProximos() {
    const ahora = new Date();
    const ahoraSeg = ahora.getHours() * 3600 + ahora.getMinutes() * 60 + ahora.getSeconds();
    
    const filtro = document.getElementById('filtro-origen').value;
    const filtroNormalizado = normalizeOriginKey(filtro);

    // 1. FILTRADO
    const turnos = datosCompletosDelDia
        .filter(d => {
            if (!d.Horarios?.hora) return false;
            if (filtro && normalizeOriginKey(d.Horarios.origen) !== filtroNormalizado) return false;
            
            const horaEfectiva = d.hora_estimada || d.Horarios.hora;
            const [h, m] = horaEfectiva.split(':');
            const segundosTurno = parseInt(h) * 3600 + parseInt(m) * 60;
            
            return segundosTurno >= (ahoraSeg - 60); 
        })
        .map(d => {
            const horaEfectiva = d.hora_estimada || d.Horarios.hora;
            const [h, m] = horaEfectiva.split(':');
            return {
                ...d,
                segundos: parseInt(h) * 3600 + parseInt(m) * 60,
                horaVisual: horaEfectiva,
                id: d.id
            };
        })
        .sort((a, b) => a.segundos - b.segundos)
        .slice(0, 20);

    const tbody = document.querySelector("#tabla-proximos tbody");
    tbody.innerHTML = '';

    // Lógica Sonidos/Clima
    const turnosOperativos = turnos.filter(t => t.estado !== 'CANCELADO');
    const turnosCriticos = turnosOperativos.filter(t => (t.segundos - ahoraSeg) / 60 <= 2 && (t.segundos - ahoraSeg) > -60);
    actualizarGifsContextuales(turnosCriticos);

    const proximoTurno = turnosOperativos[0];
    if (turnosCriticos.length > 0) {
        playCriticalSound(`CRITICO-${turnosCriticos[0].id}`, criticalSound);
    } else if (proximoTurno) {
        const diffMin = Math.round((proximoTurno.segundos - ahoraSeg) / 60);
        if (diffMin >= 11 && diffMin <= 15) {
            playCriticalSound(`ATENCION-${proximoTurno.id}-${Math.floor(diffMin)}`, attentionSound);
        } else {
            lastCriticalTurnoId = null;
        }
    } else {
        lastCriticalTurnoId = null;
    }

    if (turnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">No hay turnos próximos</td></tr>`;
        return;
    }

    // 2. RENDERIZADO DE FILAS
    turnos.forEach(t => {
        const diffSeg = t.segundos - ahoraSeg;
        const minRest = Math.round(diffSeg / 60);
        
        // =========================================================
        // 1. LÓGICA DE ESTADO (AHORA CON "EN PLATAFORMA")
        // =========================================================
        let estadoHtml = '';
        
        if (minRest > 10) { 
            estadoHtml = '<span class="badge badge-proximo">PRÓXIMO</span>';
        } else if (minRest <= 2) { 
            // NUEVO: Si falta 2 min o menos, es ABORDAJE
            estadoHtml = '<span class="badge badge-abordaje">EN PLATAFORMA</span>';
        } else {
            estadoHtml = '<span class="badge badge-atiempo">A TIEMPO</span>';
        }

        let claseFila = '';
        const horaProgClean = t.Horarios.hora.substring(0, 5);
        const horaEstClean = (t.hora_estimada || '').substring(0, 5);
        
        // Diseño Hora
        let horaContenido = `<span class="hora-digito">${horaProgClean}</span>`;
        if (t.estado === 'CANCELADO') {
             estadoHtml = '<span class="badge badge-cancelado">CANCELADO</span>';
             claseFila = 'fila-cancelada';
             horaContenido = `<span class="hora-tachada">${horaProgClean}</span>`;
        } 
        else if (horaEstClean && horaEstClean !== horaProgClean) {
            const [h1, m1] = horaProgClean.split(':').map(Number);
            const [h2, m2] = horaEstClean.split(':').map(Number);
            const diff = (h2 * 60 + m2) - (h1 * 60 + m1);

            if (diff > 0) {
                estadoHtml = `<span class="badge badge-retrasado">RETRASADO ${Math.abs(diff)}'</span>`;
                horaContenido = `<div class="hora-cambio"><span class="hora-tachada-mini">${horaProgClean}</span><span class="hora-retraso">${horaEstClean}</span></div>`;
            } else if (diff < 0) {
                estadoHtml = `<span class="badge badge-adelantado">ADELANTADO ${Math.abs(diff)}'</span>`;
                horaContenido = `<div class="hora-cambio"><span class="hora-tachada-mini">${horaProgClean}</span><span class="hora-adelanto">${horaEstClean}</span></div>`;
            }
        }

        const horaDisplayHTML = `<div class="hora-badge"><i class="fa-regular fa-clock"></i>${horaContenido}</div>`;

        // Diseño Vehículo
        const tipo = vehiculosMap[t.Vehículos.numero_interno] || "Vehículo";
        let iconoVeh = "🚌";
        if (tipo === "Buseta") iconoVeh = "🚐"; else if (tipo === "Microbus") iconoVeh = "🚍"; else if (tipo === "Vans") iconoVeh = "🚙";

        const vehiculoHtml = `<div class="vehiculo-chip"><span class="vehiculo-icono">${iconoVeh}</span><div class="vehiculo-info"><span class="vehiculo-num">${t.Vehículos.numero_interno}</span><span class="vehiculo-tipo">${tipo}</span></div></div>`;

        // =========================================================
        // 2. LÓGICA DE COLOR POR DESTINO
        // =========================================================
        let claseDestino = "dest-default";
        const destinoUpper = t.Horarios.destino ? t.Horarios.destino.toUpperCase() : "";

        if (destinoUpper.includes("MEDELLIN") || destinoUpper.includes("MEDELLÍN")) claseDestino = "dest-medellin";
        else if (destinoUpper.includes("RIONEGRO")) claseDestino = "dest-rionegro";
        else if (destinoUpper.includes("UNION") || destinoUpper.includes("UNIÓN")) claseDestino = "dest-launion";
        else if (destinoUpper.includes("ABEJORRAL")) claseDestino = "dest-abejorral";
        else if (destinoUpper.includes("CEJA")) claseDestino = "dest-laceja";

        // Diseño Ruta (Aplicando la clase de color)
        const rutaHtml = `
            <div class="ruta-container">
                <div class="ruta-origen-group">
                    <i class="fa-regular fa-circle-dot ruta-icon-orig"></i>
                    <span class="ruta-origen">${t.Horarios.origen}</span>
                </div>
                <i class="fa-solid fa-arrow-right-long ruta-flecha"></i>
                <div class="ruta-destino-group">
                    <i class="fa-solid fa-location-dot ruta-icon-dest"></i>
                    <!-- AQUÍ SE APLICA LA CLASE DE COLOR -->
                    <span class="ruta-destino ${claseDestino}">${t.Horarios.destino}</span>
                </div>
            </div>
        `;

        const viaHtml = t.Horarios.via ? `<div class="via-tag"><i class="fa-solid fa-road"></i> ${t.Horarios.via}</div>` : '';

        // Barra de Tiempo
        let celdaTiempo = '';
        if (t.estado === 'CANCELADO') {
            celdaTiempo = '<div style="text-align:center; color: var(--text-secondary);">--</div>';
        } else {
            let textoTiempo = `${minRest} min`;
            let colorBarra = "#69db7c"; 

            // Si es 2 min o menos, activa la cinta verde
            if (minRest <= 2) {
                textoTiempo = " ";
                colorBarra = "#ff6b6b"; 
                claseFila += ' fila-saliendo'; 
            }
            else if (minRest <= 5) colorBarra = "#f77c08"; 
            else if (minRest <= 10) colorBarra = "#fab005"; 
            else colorBarra = "#2d8cff";

            const porc = Math.max(0, Math.min(100, (minRest / 60) * 100));
            if (minRest > 60) {
                const hRest = Math.floor(minRest / 60);
                const mRest = minRest % 60;
                textoTiempo = `${hRest}h ${mRest}m`;
            }

            celdaTiempo = `<div class="barra-progreso-container"><div class="barra-progreso" style="width: ${porc}%; background-color: ${colorBarra};"></div></div><span class="etiqueta-tiempo" style="${minRest <= 2 ? 'color: #69db7c; font-weight:900;' : ''}">${textoTiempo}</span>`;
        }

        tbody.innerHTML += `
            <tr class="${claseFila}">
                <td>${horaDisplayHTML}</td>
                <td>${vehiculoHtml}</td>
                <td>${rutaHtml}</td>
                <td style="text-align: center;">${estadoHtml}</td>
                <td>${viaHtml}</td>
                <td class="tiempo-cell">${celdaTiempo}</td>
            </tr>`;
    });
}
// ========== TOASTS ==========
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