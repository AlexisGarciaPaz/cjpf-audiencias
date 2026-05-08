javascript:(function(){
  // ─── MAPEOS ──────────────────────────────────────────────────────────────
  const JUECES = {
    'ECRL': 'Erika Carolina Ramírez López',
    'AKAC': 'Ana Karina Aragón Cutiño',
    'ABS':  'Alejandro Bermúdez Sánchez',
    'MICM': 'María Inés Camacho Martínez'
  };

  const ENLACE = {
    'víctor manuel lópez medina':    '916',
    'victor manuel lopez medina':    '916',
    'arturo uriarte soto':           '731',
    'hugo enrique guzmán zepeda':    '0',
    'hugo enrique guzman zepeda':    '0',
    'césar reyniel castro montoya':  '145',
    'cesar reyniel castro montoya':  '145',
    'alexis omar garcía paz':        '0',
    'alexis omar garcia paz':        '0',
    'enrique lópez landeros':        '0',
    'enrique lopez landeros':        '0'
  };

  const AUDIENCIA = {
    'inicial': '1',
    'inicial con detenido': '1',
    'inicial con detenidos': '1',
    'intermedia': '2',
    'intermedia a abreviado': '2',
    'procedimiento abreviado': '6',
    'continuación': '27',
    'continuacion': '27',
    'continuación de inicial': '27',
    'continuacion de inicial': '27',
    'continuación de audiencia inicial': '27',
    'continuacion de audiencia inicial': '27',
    'prórroga de investigación': '26',
    'prorroga de investigacion': '26',
    'prórroga de plazo': '26',
    'prorroga de plazo': '26',
    'audiencia de prórroga': '26',
    'audiencia de prorroga': '26',
    'cierre de investigación': '30',
    'cierre de investigacion': '30',
    'cierre de investigación complementaria': '30',
    'cierre de investigacion complementaria': '30',
    'juicio oral': '29',
    'juicio': '29',
    'abreviado': '55',
    'medida cautelar': '13',
    'revisión de medida cautelar': '36',
    'revision de medida cautelar': '36',
    'beneficio de libertad': '17',
    'beneficio de libertad condicionada': '17',
    'suspensión condicional': '14',
    'suspension condicional': '14',
    'resolver sobre beneficio': '17',
    'revisión de las condiciones': '5',
    'revision de las condiciones': '5',
    'solicitud de sobreseimiento': '1',
    'sobreseimiento': '1',
    'desistimiento': '2',
    'acumulación': '2',
    'separación': '2',
    'verificación': '30'
  };

  const DELITO = {
    'sin conocimiento': '0',
    'cpf': '0',
    'cff': '0',
    'portación de arma de fuego de uso exclusivo': '4',
    'portacion de arma de fuego de uso exclusivo': '4',
    'portación de armas de fuego de uso exclusivo': '4',
    'portacion de armas de fuego de uso exclusivo': '4',
    'posesión de arma de fuego de uso exclusivo': '4',
    'posesion de arma de fuego de uso exclusivo': '4',
    'portación de arma de fuego sin licencia': '20',
    'portacion de arma de fuego sin licencia': '20',
    'contra la salud': '8',
    'contra la biodiversidad': '17',
    'hidrocarburos': '1',
    'robo de hidrocarburos': '1',
    'operaciones con recursos': '1',
    'recursos de procedencia ilícita': '1',
    'recursos de procedencia ilicita': '1'
  };

  const MESES = {
    'enero':'01','febrero':'02','marzo':'03','abril':'04',
    'mayo':'05','junio':'06','julio':'07','agosto':'08',
    'septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'
  };

  // ─── FUNCIONES AUXILIARES ────────────────────────────────────────────────
  function parseFecha(texto) {
    // Formato: 05/Mayo/2026 o 05/05/2026 o 5/Marzo/2026
    let m = texto.match(/(\d{1,2})[\/\-](\w+)[\/\-](\d{4})/);
    if (!m) return '';
    let dia = m[1].padStart(2,'0');
    let mes = isNaN(m[2]) ? (MESES[m[2].toLowerCase()] || '01') : m[2].padStart(2,'0');
    return `${m[3]}-${mes}-${dia}`;
  }

  function parseHora(texto) {
    let m = texto.match(/(\d{1,2}):(\d{2})/);
    if (!m) return '';
    return `${m[1].padStart(2,'0')}:${m[2]}:01`;
  }

  function parseAudiencia(texto) {
    let t = texto.toLowerCase().trim();
    // Buscar match más largo primero
    let keys = Object.keys(AUDIENCIA).sort((a,b) => b.length - a.length);
    for (let k of keys) {
      if (t.includes(k)) return AUDIENCIA[k];
    }
    return '1';
  }

  function parseDelito(texto) {
    let t = texto.toLowerCase();
    let keys = Object.keys(DELITO).sort((a,b) => b.length - a.length);
    for (let k of keys) {
      if (t.includes(k)) return DELITO[k];
    }
    return '0';
  }

  function parseJuez(texto) {
    let t = texto.toUpperCase().trim();
    return JUECES[t] || '';
  }

  function parseEnlace(texto) {
    let t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    for (let k of Object.keys(ENLACE)) {
      let kn = k.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (t.includes(kn)) return ENLACE[k];
    }
    return '0';
  }

  function setVal(name, val) {
    let el = document.getElementsByName(name)[0];
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function parsearReporte(texto) {
    let lineas = texto.split('\n').map(l => l.trim());
    let data = {
      fecha: '', horaini: '', horafin: '', tipoAud: '',
      juez: '', imputados: '', delito: '', resolucion: '',
      enlace: '0', codigoJuez: ''
    };

    // Detectar código de juez (última línea no vacía que sea código)
    for (let i = lineas.length - 1; i >= 0; i--) {
      let l = lineas[i].trim().toUpperCase();
      if (/^(ECRL|AKAC|ABS|MICM)$/.test(l)) {
        data.codigoJuez = l;
        data.juez = JUECES[l] || '';
        break;
      }
    }

    // Fecha
    for (let l of lineas) {
      if (l.toLowerCase().includes('fecha') && l.includes('/')) {
        let m = l.match(/(\d{1,2}[\/\-]\w+[\/\-]\d{4})/);
        if (m) { data.fecha = parseFecha(m[1]); break; }
      }
      if (l.toLowerCase().startsWith('*fecha')) {
        let m = l.match(/(\d{1,2}[\/\-]\w+[\/\-]\d{4})/);
        if (m) { data.fecha = parseFecha(m[1]); break; }
      }
    }

    // Horas
    for (let l of lineas) {
      if (l.toLowerCase().includes('inició') || l.toLowerCase().includes('inicio')) {
        let m = l.match(/(\d{1,2}:\d{2})/);
        if (m) data.horaini = parseHora(m[1]);
      }
      if (l.toLowerCase().includes('finalizó') || l.toLowerCase().includes('finalizo')) {
        let m = l.match(/(\d{1,2}:\d{2})/);
        if (m) data.horafin = parseHora(m[1]);
      }
    }

    // Tipo audiencia — buscar entre paréntesis
    for (let l of lineas) {
      let m = l.match(/\(([^)]+)\)/);
      if (m) {
        data.tipoAud = parseAudiencia(m[1]);
        break;
      }
    }

    // Delito
    let enDelito = false;
    for (let l of lineas) {
      if (l.startsWith('> Delito:') || l.startsWith('Delito:')) {
        let d = l.replace(/^>?\s*delito:\s*/i, '').trim();
        data.delito = parseDelito(d);
        enDelito = false;
        break;
      }
    }

    // Imputados
    let imputadosList = [];
    let enImputados = false;
    for (let i = 0; i < lineas.length; i++) {
      let l = lineas[i];
      if (l.toLowerCase().includes('imputado') && (l.includes(':') || l.includes('s:'))) {
        enImputados = true;
        // Si el nombre está en la misma línea
        let inline = l.replace(/^>?\s*imputados?:\s*/i,'').trim();
        if (inline && !inline.toLowerCase().includes('imputado')) {
          inline.split(',').forEach(n => {
            n = n.trim().replace(/^[-•*]\s*/,'');
            if (n) imputadosList.push('• ' + n + '.');
          });
        }
        continue;
      }
      if (enImputados) {
        if (l.startsWith('>') || l.toLowerCase().startsWith('delito') || l.toLowerCase().startsWith('*delito')) {
          enImputados = false;
          break;
        }
        let nombre = l.replace(/^[-•*⁠]\s*/,'').trim();
        if (nombre) imputadosList.push('• ' + nombre + (nombre.endsWith('.') ? '' : '.'));
      }
    }
    // Si vienen separados por coma en una sola línea (formato César)
    if (imputadosList.length === 0) {
      for (let l of lineas) {
        if (l.match(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ]/)) {
          imputadosList.push('• ' + l.trim() + (l.trim().endsWith('.') ? '' : '.'));
        }
      }
    }
    data.imputados = imputadosList.join(' ');

    // Resolución
    let enRes = false;
    let resLines = [];
    for (let l of lineas) {
      if (l.toLowerCase().includes('resolución:') || l.toLowerCase().includes('resolucion:')) {
        enRes = true;
        let inline = l.replace(/^>?\s*resolución:\s*/i,'').replace(/^>?\s*resolucion:\s*/i,'').trim();
        if (inline) resLines.push(inline);
        continue;
      }
      if (enRes) {
        if (l.startsWith('Reporta') || l.startsWith('*') || l === '') {
          enRes = false;
          break;
        }
        resLines.push(l);
      }
    }
    data.resolucion = resLines.join(' ').trim();

    // Oficial para enlace seguridad
    for (let l of lineas) {
      if (l.toLowerCase().includes('reporta')) {
        data.enlace = parseEnlace(l);
        break;
      }
    }

    return data;
  }

  // ─── UI ──────────────────────────────────────────────────────────────────
  // Eliminar popup previo si existe
  let prev = document.getElementById('_bm_popup');
  if (prev) { prev.remove(); return; }

  let overlay = document.createElement('div');
  overlay.id = '_bm_popup';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.6);z-index:999999;
    display:flex;align-items:center;justify-content:center;
    font-family:Arial,sans-serif;
  `;

  let box = document.createElement('div');
  box.style.cssText = `
    background:#1e1e2e;color:#cdd6f4;border-radius:12px;
    padding:24px;width:520px;max-width:95vw;
    box-shadow:0 8px 32px rgba(0,0,0,0.5);
  `;

  box.innerHTML = `
    <h3 style="margin:0 0 12px;color:#89b4fa;font-size:16px;">
      📋 Llenar Formulario de Audiencia
    </h3>
    <textarea id="_bm_texto" placeholder="Pega aquí el reporte de WhatsApp..."
      style="width:100%;height:200px;background:#313244;color:#cdd6f4;
             border:1px solid #45475a;border-radius:8px;padding:10px;
             font-size:13px;resize:vertical;box-sizing:border-box;"></textarea>
    <div id="_bm_preview" style="margin-top:10px;font-size:12px;color:#a6e3a1;display:none;"></div>
    <div style="margin-top:12px;display:flex;gap:8px;">
      <button id="_bm_btn_llenar" style="
        flex:1;background:#89b4fa;color:#1e1e2e;border:none;
        border-radius:8px;padding:10px;font-size:14px;font-weight:bold;cursor:pointer;">
        ✅ Llenar Formulario
      </button>
      <button id="_bm_btn_cerrar" style="
        background:#45475a;color:#cdd6f4;border:none;
        border-radius:8px;padding:10px 16px;font-size:14px;cursor:pointer;">
        ✕
      </button>
    </div>
    <div id="_bm_status" style="margin-top:8px;font-size:12px;color:#f38ba8;text-align:center;"></div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('_bm_btn_cerrar').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  document.getElementById('_bm_btn_llenar').onclick = function() {
    let texto = document.getElementById('_bm_texto').value;
    if (!texto.trim()) {
      document.getElementById('_bm_status').textContent = '⚠️ Pega el reporte primero.';
      return;
    }

    let d = parsearReporte(texto);
    let status = document.getElementById('_bm_status');

    // Llenar campos
    setVal('oj', 'Culiacán, Sinaloa');
    if (d.juez)      setVal('juez', d.juez);
    if (d.imputados) setVal('imputado', d.imputados);
    if (d.resolucion) setVal('textareaRes', d.resolucion);
    if (d.fecha)     setVal('fechac', d.fecha);
    if (d.horaini)   setVal('horaini', d.horaini);
    if (d.horafin)   setVal('horafin', d.horafin);
    setVal('Tipaud', '2');
    if (d.tipoAud)   setVal('aud', d.tipoAud);
    if (d.delito)    setVal('del', d.delito);
    setVal('prioridad', '1');
    setVal('status', '1');
    setVal('REPRO', '0');
    setVal('mdelitos', '0');
    setVal('jgc', d.enlace);

    // Mostrar resumen
    let preview = document.getElementById('_bm_preview');
    preview.style.display = 'block';
    preview.innerHTML = `
      ✅ <b>Campos llenados:</b><br>
      📅 Fecha: ${d.fecha || '?'} &nbsp;
      ⏰ ${d.horaini || '?'} → ${d.horafin || '?'}<br>
      👨‍⚖️ ${d.juez || '? (revisa código juez)'}<br>
      🎭 Audiencia: ${d.tipoAud} &nbsp; ⚖️ Delito: ${d.delito}<br>
      👤 ${d.imputados.substring(0,60)}${d.imputados.length>60?'...':''}
    `;
    status.style.color = '#a6e3a1';
    status.textContent = '✅ Formulario llenado. Revisa los campos antes de continuar.';
  };

})();
