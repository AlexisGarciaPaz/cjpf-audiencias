// ─── CJPF Audiencias Bookmarklet v1.1 ────────────────────────────────────────
(function(){

  const JUECES = {
    'ECRL': 'Erika Carolina Ramírez López',
    'AKAC': 'Ana Karina Aragón Cutiño',
    'ABS':  'Alejandro Bermúdez Sánchez',
    'MICM': 'María Inés Camacho Martínez'
  };

  const ENLACE = {
    'victor manuel lopez medina':   '916',
    'arturo uriarte soto':          '731',
    'hugo enrique guzman zepeda':   '0',
    'cesar reyniel castro montoya': '145',
    'alexis omar garcia paz':       '0',
    'enrique lopez landeros':       '0'
  };

  const AUDIENCIA = {
    'continuacion de audiencia inicial':                '27',
    'continuacion de inicial con detenido':             '27',
    'continuacion de inicial':                          '27',
    'continuacion de audiencia':                        '27',
    'continuacion':                                     '27',
    'procedimiento abreviado':                          '6',
    'prorroga de plazo de investigacion complementaria':'26',
    'audiencia de prorroga de plazo':                   '26',
    'prorroga de plazo':                                '26',
    'prorroga de investigacion':                        '26',
    'cierre de investigacion complementaria':           '30',
    'cierre de investigacion':                          '30',
    'revision de las condiciones u obligaciones':       '5',
    'revision de medida cautelar':                      '36',
    'resolver sobre beneficio de libertad':             '17',
    'beneficio de libertad condicionada':               '17',
    'beneficio de libertad':                            '17',
    'suspension condicional del proceso':               '14',
    'suspension condicional':                           '14',
    'medida cautelar':                                  '13',
    'juicio oral':                                      '29',
    'juicio':                                           '29',
    'intermedia a abreviado':                           '2',
    'intermedia':                                       '2',
    'inicial con detenidos':                            '1',
    'inicial con detenido':                             '1',
    'inicial':                                          '1',
    'abreviado':                                        '55',
    'sobreseimiento':                                   '1',
    'desistimiento':                                    '2',
    'acumulacion':                                      '2',
    'separacion':                                       '2',
    'verificacion':                                     '30',
    'ejecucion':                                        '17'
  };

  const DELITO = {
    'portacion de arma de fuego de uso exclusivo':   '4',
    'portacion de armas de fuego de uso exclusivo':  '4',
    'posesion de arma de fuego de uso exclusivo':    '4',
    'portacion de arma de fuego sin licencia':       '20',
    'contra la biodiversidad':                       '17',
    'contra la salud':                               '8',
    'hidrocarburos':                                 '1',
    'recursos de procedencia ilicita':               '1',
    'operaciones con recursos':                      '1',
    'cpf':                                           '0',
    'cff':                                           '0'
  };

  const MESES = {
    'enero':'01','febrero':'02','marzo':'03','abril':'04',
    'mayo':'05','junio':'06','julio':'07','agosto':'08',
    'septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'
  };

  function norm(s){
    return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function parseFecha(txt){
    let m=txt.match(/(\d{1,2})[\/\-](\w+)[\/\-](\d{4})/);
    if(!m)return'';
    let dia=m[1].padStart(2,'0');
    let mes=isNaN(m[2])?(MESES[norm(m[2])]||'01'):m[2].padStart(2,'0');
    return m[3]+'-'+mes+'-'+dia;
  }

  function parseHora(txt){
    let m=txt.match(/(\d{1,2})[\s:](\d{2})/);
    if(!m)return'';
    return m[1].padStart(2,'0')+':'+m[2]+':01';
  }

  function parseAudiencia(txt){
    let t=norm(txt);
    let keys=Object.keys(AUDIENCIA).sort((a,b)=>b.length-a.length);
    for(let k of keys){if(t.includes(norm(k)))return AUDIENCIA[k];}
    return'1';
  }

  function parseDelito(txt){
    let t=norm(txt);
    let keys=Object.keys(DELITO).sort((a,b)=>b.length-a.length);
    for(let k of keys){if(t.includes(norm(k)))return DELITO[k];}
    return'0';
  }

  function parseEnlace(txt){
    let t=norm(txt);
    for(let k of Object.keys(ENLACE)){if(t.includes(norm(k)))return ENLACE[k];}
    return'0';
  }

  function setVal(name,val){
    let el=document.getElementsByName(name)[0];
    if(!el)return;
    el.value=val;
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function parsear(texto){
    let lineas=texto.split('\n').map(l=>l.replace(/\*/g,'').replace(/^>\s*/,'').trim()).filter(l=>l);
    let d={fecha:'',horaini:'',horafin:'',tipoAud:'1',juez:'',imputados:'',delito:'0',resolucion:'',enlace:'0'};

    // Juez
    for(let i=lineas.length-1;i>=0;i--){
      let l=lineas[i].trim().toUpperCase().replace(/[^A-Z]/g,'');
      if(JUECES[l]){d.juez=JUECES[l];break;}
    }

    // Fecha
    for(let l of lineas){
      if(norm(l).includes('fecha')){
        let m=l.match(/(\d{1,2}[\/\-]\w+[\/\-]\d{4})/);
        if(m){d.fecha=parseFecha(m[1]);break;}
      }
    }

    // Horas
    for(let l of lineas){
      let ln=norm(l);
      if(ln.includes('inici')&&l.match(/\d{1,2}[\s:]\d{2}/)){
        d.horaini=parseHora(l.match(/(\d{1,2}[\s:]\d{2})/)[0]);
      }
      if(ln.includes('finaliz')&&l.match(/\d{1,2}[\s:]\d{2}/)){
        d.horafin=parseHora(l.match(/(\d{1,2}[\s:]\d{2})/)[0]);
      }
    }

    // Tipo audiencia
    for(let l of lineas){
      let m=l.match(/\(([^)]+)\)/);
      if(m){d.tipoAud=parseAudiencia(m[1]);break;}
    }

    // Delito
    for(let l of lineas){
      if(norm(l).match(/^delito:/)){
        d.delito=parseDelito(l.replace(/^delito:\s*/i,''));break;
      }
    }

    // Imputados
    let lista=[],enImp=false;
    for(let i=0;i<lineas.length;i++){
      let l=lineas[i],ln=norm(l);
      if(ln.match(/imputad[oa]s?:/)||ln.match(/nombre.*imputad/)){
        enImp=true;
        let inline=l.replace(/^[^\:]+:\s*/,'').trim();
        if(inline)inline.split(/,\s*(?=[A-ZÁÉÍÓÚ])/).forEach(n=>{
          n=n.replace(/^[-•*\s]+/,'').trim();
          if(n.length>2)lista.push('• '+n+(n.endsWith('.')?'':'.'));
        });
        continue;
      }
      if(enImp){
        if(ln.startsWith('delito')||ln.startsWith('inici')||
           ln.startsWith('resoluc')||ln.startsWith('reporta')||
           (l.length>0&&l[0]==='*')){enImp=false;continue;}
        let nombre=l.replace(/^[-•*⁠\s]+/,'').trim();
        if(nombre&&nombre.length>2){
          nombre.split(/,\s*(?=[A-ZÁÉÍÓÚ])/).forEach(n=>{
            n=n.replace(/^[-•*\s]+/,'').trim();
            if(n.length>2)lista.push('• '+n+(n.endsWith('.')?'':'.'));
          });
        }
      }
    }
    d.imputados=lista.join(' ');

    // Resolución
    let enRes=false,resL=[];
    for(let l of lineas){
      let ln=norm(l);
      if(ln.match(/^resoluc[ií]on:/)){
        enRes=true;
        let inline=l.replace(/^[^\:]+:\s*/,'').trim();
        if(inline)resL.push(inline);
        continue;
      }
      if(enRes){
        if(ln.startsWith('reporta')||l===''){enRes=false;break;}
        resL.push(l);
      }
    }
    d.resolucion=resL.join(' ').trim();

    // Enlace seguridad
    for(let l of lineas){
      if(norm(l).includes('reporta')){d.enlace=parseEnlace(l);break;}
    }

    return d;
  }

  // ─── UI ────────────────────────────────────────────────────────────────────
  let prev=document.getElementById('_bm_popup');
  if(prev){prev.remove();return;}

  // Observer para proteger el popup
  let observer=new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      m.removedNodes.forEach(function(n){
        if(n.id==='_bm_popup'){
          document.body.appendChild(n);
        }
      });
    });
  });
  observer.observe(document.body,{childList:true,subtree:false});

  let overlay=document.createElement('div');
  overlay.id='_bm_popup';
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif';

  let box=document.createElement('div');
  box.style.cssText='background:#1e1e2e;color:#cdd6f4;border-radius:12px;padding:24px;width:540px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,0.6);box-sizing:border-box';
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <span style="color:#89b4fa;font-size:16px;font-weight:bold;">📋 Llenar Formulario de Audiencia</span>
      <button id="_bm_x" style="background:#45475a;color:#cdd6f4;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:16px;">✕</button>
    </div>
    <textarea id="_bm_txt" placeholder="Pega aquí el reporte de WhatsApp..." style="width:100%;height:190px;background:#313244;color:#cdd6f4;border:1px solid #45475a;border-radius:8px;padding:10px;font-size:13px;resize:vertical;box-sizing:border-box;outline:none;"></textarea>
    <div style="margin-top:10px;">
      <button id="_bm_ok" style="width:100%;background:#89b4fa;color:#1e1e2e;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:bold;cursor:pointer;">✅ Llenar Formulario</button>
    </div>
    <div id="_bm_st" style="margin-top:10px;font-size:12px;color:#f38ba8;min-height:16px;"></div>
    <div id="_bm_pv" style="margin-top:8px;font-size:12px;color:#a6e3a1;line-height:1.6;display:none;background:#313244;border-radius:8px;padding:10px;"></div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  setTimeout(()=>document.getElementById('_bm_txt').focus(),100);

  function cerrar(){
    observer.disconnect();
    overlay.remove();
  }

  document.getElementById('_bm_x').onclick=()=>cerrar();
  overlay.onclick=e=>{if(e.target===overlay)cerrar();};

  document.getElementById('_bm_ok').onclick=function(){
    let texto=document.getElementById('_bm_txt').value;
    let st=document.getElementById('_bm_st');
    let pv=document.getElementById('_bm_pv');
    if(!texto.trim()){st.textContent='⚠️ Pega el reporte primero.';return;}

    let d=parsear(texto);
    setVal('oj','Culiacán, Sinaloa');
    setVal('juez',d.juez);
    setVal('imputado',d.imputados);
    setVal('textareaRes',d.resolucion);
    setVal('fechac',d.fecha);
    setVal('horaini',d.horaini);
    setVal('horafin',d.horafin);
    setVal('Tipaud','2');
    setVal('aud',d.tipoAud);
    setVal('del',d.delito);
    setVal('prioridad','1');
    setVal('status','1');
    setVal('REPRO','0');
    setVal('mdelitos','0');
    setVal('jgc',d.enlace);

    st.style.color='#a6e3a1';
    st.textContent='✅ Formulario llenado. Revisa antes de guardar.';
    pv.style.display='block';
    pv.innerHTML=`
      <b>📅 Fecha:</b> ${d.fecha||'⚠️ no detectada'} &nbsp;
      <b>⏰</b> ${d.horaini||'?'} → ${d.horafin||'?'}<br>
      <b>👨‍⚖️ Juez:</b> ${d.juez||'⚠️ no detectado'}<br>
      <b>🎭 Audiencia:</b> ${d.tipoAud} &nbsp;
      <b>⚖️ Delito:</b> ${d.delito} &nbsp;
      <b>🔗 Enlace:</b> ${d.enlace}<br>
      <b>👤</b> ${d.imputados.substring(0,90)}${d.imputados.length>90?'...':''}
    `;
  };

})();
