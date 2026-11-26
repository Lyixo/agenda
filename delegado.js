(async function nbx(mode) {
  /* Campus-Dashboard für Blackboard Learn Ultra (campusvirtual.nebrija.es).
     Läuft als Lesezeichen auf der Campus-Seite und nutzt die bestehende Login-Sitzung.
     Nur Block-Kommentare verwenden: der Code wird als javascript:-URL eingebettet.
     Mit mode = { origin } läuft dieselbe Funktion in einem eigenen Pop-up-Fenster. */
  const HOST_ID = 'nbx-dash-host';
  const existing = document.getElementById(HOST_ID);
  if (existing) { existing.remove(); return; }
  const BUILD = +'1795716051' || 0;

  /* Blackboard setzt <base href> auf ein CDN, darum alle Adressen absolut bauen.
     Im Pop-up (about:blank) kommt die Campus-Adresse aus mode. */
  const POP = !!(mode && mode.origin);
  const O = POP ? mode.origin : location.origin;
  const abs = (p) => (p.startsWith('/') ? O + p : p);
  const V1 = '/learn/api/public/v1', V2 = '/learn/api/public/v2';
  const DAY = 864e5, now = Date.now();
  /* Kalender zeigt auch die letzten 40 Tage; Listen und Zähler nur Aktuelles (ab gestern). */
  const HIST = 40 * DAY, AHEAD = 15 * 7 * DAY;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('nbxdash.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('nbxdash.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  /* Wer das Dashboard gebaut hat; mit url wird der Name zum Link (z. B. LinkedIn). */
  const CREATOR = { name: 'Luca Greifenhagen', url: 'https://www.linkedin.com/in/luca-noel-greifenhagen-1770452a0' };
  const lastSeen = store.get('lastSeen', now - 7 * DAY);
  /* Abgaben, die Blackboard als abgegeben meldet, die aber noch einen Teil brauchen (in „Diese Woche“ abgewählt). */
  const reopened = store.get('reopen', {});
  for (const [k, v] of Object.entries(reopened)) if (v < now - 60 * DAY) delete reopened[k];
  const prevGrades = store.get('grades', null);
  const ui = Object.assign({ tab: 'week', course: '', onlyNew: false }, store.get('ui', {}));
  /* Früher eigene Tabs: Fristen/Live/Übersicht stecken jetzt in „Diese Woche“, Ankündigungen/Inhalte/Noten/Foren in „Neu“. */
  const LEGACY = { overview: 'week', deadlines: 'week', live: 'week', announcements: 'inbox', contents: 'inbox', grades: 'inbox', discussions: 'inbox' };
  /* Gewählte Woche und offene Fach-Seite gelten nur bis zum Schließen; das automatische Neuladen behält sie. */
  if (!window.__nbxKeep) { ui.wlSel = null; ui.detail = null; }
  delete window.__nbxKeep;
  if (LEGACY[ui.tab]) { if (LEGACY[ui.tab] === 'inbox') ui.inbox = ui.tab; ui.tab = LEGACY[ui.tab]; }

  /* Sprache: Texte stehen auf Deutsch im Code; tr() setzt sie für Spanisch um. Standard kommt aus dem Build (de). */
  const LANG = ui.lang || ('de'.length === 2 ? 'de' : 'de');
  const LOC = LANG === 'de' ? 'de-DE' : 'es-ES';
  const ES = {
    '📄 Laut Kursdokument': '📄 Según documento del curso',
    '🔗 Laut Kurs-Eintrag': '🔗 Según el curso',
    'Zeitplan der Lehrkraft (oft ein Bild oder PDF, das das Dashboard nicht lesen kann)': 'Calendario del profesor/a (a menudo una imagen o PDF que el panel no puede leer)',
    'Ohne Frist': 'Sin fecha límite',
    'ohne Frist': 'sin fecha',
    'Ohne Frist ({n})': 'Sin fecha límite ({n})',
    '📝 Ohne Frist, noch offen ({n})': '📝 Sin fecha límite, pendientes ({n})',
    'Tests und Aufgaben ohne Abgabedatum, z. B. Autoevaluaciones. Sobald du sie abgibst, verschwinden sie hier.': 'Tests y tareas sin fecha de entrega, p. ej. autoevaluaciones. Cuando las entregues, desaparecen de aquí.',
    '📢 Laut Ankündigung': '📢 Según el anuncio',
    '📢 Aus Ankündigung': '📢 Del anuncio',
    'laut Ankündigung': 'según el anuncio',
    'Neu': 'Novedades',
    'Alles': 'Todo',
    'Dateien': 'Archivos',
    'Letzte 7 Tage': 'Últimos 7 días',
    'Älter': 'Anteriores',
    'Gestern': 'Ayer',
    'Hier ist noch nichts.': 'Aquí todavía no hay nada.',
    'Ältere zeigen ({n})': 'Mostrar anteriores ({n})',
    'Allgemeine Kurse ({n})': 'Cursos generales ({n})',
    'Ankündigungen und Foren der letzten 60 Tage, Dateien der letzten 30 Tage. Ältere Dateien findest du über die Suche oder auf der Fach-Seite.': 'Anuncios y foros de los últimos 60 días, archivos de los últimos 30 días. Los archivos anteriores están en el buscador o en la página de la asignatura.',
    'Die nächsten 6 Wochen': 'Las próximas 6 semanas',
    'Klick auf eine Woche zeigt sie unten': 'Pulsa una semana para verla abajo',
    'Nächste Session: ': 'Próxima sesión: ',
    'alle ({n}) ▾': 'todas ({n}) ▾',
    '🎬 Vorbei · Aufzeichnungen': '🎬 Pasadas · grabaciones',
    '← zurück zu den nächsten 7 Tagen': '← volver a los próximos 7 días',
    'Alles zu „{x}“ zeigen': 'Ver todo de «{x}»',
    'Im Campus öffnen ↗': 'Abrir en el campus ↗',
    'Alles zu diesem Fach →': 'Todo de esta asignatura →',
    'Alle zeigen ({n})': 'Mostrar todo ({n})',
    '← Alle Fächer': '← Todas las asignaturas',
    '🎬 Aufzeichnungen ↗': '🎬 Grabaciones ↗',
    'Abgaben': 'Entregas',
    'Alles abgegeben 🎉': 'Todo entregado 🎉',
    'Keine Abgaben eingetragen.': 'No hay entregas.',
    'Vergangene Abgaben ({n})': 'Entregas pasadas ({n})',
    '📧 Uni-Mail': '📧 Correo',
    'erledigt': 'hecho',
    'vorbei': 'finalizada',
    'abgegeben': 'entregado',
    'Vorbei': 'Finalizada',
    '🎬 Aufzeichnung': '🎬 Grabación',
    '🎬 Aufzeichnungen': '🎬 Grabaciones',
    'Aufzeichnung: {x}': 'Grabación: {x}',
    '🎬 Vergangene Sessions & Aufzeichnungen ({n})': '🎬 Sesiones pasadas y grabaciones ({n})',
    'Ein Klick öffnet die Aufzeichnungen des Fachs in Collaborate. Ob eine Session aufgezeichnet wurde, zeigt erst Collaborate.': 'Un clic abre las grabaciones de la asignatura en Collaborate. Si una sesión se grabó o no, solo lo muestra Collaborate.',
    '💬 Neues Feedback': '💬 Comentario nuevo',
    '💬 Feedback': '💬 Comentario',
    'Ganzes Feedback lesen': 'Leer comentario completo',
    '💬 = Feedback deiner Lehrkraft, aufklappen zum Lesen.': '💬 = comentario de tu profesor/a; despliégalo para leerlo.',
    'Sobald eine Lehrkraft Feedback zu einer Note schreibt, steht es hier.': 'Cuando un profesor/a escriba un comentario sobre una nota, aparecerá aquí.',
    'Nächste Woche': 'Semana que viene',
    'ab {d}': 'desde {d}',
    'Abgaben pro Woche': 'Entregas por semana',
    'Klick auf eine Woche zeigt ihre Abgaben': 'Pulsa una semana para ver sus entregas',
    'Keine Abgaben': 'Sin entregas',
    'offen': 'pendientes',
    'abgegeben / erledigt': 'entregadas / hechas',
    '🔍 Suchen …': '🔍 Buscar…',
    'Sucht in allen Fächern (Taste /)': 'Busca en todas las asignaturas (tecla /)',
    'Fristen & Termine': 'Entregas y eventos',
    'Eigene Termine': 'Eventos propios',
    'Dateien & Inhalte': 'Archivos y contenidos',
    'Noten & Feedback': 'Calificaciones y comentarios',
    '{n} Treffer für „{q}“': '{n} resultados para «{q}»',
    'Nichts gefunden für „{q}“': 'No se encontró nada para «{q}»',
    'Suche beenden': 'Cerrar búsqueda',
    '+ {n} weitere – Suche genauer machen': '+ {n} más: afina la búsqueda',
    'Durchsucht alle Fächer: Titel, Ankündigungstexte, Feedback und Foren. Ankündigungen und Foren der letzten 60 Tage.': 'Busca en todas las asignaturas: títulos, textos de anuncios, comentarios y foros. Anuncios y foros de los últimos 60 días.',
    'Neu: {x}': 'Nuevo: {x}',
    'Erstellt von': 'Creado por',
    'Aus dem Kursplan, den du eingetragen hast': 'Del plan de la asignatura que añadiste',
    'Eigene Frist': 'Entrega propia',
    '1 Ankündigung': '1 anuncio',
    '1 Inhalt': '1 contenido',
    '1 Note': '1 calificación',
    'Aktionen für dieses Fach': 'Acciones de esta asignatura',
    'Gerade nichts offen': 'Nada pendiente ahora',
    'Hola {name} · neu seit deinem letzten Besuch am {d}': 'Hola {name} · novedades desde tu última visita ({d})',
    'Mehr': 'Más',
    'bis': 'hasta',
    '{n} Noten': '{n} calificaciones',
    '{n} von {m} abgegeben': '{n} de {m} entregadas',
    '1. Semester': '1.er semestre',
    '2. Semester': '2.º semestre',
    'Allgemein': 'General',
    'Ganzjährig': 'Anual',
    'Teil abgegeben, weitere Abgabe offen': 'Parte entregada, falta otra entrega',
    'Von Blackboard als abgegeben erkannt – abwählen, wenn noch ein Teil fehlt': 'Blackboard la detecta como entregada: desmárcala si aún falta una parte',
    'Weitere Kurse': 'Otros cursos',
    '(ausgeblendet)': '(oculta)',
    'Allgemein ({n})': 'General ({n})',
    'Allgemeine Kurse': 'Cursos generales',
    'Als Fach markieren': 'Marcar como asignatura',
    'Als allgemein markieren': 'Marcar como general',
    'Ausblenden': 'Ocultar',
    'Ausgeblendet ({n})': 'Ocultas ({n})',
    'Ausgeblendete Kurse verschwinden aus allen Ansichten. „Allgemein“ trennt Sammelkurse wie das Repositorio von deinen Fächern.': 'Las asignaturas ocultas desaparecen de todas las vistas. «General» separa cursos colectivos como el Repositorio de tus asignaturas.',
    'Einblenden': 'Mostrar',
    'Fächer': 'Asignaturas',
    'Ganzen Text lesen': 'Leer texto completo',
    'Keine Ankündigungen aus deinen Fächern.': 'No hay anuncios de tus asignaturas.',
    'Keine Fächer sichtbar.': 'No hay asignaturas visibles.',
    'Nur dieses Fach': 'Solo esta asignatura',
    '{n} Ankündigungen': '{n} anuncios',
    '{n} Inhalte': '{n} contenidos',
    'Alles erledigt 🎉': '¡Todo hecho! 🎉',
    'Als erledigt abhaken': 'Marcar como hecho',
    'Diese Woche': 'Esta semana',
    'Erledigte ausblenden': 'Ocultar hechas',
    'Hinzufügen': 'Añadir',
    'Häkchen gelten nur in diesem Browser.': 'Las marcas se guardan solo en este navegador.',
    'Neue Aufgabe, z. B. „Lektüre Tema 3 Do“ oder „Forum schreiben morgen 20:00“': 'Nueva tarea, p. ej. «Lectura Tema 3 jueves» o «Escribir en el foro mañana 20:00»',
    'Nichts geplant in den nächsten 7 Tagen.': 'Nada previsto en los próximos 7 días.',
    '{n} von {m} erledigt': '{n} de {m} hechas',
    ' Jetzt laut Kursplan': ' Ahora según el plan',
    ' LIVE · Raum läuft': ' EN DIRECTO · sala abierta',
    ' LIVE': ' EN DIRECTO',
    ' NEU': ' NUEVO',
    ' Raum offen · Start ': ' Sala abierta · inicio ',
    ' abgegeben': ' entregadas',
    ' neu': ' nuevas',
    ' weitere': ' más',
    ' · geändert': ' · modificado',
    ' · lädt alle 5 Min. neu · Esc schließt': ' · se actualiza cada 5 min · Esc cierra',
    ' überfällig': ' vencidas',
    ' – bitte ⟳ klicken.': ' – pulsa ⟳.',
    ' (nur gefiltertes Fach)': ' (solo la asignatura filtrada)',
    '(ohne Titel)': '(sin título)',
    '). Bitte im Campus einloggen und das Lesezeichen erneut klicken.': '). Inicia sesión en el campus y vuelve a pulsar el marcador.',
    '). Ich öffne den Kurs – dort unter „Videoconferencias“ beitreten.': '). Abro la asignatura: únete allí en «Videoconferencias».',
    '+ Termin': '+ Evento',
    'Abgabe': 'Entrega',
    'Abgegebene ausblenden': 'Ocultar entregadas',
    'Alle Ankündigungen →': 'Todos los anuncios →',
    'Alle Einträge jedes Tages zeigen': 'Mostrar todas las entradas de cada día',
    'Alle Einträge zeigen': 'Mostrar todas las entradas',
    'Alle Fristen →': 'Todas las entregas →',
    'Alle Kurse': 'Todas las asignaturas',
    'Alles als gesehen markieren': 'Marcar todo como visto',
    'Als Nächstes fällig': 'Próximas entregas',
    'An diesem Tag ist nichts eingetragen.': 'No hay nada este día.',
    'Ankündigung': 'Anuncio',
    'Ankündigungen': 'Anuncios',
    'Aufgabe': 'Tarea',
    'Beitreten hat nicht geklappt (': 'No se pudo unir (',
    'Beitritt ab ': 'Acceso desde ',
    'Bewertung': 'Calificación',
    'Das Pop-up wurde blockiert. Bitte Pop-ups für campusvirtual.nebrija.es erlauben und erneut klicken.': 'Se bloqueó la ventana emergente. Permite las ventanas emergentes para campusvirtual.nebrija.es y vuelve a pulsar.',
    'Datei': 'Archivo',
    'Dokument': 'Documento',
    'Eigener Termin': 'Evento propio',
    'Eintragen': 'Añadir',
    'Foren': 'Foros',
    'Forum': 'Foro',
    'Frist offen': 'Entrega pendiente',
    'Fristen': 'Entregas',
    'Heute': 'Hoy',
    'Ich habe keinen Titel erkannt – schreib z. B. „Lernen Fundamentos morgen 18:00“.': 'No he reconocido un título. Escribe p. ej. «Estudiar Fundamentos mañana 18:00».',
    'In eigenem Fenster öffnen (auf andere Bildschirme ziehbar)': 'Abrir en ventana propia (se puede mover a otra pantalla)',
    'Inhalt': 'Contenido',
    'Inhalte': 'Contenidos',
    'Jetzt neu laden': 'Actualizar ahora',
    'Jetzt': 'Ahora',
    'Kalender': 'Calendario',
    'Keine Ankündigungen in den letzten 60 Tagen.': 'No hay anuncios en los últimos 60 días.',
    'Keine Foren.': 'No hay foros.',
    'Keine Fristen gefunden.': 'No hay entregas.',
    'Keine Live-Sessions geplant.': 'No hay sesiones en directo programadas.',
    'Keine neuen Inhalte in den letzten 30 Tagen.': 'No hay contenidos nuevos en los últimos 30 días.',
    'Kurs öffnen': 'Abrir asignatura',
    'Kurse konnten nicht geladen werden (': 'No se pudieron cargar las asignaturas (',
    'Lade deine Kurse …': 'Cargando tus asignaturas…',
    'Lade …': 'Cargando…',
    'Laut Kursplan': 'Según el plan',
    'Link': 'Enlace',
    'Live-Session': 'Sesión en directo',
    'Live-Sessions': 'Sesiones en directo',
    'Mein Campus': 'Mi Campus',
    'Morgen': 'Mañana',
    'NEU': 'NUEVO',
    'Neu für dich': 'Novedades para ti',
    'Neue Ankündigungen': 'Anuncios nuevos',
    'Neue Dateien & Inhalte': 'Archivos y contenidos nuevos',
    'Neuer Termin, z. B. „Lernen Fundamentos morgen 18:00“ oder „Gruppentreffen Fr 10-12“': 'Nuevo evento, p. ej. «Estudiar Fundamentos mañana 18:00» o «Reunión de grupo viernes 10-12»',
    'Nicht abgegeben': 'No entregado',
    'Nicht eingeloggt oder keine Berechtigung (': 'No has iniciado sesión o no tienes permiso (',
    'Nichts Neues seit deinem letzten Besuch.': 'Nada nuevo desde tu última visita.',
    'Nichts Offenes in den nächsten 7 Tagen 🎉': 'Nada pendiente en los próximos 7 días 🎉',
    'Noch keine Noten.': 'Todavía no hay calificaciones.',
    'Note': 'Nota',
    'Noten': 'Calificaciones',
    'Nur Neues': 'Solo novedades',
    'Nächste 7 Tage': 'Próximos 7 días',
    'Nächster Monat': 'Mes siguiente',
    'Offene Fristen (7 Tage)': 'Entregas pendientes (7 días)',
    'Pro Tag nur 3 Einträge zeigen': 'Mostrar solo 3 entradas por día',
    'Schließen (Esc)': 'Cerrar (Esc)',
    'Seite': 'Página',
    'Später': 'Más adelante',
    'Tag': 'Día',
    'Termin löschen': 'Eliminar evento',
    'Termin': 'Evento',
    'Test': 'Test',
    'Tipp: In Outlook unter Einstellungen → Allgemein → Benachrichtigungen die Desktopbenachrichtigungen einschalten, dann meldet sich jede neue Uni-Mail sofort.': 'Consejo: en Outlook, en Configuración → General → Notificaciones, activa las notificaciones de escritorio y te avisará de cada correo nuevo de la universidad.',
    'Titel': 'Título',
    'Tool': 'Herramienta',
    'Uni': 'Universidad',
    'Verbinde mit „': 'Conectando con «',
    'Verbinde …': 'Conectando…',
    'Vergangen': 'Pasado',
    'Version 26.11. 19:00 · Stand ': 'Versión 26.11. 19:00 · actualizado ',
    'Video': 'Vídeo',
    'Videokonferenz': 'Videoconferencia',
    'Vorheriger Monat': 'Mes anterior',
    'Ziehen zum Verschieben · Doppelklick zentriert': 'Arrastra para mover · doble clic para centrar',
    'Zuletzt abgegeben: ': 'Última entrega: ',
    'Zurück in den Campus-Tab': 'Volver a la pestaña del campus',
    'alle Kurse zeigen': 'mostrar todas las asignaturas',
    'ganztägig': 'todo el día',
    'keine Adresse erhalten': 'no se recibió ninguna dirección',
    'Öffnen: ': 'Abrir: ',
    'Überfällig': 'Vencido',
    'Übernächste Woche': 'En dos semanas',
    'Übersicht': 'Resumen',
    'überfällig': 'vencido',
    '„Laut Kursplan“ = aus deinen Terminen. Sobald Blackboard dafür einen Collaborate-Raum anlegt, steht hier ▶ Beitreten.': '«Según el plan» = de tus eventos. En cuanto Blackboard cree la sala de Collaborate, aparecerá ▶ Unirse.',
    '⏳ Begonnen, nicht abgegeben': '⏳ Empezado, sin entregar',
    '▶ Beitreten': '▶ Unirse',
    '▶ Zum Kurs': '▶ A la asignatura',
    '✓ Abgegeben': '✓ Entregado',
    '⤡ Kompakt': '⤡ Compacto',
    '⤢ Alles zeigen': '⤢ Mostrar todo',
    '📧 Benachrichtigungen': '📧 Notificaciones',
    '📧 Uni-Mails in Outlook öffnen': '📧 Abrir el correo de la universidad en Outlook',
    '🔎 Filter aktiv: nur „': '🔎 Filtro activo: solo «',
    '🗑 Gelöscht: ': '🗑 Eliminado: ',
    ' · {n} Versuche': ' · {n} intentos',
    ' · {n}/{m} Versuche': ' · {n}/{m} intentos',
    ' · 0/{m} Versuche': ' · 0/{m} intentos',
    '+ {n} weitere in den Tabs': '+ {n} más en las pestañas',
    'In {n} Kurs(en) nicht abrufbar': 'No disponible en {n} asignatura(s)',
    '✓ {n} bereits abgegeben': '✓ {n} ya entregadas',
    '✓ Eingetragen: {x}': '✓ Añadido: {x}',
    '{n} kommende Blackboard-Sessions geladen': '{n} próximas sesiones de Blackboard cargadas',
    'heute {t}': 'hoy {t}',
    'morgen {t}': 'mañana {t}',
    'in {n} Tagen': 'en {n} días',
    'gestern': 'ayer',
    'vor {n} Tagen': 'hace {n} días',
    'Sprache: Deutsch → Español': 'Idioma: Español → Deutsch'
  };
  const tr = (s, v) => ((LANG === 'es' && ES[s]) || s).replace(/\{(\w+)\}/g, (m, k) => (v && k in v ? v[k] : m));

  /* Eigenes Fenster: lässt sich wie jedes Browser-Fenster auf andere Bildschirme ziehen.
     Der Code läuft dort in der Realm des Pop-ups weiter, auch wenn der Campus-Tab navigiert. */
  const runIn = (win, arg) => {
    const s = win.document.createElement('script');
    s.textContent = '(' + nbx.toString() + ')(' + (arg ? JSON.stringify(arg) : '') + ')';
    win.document.body.append(s);
  };
  const openPopup = (quiet) => {
    const g = store.get('popwin', { x: screenX + 60, y: screenY + 60, w: 1040, h: 780 });
    const win = window.open('', 'nbxCampus', `popup=yes,left=${g.x},top=${g.y},width=${g.w},height=${g.h}`);
    if (!win) { if (!quiet) alert(tr('Das Pop-up wurde blockiert. Bitte Pop-ups für campusvirtual.nebrija.es erlauben und erneut klicken.')); return false; }
    win.document.open();
    win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Mein Campus</title></head><body style="margin:0"></body></html>');
    win.document.close();
    runIn(win, { origin: O });
    win.focus();
    return true;
  };
  /* Über die Erweiterung gestartet und das Pop-up blockiert: dann eben im Tab anzeigen statt einer Fehlermeldung. */
  if (!POP && ui.popout && openPopup(!!window.__nbxExt)) return;

  const get = async (path) => {
    /* no-store: nie eine zwischengespeicherte Antwort nehmen, immer frisch vom Campus. */
    const r = await fetch(abs(path), { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  };
  const all = async (path, max = 1000) => {
    let out = [], next = path;
    while (next && out.length < max) {
      const j = await get(next);
      out = out.concat(j.results || []);
      next = j.paging && j.paging.nextPage;
    }
    return out;
  };
  const pool = async (items, n, fn) => {
    let i = 0;
    await Promise.all(Array.from({ length: n }, async () => {
      while (i < items.length) { const it = items[i++]; try { await fn(it); } catch (e) {} }
    }));
  };
  const ts = (s) => (s ? Date.parse(s) : 0);
  const iso = (t) => new Date(t).toISOString();
  const plain = (html, max = 300) => {
    if (!html) return '';
    const t = new DOMParser().parseFromString(String(html), 'text/html').body.textContent || '';
    const s = t.replace(/\s+/g, ' ').trim();
    return s.length > max ? s.slice(0, max) + '…' : s;
  };
  /* Termine aus Ankündigungstexten: „La tutoría será el jueves 12 de noviembre a las 18:30“, „clases 10 y 17 de noviembre, 18:00-19:30“,
     „Videoconferencia 12/11 a las 18h“. Nur Sätze mit Wörtern wie Clase, Sesión, Tutoría, Examen; ohne Uhrzeit nur Prüfungen. */
  /* Ankündigungstext mit Zeilenumbrüchen: Absätze, Listenpunkte und Tabellenzeilen bleiben getrennt, Tabellenzellen mit „ | “. */
  const htmlLines = (html) => {
    const t = String(html || '').replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\/\s*(p|li|tr|div|h\d|ul|ol|table)\s*>/gi, '\n').replace(/<\/\s*t[dh]\s*>/gi, ' | ');
    return new DOMParser().parseFromString(t, 'text/html').body.textContent || '';
  };
  /* PARSE-START: wird beim Build auch in die Erweiterung kopiert (extension/parse.js). Braucht nur DAY. */
  const MONTHS = { enero: 0, ene: 0, januar: 0, febrero: 1, feb: 1, februar: 1, marzo: 2, mar: 2, 'märz': 2, abril: 3, abr: 3, april: 3, mayo: 4, may: 4, mai: 4,
    junio: 5, jun: 5, juni: 5, julio: 6, jul: 6, juli: 6, agosto: 7, ago: 7, august: 7, septiembre: 8, setiembre: 8, sep: 8, sept: 8, september: 8,
    octubre: 9, oct: 9, oktober: 9, noviembre: 10, nov: 10, november: 10, diciembre: 11, dic: 11, dezember: 11 };
  const SES_RE = /\b(videoconferencias?|monogr[aá]ficos?|sesi[oó]n(?:es)?|clases?|tutor[ií]as?|webinars?|masterclass|seminarios?|encuentros?|conferencias?|directos?|examen(?:es)?|ex[aá]menes|prueba|vorlesung|termin)\b/i;
  const parseDates = (text, ref) => {
    const out = [];
    const base = new Date(ref);
    const mkDate = (d, m, y) => {
      const yy = y != null ? (y < 100 ? 2000 + y : y) : base.getFullYear();
      let t = +new Date(yy, m, d);
      if (y == null && t < ref - 60 * DAY) t = +new Date(yy + 1, m, d);
      return new Date(t).getDate() === d ? t : 0;
    };
    const monthAlt = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');
    /* Datum: „12 de noviembre“, „17 y 24 de noviembre“, „10 nov.“ oder „19/11“ (nur mit Schrägstrich, damit „Tema 2.3“ kein Datum ist). */
    const dateRe = new RegExp('(?:\\b(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\\s*,?\\s*)?(?:(?:el|d[ií]a|los d[ií]as)\\s+)?' +
      '\\b((?:\\d{1,2}\\s*(?:,|y|e)\\s*)*\\d{1,2})\\.?\\s+(?:de\\s+)?(' + monthAlt + ')\\.?(?:\\s+(?:de\\s+)?(\\d{4}))?\\b' +
      '|\\b(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?\\b', 'gi');
    const timeRe = /\b(?:a\s+las\s+|las\s+|um\s+|de\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(h\b|horas|hrs|uhr)?(?:\s*(?:-|–|a|hasta)\s*(?:las\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(?:h\b|horas|hrs|uhr)?)?/gi;
    const findTime = (str) => {
      timeRe.lastIndex = 0;
      let tm;
      while ((tm = timeRe.exec(str))) {
        const hh = +tm[1];
        if (hh > 23 || (tm[2] != null && +tm[2] > 59)) continue;
        if (tm[2] == null && !tm[3] && !/las|um/i.test(tm[0])) continue;
        const end = tm[4] != null && +tm[4] <= 23 && +tm[4] > hh ? [+tm[4], +(tm[5] || 0)] : null;
        return { h: hh, m: +(tm[2] || 0), end };
      }
      return null;
    };
    const sentences = String(text).split(/\n+/).flatMap((l) => l.split(/(?<=[.!?;])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/));
    for (const sent of sentences) {
      if (!SES_RE.test(sent)) continue;
      const found = [];
      let m;
      dateRe.lastIndex = 0;
      while ((m = dateRe.exec(sent))) {
        const days = m[2] ? m[1].match(/\d{1,2}/g).map((d) => mkDate(+d, MONTHS[m[2].toLowerCase()], m[3] ? +m[3] : null))
          : +m[5] >= 1 && +m[5] <= 12 ? [mkDate(+m[4], +m[5] - 1, m[6] ? +m[6] : null)] : [];
        if (days.some(Boolean)) found.push({ days: days.filter(Boolean), a: m.index, b: m.index + m[0].length });
      }
      /* Jedes Datum gehört zu seinem Abschnitt (bis zum nächsten Datum). Nur wenn dort Clase, Sesión, Tutoría … steht, ist es ein Termin;
         sonst bekäme in Listen wie „Actividad 1: 8 de noviembre · Videoconferencia: 12 de noviembre“ jedes Datum das Wort Videoconferencia. */
      found.forEach((f, k) => {
        const segA = k ? found[k - 1].b : 0, segB = k < found.length - 1 ? found[k + 1].a : sent.length;
        const kw = SES_RE.exec(sent.slice(segA, segB));
        if (!kw) return;
        const exam = /exam|prueba/i.test(kw[1]);
        const tm = findTime(sent.slice(f.b, segB)) || findTime(sent.slice(segA, f.a));
        if (!tm && !exam) return;
        const label = kw[1].charAt(0).toUpperCase() + kw[1].slice(1).toLowerCase();
        for (const day of f.days) {
          if (day < startOfDayOf(ref) - DAY) continue;
          const start = tm ? +new Date(new Date(day).setHours(tm.h, tm.m, 0, 0)) : day;
          const end = tm && tm.end ? +new Date(new Date(day).setHours(tm.end[0], tm.end[1], 0, 0)) : null;
          out.push({ start, end, allDay: !tm, label, exam, text: sent.trim().slice(0, 240) });
        }
      });
    }
    return out;
  };
  const startOfDayOf = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };
  /* Text aus PDFs und Bildern (Kalender, Cronograma): oft steht der Titel in einer Zeile und das Datum in der nächsten
     („EXAMEN Evaluación ordinaria …“ / „Fecha de entrega: 15/11/26 19:00“) oder ein Datum als Überschrift über mehreren Einträgen.
     Solche Zeilen werden zusammengeführt und dann wie Ankündigungstext gelesen. */
  const DATE_ANY = /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b|\b\d{1,2}\s+(?:de\s+)?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i;
  const parseDocLines = (lines, ref) => {
    const L = lines.map((l) => String(l).replace(/\s+/g, ' ').trim()).filter(Boolean);
    const out = [];
    let header = '', headerAge = 99;
    for (let i = 0; i < L.length; i++) {
      const line = L[i], hasKw = SES_RE.test(line), hasDate = DATE_ANY.test(line);
      /* Überschrift = nur ein Datum ohne Uhrzeit („domingo - 15 de noviembre de 2026“), keine Zeile wie „15/11 → 23:59h → Aportación 1“. */
      if (hasDate && !hasKw) { if (!/\d{1,2}[:.]\d{2}|\b\d{1,2}\s*h\b/i.test(line) && line.length < 60) { header = line; headerAge = 0; } continue; }
      headerAge++;
      if (!hasKw) continue;
      if (hasDate) { out.push(line); continue; }
      /* Titel ohne Datum: nächste Zeile mit Datum (ohne eigenes Stichwort) dazunehmen, sonst die Datums-Überschrift darüber. */
      const nx = L[i + 1] || '';
      if (DATE_ANY.test(nx) && !SES_RE.test(nx)) { out.push(line + ' · ' + nx); i++; }
      else if (header && headerAge <= 6 && !DATE_ANY.test(nx)) out.push(header + ' · ' + line);
    }
    return parseDates(out.join('\n'), ref);
  };
  /* Nachhol-Test für eine andere Person: gleicher Name wie ein vorhandener Test plus „EXTRA …“/„Recuperación …“
     (z. B. „FDP.Test Autoevaluación 1. EXTRA KAROLL“). Liefert den Namen des Original-Tests oder ''. */
  const extraBase = (name, names) => {
    const n = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const me = n(name);
    if (!/\b(extra|recuperacion|repesca|ampliacion)\b/.test(me)) return '';
    let best = '';
    for (const o of names) {
      const b = n(o);
      if (!b || b === me || !me.startsWith(b) || /[a-z0-9]/.test(me.charAt(b.length))) continue;
      if (!/\b(extra|recuperacion|repesca|ampliacion)\b/.test(me.slice(b.length))) continue;
      if (b.length > n(best).length) best = o;
    }
    return best;
  };
  /* PARSE-END */
  if (window.__nbxTest) { window.__nbxTest.parseDates = parseDates; window.__nbxTest.parseDocLines = parseDocLines; }
  const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };
  const today = startOfDay(now);
  const fmtDate = (t) => new Date(t).toLocaleDateString(LOC, { weekday: 'short', day: '2-digit', month: '2-digit' });
  const fmtTime = (t) => new Date(t).toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
  const fmtAgo = (t) => {
    const d = Math.floor((today - startOfDay(t)) / DAY);
    return d <= 0 ? tr('heute {t}', { t: fmtTime(t) }) : d === 1 ? tr('gestern') : d < 7 ? tr('vor {n} Tagen', { n: d }) : fmtDate(t);
  };
  const rel = (t) => {
    if (t < now) return tr('überfällig');
    const d = Math.round((startOfDay(t) - today) / DAY);
    return d === 0 ? tr('heute {t}', { t: fmtTime(t) }) : d === 1 ? tr('morgen {t}', { t: fmtTime(t) }) : tr('in {n} Tagen', { n: d });
  };
  /* "2026-27_1S_M0060005_ESQUEMA DEL CONOCIMIENTO_T_10-02" -> { name: "Esquema del conocimiento", sem: "1S" } */
  const parseName = (raw) => {
    const m = /^\d{4}-\d{2}_([^_]+)_[^_]+_(.+?)(?:_T_[\w-]+)?$/.exec(raw || '');
    /* sonst Präfixe wie "26-27.M006. Octubre 26. " oder "26.27. " entfernen */
    let name = m ? m[2] : (raw || '').replace(/^\d{2}[-.]\d{2}\.\s*(?:M\d+\.\s*)?(?:\p{L}+\s\d{2}\.\s*)?/u, '');
    if (name === name.toUpperCase()) name = name.toLowerCase().replace(/(^|[:.]\s*)(\p{L})/gu, (s, p, ch) => p + ch.toUpperCase())
      .replace(/\b(pmp|pmi|efqm|tfm|tfg|ia|kpi|erp|ods|tic|i{1,3}|iv|vi{0,3}|ix)\b/g, (s) => s.toUpperCase());
    return { name, sem: m ? m[1] : '' };
  };
  const h = (tag, props, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v != null && v !== false) el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k.nodeType ? k : String(k));
    return el;
  };

  const host = h('div', { id: HOST_ID });
  host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'open' });
  root.append(h('style', {}, `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .wrap { position: fixed; display: flex; flex-direction: column; overflow: hidden; resize: both;
      min-width: 360px; min-height: 240px; max-width: calc(100vw - 8px); max-height: calc(100vh - 8px);
      font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .scroll { flex: 1; overflow: auto; padding: 0 24px 18px; }
    .wrap.drag { user-select: none; opacity: .96; }
    .wrap.pop { position: static; width: 100vw; height: 100vh; max-width: none; max-height: none; min-width: 0;
      border: 0; border-radius: 0; box-shadow: none; resize: none; }
    .wrap.pop header { cursor: default; }
    .hbtns { display: flex; gap: 6px; }
    .banner { border: 1px solid var(--bad); background: var(--badbg); border-radius: 12px; padding: 2px 14px; margin-top: 14px; }
    .join { flex: none; background: var(--bad); color: #fff; border-color: var(--bad); font-weight: 700; }
    .join:hover { background: var(--bad); filter: brightness(1.1); }
    .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: nbxpulse 1.2s infinite; }
    @keyframes nbxpulse { 50% { opacity: .25; } }
    .tab .c.live { background: var(--bad); color: #fff; }
    .wrap { --bg:#ffffff; --fg:#161b26; --mut:#5f6b82; --faint:#8b95a8; --line:#e6e9f0; --card:#f5f7fa; --hover:#eef1f6;
      --acc:#1f5fd1; --new:#0a8a55; --warn:#b26a00; --bad:#c62f22; --badbg:#fdecea; --warnbg:#fff4e0; --okbg:#e3f5ec;
      color: var(--fg); background: var(--bg); border-radius: 16px; border: 1px solid var(--line);
      box-shadow: 0 24px 70px rgba(0,0,0,.35); }
    @media (prefers-color-scheme: dark) {
      .wrap { --bg:#14171e; --fg:#e8ebf2; --mut:#a0a9bb; --faint:#6f7a8f; --line:#262c38; --card:#1b1f28; --hover:#222835;
        --acc:#7aa7ff; --new:#3ccf8e; --warn:#f2a93b; --bad:#ff7b6e; --badbg:#3a1f1d; --warnbg:#3a2c14; --okbg:#16301f; }
    }
    button, select { font: inherit; color: var(--fg); background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    button:hover, select:hover { background: var(--hover); }
    a { color: inherit; text-decoration: none; }

    header { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; padding: 18px 24px 4px; cursor: move; touch-action: none; }
    h1 { font-size: 21px; margin: 0; letter-spacing: -.01em; }
    .sub { color: var(--mut); font-size: 13px; margin-top: 2px; }
    .x { font-size: 18px; line-height: 1; padding: 6px 11px; }
    .x.lang { font-size: 12px; font-weight: 700; padding: 6px 9px; }

    .tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 18px 0 16px; }
    .tile { text-align: left; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
    .tile .num { font-size: 26px; font-weight: 700; line-height: 1.1; }
    .tile .lbl { color: var(--mut); font-size: 12.5px; margin-top: 2px; }
    .tile .extra { font-size: 12px; font-weight: 600; margin-top: 4px; }
    .tile.hot { border-color: var(--bad); }
    @media (max-width: 640px) { .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

    .nav { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--line); margin-bottom: 14px; }
    .tabs { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; }
    .tabmore, .cmenu { position: relative; border-top: 0; }
    .tabmore > summary, .cmenu > summary { list-style: none; padding: 9px 12px; }
    .tabmore > summary::before, .cmenu > summary::before { content: none; }
    .tabmore > summary::-webkit-details-marker, .cmenu > summary::-webkit-details-marker { display: none; }
    .menu { position: absolute; z-index: 5; top: calc(100% + 4px); left: 0; min-width: 190px; display: grid; gap: 2px; padding: 6px;
      background: var(--bg); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
    .menu button { text-align: left; background: none; border: 0; border-radius: 6px; padding: 7px 10px; font-weight: 500; display: flex; justify-content: space-between; gap: 10px; }
    .menu button:hover, .menu .mi.on { background: var(--hover); }
    .cmenu { margin-left: auto; flex: none; }
    .cmenu > summary { padding: 0 6px; color: var(--mut); font-size: 18px; line-height: 1; cursor: pointer; border-radius: 6px; }
    .cmenu > summary:hover { background: var(--hover); color: var(--fg); }
    .cmenu .menu { left: auto; right: 0; }
    .facts { display: grid; gap: 6px; font-size: 13px; }
    .fact { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 8px; align-items: baseline; }
    .fi { text-align: center; font-size: 12px; }
    .ft { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    a.ft:hover { color: var(--acc); text-decoration: underline; }
    .fr { white-space: nowrap; color: var(--mut); font-size: 12px; font-weight: 600; }
    .fact.urgent .ft, .fact.urgent .fr { color: var(--bad); font-weight: 600; }
    .fact.soon .fr { color: var(--warn); }
    .fact.fresh { color: var(--new); font-weight: 600; }
    .fnone { color: var(--faint); font-size: 12.5px; }
    .tab { background: none; border: 0; border-bottom: 2px solid transparent; border-radius: 0; padding: 9px 12px; color: var(--mut); font-weight: 600; white-space: nowrap; }
    .tab:hover { background: none; color: var(--fg); }
    .tab.on { color: var(--fg); border-bottom-color: var(--acc); }
    .tab .c { font-size: 11px; font-weight: 700; margin-left: 5px; padding: 1px 6px; border-radius: 999px; background: var(--card); color: var(--mut); }
    .tab .c.n { background: var(--new); color: #fff; }
    .tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-bottom: 8px; }
    .tools select { max-width: 260px; }
    .filterbar { margin-top: 14px; padding: 8px 12px; border-radius: 10px; background: var(--warnbg); color: var(--warn); font-weight: 600; font-size: 13px; }
    label { display: inline-flex; gap: 6px; align-items: center; cursor: pointer; color: var(--mut); font-size: 13px; }

    .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; align-items: start; }
    .hint { color: var(--mut); font-size: 12.5px; padding: 6px 0 8px; }
    .outlook { display: block; text-align: center; background: var(--acc); color: #fff; font-weight: 700; border-radius: 10px; padding: 10px 12px; margin: 2px 0 4px; }
    .outlook:hover { filter: brightness(1.08); }
    .form { display: flex; gap: 8px; flex-wrap: wrap; padding: 4px 0 10px; }
    .inp { flex: 1; min-width: 160px; font: inherit; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
    .inp.time { flex: 0 0 auto; min-width: 0; width: 110px; }
    .calmsg { font-size: 12.5px; font-weight: 600; margin: -2px 0 10px; }
    .calmsg.ok { color: var(--new); } .calmsg.bad { color: var(--bad); }
    .calhead { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 4px 0 8px; }
    .calhead b { font-size: 15px; text-transform: capitalize; }
    .grid7 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
    .dow { font-size: 11px; font-weight: 700; color: var(--faint); text-align: center; text-transform: uppercase; padding: 2px 0; }
    .day { text-align: left; min-height: 86px; padding: 4px 5px; display: flex; flex-direction: column; gap: 2px; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    .day:hover { background: var(--hover); }
    .day.other { opacity: .45; }
    .day.sel { outline: 2px solid var(--acc); outline-offset: -2px; }
    .dn { font-size: 12px; font-weight: 700; align-self: flex-start; padding: 0 5px; border-radius: 999px; }
    .day.today .dn { background: var(--acc); color: #fff; }
    .ev { display: block; font-size: 11px; line-height: 1.35; border-radius: 4px; padding: 1px 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      background: var(--card); color: var(--fg); border-left: 3px solid var(--faint); }
    .ev.bad { border-left-color: var(--bad); } .ev.warn { border-left-color: var(--warn); } .ev.ok { border-left-color: var(--new); color: var(--mut); }
    .ev.live { border-left-color: #a855f7; } .ev.own { border-left-color: var(--acc); background: var(--hover); }
    .day { cursor: pointer; }
    a.ev:hover { text-decoration: underline; filter: brightness(1.15); }
    .more { align-self: flex-start; font-size: 10.5px; font-weight: 700; color: var(--acc); background: none; border: 0; padding: 1px 2px; }
    .more:hover { background: none; text-decoration: underline; }
    .tlink { display: block; color: var(--fg); }
    .tlink:hover { color: var(--acc); text-decoration: underline; }
    .legend { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }
    .legend .ev { display: inline-block; }
    .cgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-bottom: 14px; }
    .ccard { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; display: grid; gap: 8px; min-width: 0; }
    .ccard.quiet { opacity: .7; }
    .chead { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
    .chead i { flex: 0 0 10px; height: 10px; border-radius: 50%; }
    .cname { font-weight: 700; flex: 1; min-width: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
    .cname:hover { color: var(--acc); text-decoration: underline; }
    .hidlist summary { padding: 8px 0; }
    .hrow { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-top: 1px solid var(--line); font-size: 13px; }
    .more-text { border-top: 0; padding: 0 0 8px 40px; }
    .more-text summary { padding: 2px 0; font-size: 12.5px; color: var(--acc); font-weight: 600; }
    .fulltext { font-size: 13px; color: var(--fg); white-space: pre-wrap; padding: 6px 0; max-width: 70ch; }
    details.gen { margin-top: 12px; border-top: 1px solid var(--line); }
    details.gen > summary { color: var(--mut); }
    .wkhead { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
    .wkprog { display: grid; gap: 6px; min-width: 200px; flex: 1; }
    .pbar { height: 6px; border-radius: 6px; background: var(--line); overflow: hidden; max-width: 360px; }
    .right.rec { color: var(--acc); font-weight: 600; }
    .ev.ann { background: transparent; border: 1px dashed var(--acc); color: var(--fg); }
    button.cname { all: unset; cursor: pointer; font-weight: 700; flex: 1; min-width: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
    button.cname:focus-visible { outline: 2px solid var(--acc); border-radius: 4px; }
    .cmore { justify-self: start; font-size: 12.5px; }
    .nextses { background: var(--card); border: 1px solid var(--line); border-radius: 12px; margin: 0 0 12px; }
    .nextses > summary { list-style: none; display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; min-width: 0; }
    .nextses > summary::-webkit-details-marker { display: none; }
    .nextses[open] > summary { border-bottom: 1px solid var(--line); }
    .nextses > ul, .nextses > .group, .nextses > .hint, .nextses > .err { margin-left: 14px; margin-right: 14px; }
    .ns-main { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ns-c { color: var(--mut); }
    .ns-t { flex: none; color: var(--fg); font-weight: 600; font-size: 13px; }
    .ns-more { flex: none; color: var(--acc); font-size: 12.5px; font-weight: 600; }
    .wksel { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; margin-bottom: 4px; }
    .pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .pill { border-radius: 999px; padding: 4px 11px; font-size: 13px; color: var(--mut); background: var(--bg); }
    .pill.on { background: var(--acc); border-color: var(--acc); color: #fff; }
    .pill .c { font-size: 11px; font-weight: 700; margin-left: 5px; padding: 0 6px; border-radius: 999px; background: var(--new); color: #fff; }
    .showmore { display: block; margin: 10px auto 4px; }
    .detail .dhead { display: grid; gap: 8px; margin-bottom: 4px; }
    .detail .dhead > .link { justify-self: start; }
    .dtitle { display: flex; align-items: center; gap: 10px; }
    .dtitle i { flex: none; width: 10px; height: 10px; border-radius: 50%; }
    .dtitle h2 { margin: 0; font-size: 17px; line-height: 1.3; }
    .dlinks { display: flex; flex-wrap: wrap; gap: 8px; }
    a.btn { font-size: 13px; font-weight: 600; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 5px 10px; text-decoration: none; }
    a.btn:hover { background: var(--hover); }
    .dsec { border-top: 1px solid var(--line); margin-top: 14px; padding-top: 10px; }
    .dsec h3 { margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--faint); display: flex; gap: 8px; align-items: center; }
    .dsec .cnt { font-weight: 600; }
    footer a.mail { color: var(--mut); text-decoration: none; }
    footer a.mail:hover { color: var(--acc); }
    .pbar i { display: block; height: 100%; background: var(--new); transition: width .2s; }
    .wload { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px 8px; margin: 0 0 12px; }
    .loadhead { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; justify-content: space-between; font-size: 13px; }
    .loadhead .mut { color: var(--faint); font-size: 12px; }
    .bars { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
    .wbar { all: unset; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 2px; border-radius: 8px; min-width: 0; }
    .wbar:hover:not([disabled]), .wbar.on { background: var(--hover); }
    .wbar[disabled] { cursor: default; opacity: .55; }
    .wbar:focus-visible { outline: 2px solid var(--acc); }
    .wn { font-weight: 700; font-size: 13px; color: var(--fg); }
    .wn.warn { color: var(--warn); } .wn.bad { color: var(--bad); }
    .track { display: flex; flex-direction: column-reverse; width: 26px; height: 56px; border-radius: 6px; background: var(--card); overflow: hidden; }
    .track i, .legend2 i { display: block; width: 100%; }
    .track .k, .legend2 .k { background: var(--new); opacity: .55; }
    .track .o, .legend2 .o { background: var(--acc); }
    .track .o.warn { background: var(--warn); } .track .o.bad { background: var(--bad); }
    .wl { font-size: 11px; color: var(--mut); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .legend2 { display: flex; gap: 12px; font-size: 11.5px; color: var(--faint); margin-top: 4px; }
    .legend2 span { display: flex; align-items: center; gap: 4px; }
    .legend2 i { width: 9px; height: 9px; border-radius: 2px; }
    .loadlist { margin-top: 6px; border-top: 1px solid var(--line); }
    .tools { flex-wrap: nowrap; } .tools label { white-space: nowrap; }
    .inp.search { flex: 0 1 220px; min-width: 120px; }
    li.wk { display: flex; align-items: center; gap: 10px; }
    li.wk + li.wk { border-top: 1px solid var(--line); }
    li.wk > .row { flex: 1; min-width: 0; margin: 0; border-top: 0; }
    .chk { flex: none; width: 18px; height: 18px; accent-color: var(--new); cursor: pointer; }
    .chk:disabled { cursor: default; }
    li.wk.checked .title { text-decoration: line-through; color: var(--mut); font-weight: 500; }
    .x.del { font-size: 14px; padding: 4px 8px; opacity: .6; }
    .x.del:hover { opacity: 1; }
    @media (max-width: 600px) {
      .scroll { padding: 0 12px 14px; }
      header { padding: 14px 12px 4px; }
      .row { gap: 8px; }
      .when { flex-basis: 50px; }
      .title { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .meta { flex-wrap: wrap; row-gap: 2px; }
      .right { font-size: 12px; }
      li.wk .right { display: none; }
      .st { white-space: normal; }
      .meta .chip { max-width: 100%; }
      .tools, .tools select { width: 100%; max-width: 100%; }
      .tools { flex-wrap: wrap; } .tools .search { flex: 1 1 100%; }
      .tab, .tabmore > summary { padding: 8px 9px; }
      .cgrid { grid-template-columns: minmax(0, 1fr); }
      .menu { left: auto; right: 0; }
    }
    .daypanel { margin-top: 14px; border-top: 1px solid var(--line); padding-top: 10px; }
    .when.own { background: var(--hover); border-color: transparent; color: var(--acc); }
    .when.own .d { color: var(--acc); }
    @media (max-width: 560px) { .day { min-height: 56px; } .ev { font-size: 10px; } }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px 8px; min-width: 0; }
    .card h2 { font-size: 14px; margin: 2px 0 8px; display: flex; justify-content: space-between; align-items: center; }
    .link { background: none; border: 0; padding: 0; color: var(--acc); font-size: 13px; font-weight: 600; }
    .link:hover { background: none; text-decoration: underline; }

    .group { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--faint); margin: 14px 0 4px; }
    .group:first-child { margin-top: 2px; }
    .group.bad { color: var(--bad); }
    ul { list-style: none; margin: 0; padding: 0; }
    .row { display: flex; gap: 12px; align-items: center; padding: 8px 8px; margin: 0 -8px; border-radius: 8px; }
    a.row:hover { background: var(--hover); }
    .row + .row, li + li .row { border-top: 1px solid var(--line); }
    .when { flex: 0 0 64px; text-align: center; border-radius: 8px; padding: 4px 0; background: var(--bg); border: 1px solid var(--line); }
    .when .d { font-size: 11px; color: var(--mut); text-transform: uppercase; }
    .when .t { font-size: 13px; font-weight: 700; }
    .when.bad { background: var(--badbg); border-color: transparent; color: var(--bad); }
    .when.bad .d { color: var(--bad); }
    .when.warn { background: var(--warnbg); border-color: transparent; color: var(--warn); }
    .when.warn .d { color: var(--warn); }
    .when.ok { background: var(--okbg); border-color: transparent; color: var(--new); }
    .when.ok .d { color: var(--new); }
    .row.done .title { color: var(--mut); font-weight: 500; }
    .st { flex: none; font-size: 11px; font-weight: 700; border-radius: 4px; padding: 0 6px; white-space: nowrap; }
    .st.ok { color: var(--new); background: var(--okbg); }
    .st.warn { color: var(--warn); background: var(--warnbg); }
    .st.bad { color: var(--bad); background: var(--badbg); }
    .st.mut { color: var(--mut); border: 1px solid var(--line); }
    .ico { flex: 0 0 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: var(--bg); border: 1px solid var(--line); font-size: 14px; }
    .main { flex: 1; min-width: 0; }
    .title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { display: flex; gap: 8px; align-items: center; color: var(--mut); font-size: 12.5px; margin-top: 1px; min-width: 0; }
    .chip { display: inline-flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .chip i { flex: 0 0 8px; height: 8px; border-radius: 50%; }
    .chip span { overflow: hidden; text-overflow: ellipsis; }
    .sep { color: var(--faint); }
    .new { flex: none; font-size: 10.5px; font-weight: 800; color: #fff; background: var(--new); border-radius: 4px; padding: 1px 5px; }
    .kind { flex: none; font-size: 11px; color: var(--mut); border: 1px solid var(--line); border-radius: 4px; padding: 0 5px; }
    .right { flex: none; font-weight: 700; font-size: 13px; text-align: right; }
    .right.bad { color: var(--bad); } .right.warn { color: var(--warn); } .right.mut { color: var(--mut); font-weight: 600; }
    .body { color: var(--mut); font-size: 13px; margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    details { border-top: 1px solid var(--line); }
    details:first-child { border-top: 0; }
    summary { list-style: none; cursor: pointer; display: flex; gap: 10px; align-items: center; padding: 10px 0; font-weight: 600; }
    summary::-webkit-details-marker { display: none; }
    summary::before { content: '›'; color: var(--faint); font-size: 18px; line-height: 1; transition: transform .15s; width: 10px; }
    details[open] summary::before { transform: rotate(90deg); }
    summary .chip { flex: 1; }
    summary .cnt { color: var(--mut); font-weight: 600; font-size: 12.5px; }
    details ul { padding: 0 0 8px 20px; }

    .empty { color: var(--mut); font-size: 13px; padding: 14px 0 18px; text-align: center; }
    .err { color: var(--bad); font-size: 12.5px; padding: 4px 0 10px; }
    .load { padding: 40px 0; text-align: center; color: var(--mut); }
    .bar { height: 4px; border-radius: 4px; background: var(--line); overflow: hidden; max-width: 320px; margin: 12px auto 0; }
    .bar i { display: block; height: 100%; background: var(--acc); transition: width .2s; }
    footer { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; color: var(--faint); font-size: 12px; margin-top: 16px; }
    .credit { flex-basis: 100%; order: 3; font-size: 11px; color: var(--faint); }
    .credit a { color: var(--mut); text-decoration: underline; }
    button.pri { background: var(--acc); color: #fff; border-color: var(--acc); font-weight: 600; }
  `));
  const wrap = h('div', { class: 'wrap' });
  const scroll = h('div', { class: 'scroll' });
  root.append(wrap);
  document.body.append(host);

  /* Freies Fenster: an der Kopfzeile ziehen, unten rechts skalieren, Doppelklick zentriert. */
  const clampPos = (x, y) => [Math.min(Math.max(0, x), innerWidth - 120), Math.min(Math.max(0, y), innerHeight - 48)];
  const placeDefault = () => {
    const w = Math.min(1100, innerWidth - 32), hgt = Math.min(Math.round(innerHeight * 0.88), innerHeight - 32);
    Object.assign(wrap.style, { width: w + 'px', height: hgt + 'px', left: Math.round((innerWidth - w) / 2) + 'px', top: '16px' });
  };
  const saveWin = () => { const r = wrap.getBoundingClientRect(); store.set('win', { x: r.left, y: r.top, w: r.width, h: r.height }); };
  if (POP) {
    wrap.classList.add('pop');
    if (!window.__nbxPopBound) {
      window.__nbxPopBound = true;
      const savePop = () => store.set('popwin', { x: screenX, y: screenY, w: outerWidth, h: outerHeight });
      addEventListener('resize', savePop);
      addEventListener('beforeunload', savePop);
    }
    /* Links im Campus-Tab öffnen, nicht im Pop-up. */
    root.addEventListener('click', (e) => {
      const a = e.composedPath().find((n) => n.tagName === 'A');
      if (!a || !a.href) return;
      e.preventDefault();
      if (a.target === '_blank') { window.open(a.href, '_blank', 'noopener'); return; }
      try { if (opener && !opener.closed) { opener.location.href = a.href; opener.focus(); return; } } catch (err) {}
      window.open(a.href, '_blank');
    });
  } else {
    const saved = store.get('win', null);
    if (saved) {
      const [x, y] = clampPos(saved.x, saved.y);
      Object.assign(wrap.style, { width: Math.min(saved.w, innerWidth - 8) + 'px', height: Math.min(saved.h, innerHeight - 8) + 'px', left: x + 'px', top: y + 'px' });
    } else placeDefault();
    let saveTimer;
    new ResizeObserver(() => { clearTimeout(saveTimer); saveTimer = setTimeout(saveWin, 300); }).observe(wrap);
  }
  /* Automatisch alle 5 Minuten neu laden; ⟳ lädt sofort. Dafür läuft die ganze Funktion erneut. */
  const REFRESH_MS = 5 * 60e3;
  let refreshTimer = null;
  /* Suche: Feld und Text leben über das Neuladen (alle 5 Min.) hinweg. */
  let searchInp = null, q = window.__nbxQ || '';
  delete window.__nbxQ;
  const teardown = () => { clearTimeout(refreshTimer); document.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onWake); window.removeEventListener('focus', onWake); host.remove(); };
  const refresh = () => { if (q) window.__nbxQ = q; window.__nbxKeep = true; try { window.__nbxScroll = scroll.scrollTop; } catch (e) {} teardown(); nbx(mode); };
  const close = () => { teardown(); if (POP) window.close(); };
  const popOut = () => { ui.popout = true; store.set('ui', ui); if (openPopup()) host.remove(); };
  const popIn = () => {
    ui.popout = false; store.set('ui', ui);
    try { if (opener && !opener.closed) { runIn(opener); opener.focus(); } } catch (e) {}
    window.close();
  };
  const startDrag = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    const r = wrap.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    const head = e.currentTarget;
    head.setPointerCapture(e.pointerId);
    wrap.classList.add('drag');
    const move = (ev) => { const [x, y] = clampPos(ev.clientX - dx, ev.clientY - dy); wrap.style.left = x + 'px'; wrap.style.top = y + 'px'; };
    const up = () => { wrap.classList.remove('drag'); head.removeEventListener('pointermove', move); head.removeEventListener('pointerup', up); saveWin(); };
    head.addEventListener('pointermove', move);
    head.addEventListener('pointerup', up);
  };
  /* Zurück im Tab oder Fenster: war das Dashboard über 2 Minuten im Hintergrund, sofort neu laden.
     Browser bremsen Timer in Hintergrund-Tabs, darum reicht der 5-Minuten-Takt allein nicht. */
  function onWake() {
    if (document.visibilityState === 'hidden' || !host.isConnected || Date.now() - now < 2 * 60e3) return;
    const a = root.activeElement;
    if (a && a.tagName === 'INPUT' && a.value) return;
    refresh();
  }
  document.addEventListener('visibilitychange', onWake);
  window.addEventListener('focus', onWake);
  function onKey(e) {
    if (e.key === 'Escape') close();
    /* „/“ springt ins Suchfeld, außer man tippt gerade irgendwo. */
    const a = root.activeElement || document.activeElement;
    if (e.key === '/' && searchInp && !(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) { e.preventDefault(); searchInp.focus(); }
  }
  document.addEventListener('keydown', onKey);
  const subLine = h('div', { class: 'sub' }, tr('Lade …'));
  const barFill = h('i', { style: 'width:5%' });
  const status = h('div', { class: 'load' }, h('div', {}, tr('Lade deine Kurse …')), h('div', { class: 'bar' }, barFill));
  const headProps = POP ? {} : { title: tr('Ziehen zum Verschieben · Doppelklick zentriert'), onpointerdown: startDrag,
    ondblclick: (e) => { if (!e.target.closest('button')) { placeDefault(); saveWin(); } } };
  wrap.append(h('header', headProps,
    h('div', {}, h('h1', {}, tr('Mein Campus')), subLine),
    h('div', { class: 'hbtns' },
      h('button', { class: 'x lang', title: tr('Sprache: Deutsch → Español'), onclick: () => { ui.lang = LANG === 'de' ? 'es' : 'de'; store.set('ui', ui); refresh(); } }, LANG === 'de' ? 'ES' : 'DE'),
      h('button', { class: 'x', title: tr('Jetzt neu laden'), onclick: refresh }, '⟳'),
      POP ? h('button', { class: 'x', title: tr('Zurück in den Campus-Tab'), onclick: popIn }, '▣')
        : h('button', { class: 'x', title: tr('In eigenem Fenster öffnen (auf andere Bildschirme ziehbar)'), onclick: popOut }, '⧉'),
      h('button', { class: 'x', title: tr('Schließen (Esc)'), onclick: close }, '×'))), scroll);
  scroll.append(status);

  let me;
  try { me = await get(V1 + '/users/me'); }
  catch (e) { status.textContent = tr('Nicht eingeloggt oder keine Berechtigung (') + e.message + tr('). Bitte im Campus einloggen und das Lesezeichen erneut klicken.'); return; }

  let memberships = [];
  try { memberships = await all(`${V1}/users/${me.id}/courses?expand=course&limit=100`); }
  catch (e) { status.textContent = tr('Kurse konnten nicht geladen werden (') + e.message + ').'; return; }

  const courses = memberships
    .filter((m) => m.course && (m.availability || {}).available !== 'No' && (m.course.availability || {}).available !== 'No')
    .filter((m) => {
      const d = (m.course.availability || {}).duration || {};
      return !(d.type === 'DateRange' && d.end && ts(d.end) < now - 14 * DAY);
    })
    .map((m) => Object.assign({ id: m.course.id }, parseName(m.course.name || m.course.courseId)))
    .sort((a, b) => a.name.localeCompare(b.name));
  /* Kurzname für Auswahl und Chips: nur der Teil vor dem Doppelpunkt, höchstens 40 Zeichen. */
  const shortName = (n) => { const s = n.split(':')[0].trim(); return s.length > 42 ? s.slice(0, 40).trim() + '…' : s; };
  courses.forEach((c, i) => { c.color = `hsl(${Math.round(i * 137.5) % 360} 65% 55%)`; c.short = shortName(c.name); });
  const byId = Object.fromEntries(courses.map((c) => [c.id, c]));
  if (ui.course && !byId[ui.course]) ui.course = '';
  const courseUrl = (c) => (c ? `${O}/ultra/courses/${c.id}/outline` : `${O}/ultra/calendar`);
  /* Offizieller Ultra-Direktlink: öffnet Test, Aufgabe oder Datei direkt. */
  /* Aufzeichnungen liegen in Collaborate (eigenes Fenster im Kurs); die Liste selbst ist von hier nicht lesbar, der Link öffnet sie direkt. */
  const recUrl = (c) => `${O}/ultra/courses/${c.id}/outline/collab/launchRecordings`;
  const contentUrl = (cid, contentId) => `${O}/ultra/redirect?redirectType=nautilus&courseId=${cid}&contentId=${contentId}`;
  const colIndex = new Map();

  /* Termine aus Kalender-PDFs und -Bildern: liest die Chrome-Erweiterung im Hintergrund (bridge.js). Ohne Erweiterung bleibt die Liste leer. */
  /* Verbindung zur Erweiterung: bridge.js läuft im Campus-Tab. Im eigenen Fenster (Pop-out) gibt es dort kein bridge.js,
     dann geht alles über den Campus-Tab, der das Fenster geöffnet hat; die Antworten kommen in dieses Fenster zurück. */
  const bridgeWin = (() => { try { if (window.opener && window.opener !== window && (window.opener.document.documentElement.dataset || {}).nbxBridge) return window.opener; } catch (e) {} return window; })();
  const hasBridge = () => { try { return !!(bridgeWin.document.documentElement.dataset || {}).nbxBridge; } catch (e) { return false; } };
  /* Aus dem Pop-out wird im Campus-Tab selbst gesendet (Funktion aus dessen Fenster), sonst nimmt bridge.js die Nachricht nicht an.
     Antworten kommen dann im Campus-Tab an, darum wird auch dort zugehört. */
  const toExt = (msg) => { try { if (bridgeWin === window) window.postMessage(msg, '*'); else new bridgeWin.Function('m', "window.postMessage(m, '*')")(msg); } catch (e) {} };
  const onExt = (f) => bridgeWin.addEventListener('message', f);
  const offExt = (f) => bridgeWin.removeEventListener('message', f);
  const fromExt = (e) => e.source === bridgeWin;
  const docEventsP = new Promise((ok) => {
    if (!hasBridge()) return ok({ events: [], docs: [] });
    const f = (e) => { if (fromExt(e) && e.data && e.data.nbx === 'docs') { offExt(f); ok(e.data); } };
    onExt(f);
    toExt({ nbx: 'getDocs' });
    setTimeout(() => ok({ events: [], docs: [] }), 3000);
  });
  const data = { deadlines: [], announcements: [], contents: [], grades: [], discussions: [], live: [] };
  const errs = { deadlines: 0, announcements: 0, contents: 0, grades: 0, discussions: 0, live: 0 };
  const errWhy = {};
  const gradeSnap = {};
  const allContents = [];
  const titleDated = [];
  const undated = [];
  const schedule = [];
  /* Feedback der Lehrkraft: Länge je Note merken, damit neues oder geändertes Feedback als NEU auffällt. */
  const prevFb = store.get('feedback', null);
  const fbSnap = {};
  const seenDeadline = new Set();
  const addDeadline = (d) => {
    const key = (d.course ? d.course.id : '') + '|' + d.title.toLowerCase() + '|' + Math.round(d.date / 6e4);
    /* Dieselbe Bewertungsspalte kommt aus Kalender und Notenbuch: nur einmal zeigen. */
    if (seenDeadline.has(key) || (d.colId && seenDeadline.has('col|' + d.colId))) return;
    seenDeadline.add(key);
    if (d.colId) seenDeadline.add('col|' + d.colId);
    data.deadlines.push(d);
  };

  try {
    /* Blackboard erlaubt pro Abfrage höchstens 16 Wochen, darum Vergangenheit und Zukunft getrennt. */
    const cal = (await all(`${V1}/calendars/items?since=${iso(now - HIST)}&until=${iso(now)}&limit=200`))
      .concat(await all(`${V1}/calendars/items?since=${iso(now)}&until=${iso(now + AHEAD)}&limit=200`));
    for (const it of cal) {
      const c = byId[it.calendarId];
      /* Abgaben zählen zum Ende (Fälligkeit), Termine wie Klassen zum Beginn. */
      const date = it.type === 'GradebookColumn' ? ts(it.end || it.start) : ts(it.start || it.end);
      if (!date || date < now - HIST) continue;
      addDeadline({
        course: c, courseName: c ? c.name : parseName(String(it.calendarName || '').replace(/^[^:]*_[^:]*:\s*/, '')).name,
        title: it.title || tr('(ohne Titel)'), date, end: it.type === 'GradebookColumn' ? null : ts(it.end) || null, colId: it.type === 'GradebookColumn' ? it.id : null, event: it.type !== 'GradebookColumn',
        kind: it.type === 'GradebookColumn' ? tr('Abgabe') : it.type === 'Institution' ? tr('Uni') : tr('Termin'),
        url: courseUrl(c)
      });
    }
  } catch (e) { errs.deadlines++; errWhy['deadlines'] = e.message; }

  const contentList = async (cid) => {
    const fields = 'fields=id,title,created,modified,contentHandler,hasChildren,availability,links';
    try { return await all(`${V1}/courses/${cid}/contents?recursive=true&limit=200&${fields}`, 2000); }
    catch (e) {
      const out = [];
      let queue = [`${V1}/courses/${cid}/contents?limit=200&${fields}`];
      for (let depth = 0; queue.length && depth < 4; depth++) {
        const next = [];
        for (const p of queue) {
          let items = [];
          try { items = await all(p); } catch (e2) { if (depth === 0) throw e2; }
          for (const it of items) {
            out.push(it);
            if (it.hasChildren) next.push(`${V1}/courses/${cid}/contents/${it.id}/children?limit=200&${fields}`);
          }
        }
        queue = next;
      }
      return out;
    }
  };
  const handlerKind = (id) => ({
    'resource/x-bb-file': [tr('Datei'), '📄'], 'resource/x-bb-document': [tr('Dokument'), '📝'], 'resource/x-bb-externallink': [tr('Link'), '🔗'],
    'resource/x-bb-assignment': [tr('Aufgabe'), '✏️'], 'resource/x-bb-asmt-test-link': [tr('Test'), '✅'], 'resource/x-bb-forumlink': [tr('Forum'), '💬'],
    'resource/x-bb-blankpage': [tr('Seite'), '📝'], 'resource/x-bb-video': [tr('Video'), '🎬'], 'resource/x-bb-bltiplacement-Portal': [tr('Tool'), '🧩']
  })[id] || [tr('Inhalt'), '📎'];

  let done = 0;
  const tick = () => { barFill.style.width = Math.max(5, Math.round(done / Math.max(1, courses.length) * 100)) + '%'; };

  await pool(courses, 5, async (c) => {
    await Promise.all([
      (async () => {
        try {
          const list = await all(`${V1}/courses/${c.id}/announcements?limit=100`, 200);
          for (const a of list) {
            const dur = (a.availability || {}).duration || {};
            const date = ts(dur.start) || ts(a.created);
            if (date < now - 60 * DAY || date > now) continue;
            data.announcements.push({ course: c, title: a.title || tr('(ohne Titel)'), body: plain(a.body), full: plain(a.body, 6000), lines: htmlLines(a.body), date, url: courseUrl(c) });
          }
        } catch (e) { errs.announcements++; errWhy['announcements'] = e.message; }
      })(),
      (async () => {
        try {
          const list = await contentList(c.id);
          for (const it of list) {
            const hid = (it.contentHandler || {}).id || '';
            /* Zeitpläne der Lehrkraft (oft nur als Bild oder PDF): auf der Fach-Seite oben verlinken. */
            if (it.title !== 'ultraDocumentBody' && /calendario|cronograma|agenda|fechas|examen final|planificaci[oó]n (de la|temporal)/i.test(it.title)) schedule.push({ course: c, title: it.title, url: contentUrl(c.id, it.id) });
            if (/folder|lesson|module/.test(hid) || it.title === 'ultraDocumentBody') continue;
            if ((it.availability || {}).available === 'No') continue;
            const created = ts(it.created), modified = ts(it.modified);
            const date = Math.max(created, modified);
            const [kind, icon] = handlerKind(hid);
            const alt = (it.links || []).find((l) => l.rel === 'alternate');
            const entry = { course: c, title: it.title || tr('(ohne Titel)'), date, kind, icon, changed: created < now - 30 * DAY,
              url: alt && alt.href ? abs(alt.href) : contentUrl(c.id, it.id) };
            /* Die Suche kennt alle Inhalte, der Tab „Inhalte“ nur die der letzten 30 Tage. */
            allContents.push(entry);
            /* Termine, die nur im Titel eines Kurs-Eintrags stehen, z. B. „Oct 26. Monográfico. Business Case 18:30 (M006). 24/11/2026“ (Link zur Session). */
            if (SES_RE.test(it.title || '') && /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(it.title || ''))
              titleDated.push({ course: c, title: it.title, url: hid === 'resource/x-bb-externallink' && (it.contentHandler || {}).url ? it.contentHandler.url : entry.url, join: hid === 'resource/x-bb-externallink' ? (it.contentHandler || {}).url || '' : '' });
            if (date >= now - 30 * DAY) data.contents.push(entry);
          }
        } catch (e) { errs.contents++; errWhy['contents'] = e.message; }
      })(),
      (async () => {
        let cols = [];
        try { cols = await all(`${V2}/courses/${c.id}/gradebook/columns?limit=200`); } catch (e) {}
        const colMap = Object.fromEntries(cols.map((x) => [x.id, x]));
        for (const col of cols) {
          colIndex.set(col.id, { course: c, col });
          const due = ts((col.grading || {}).due);
          if (due && due >= now - HIST && due <= now + AHEAD && (col.availability || {}).available !== 'No') {
            addDeadline({ course: c, title: col.name, date: due, kind: tr('Abgabe'), colId: col.id, url: courseUrl(c) });
          } else if (!due && (col.availability || {}).available !== 'No' && (col.contentId || (col.grading || {}).type === 'Attempts')) {
            /* Tests und Aufgaben ohne Abgabedatum (z. B. Autoevaluaciones): erscheinen ohne Frist auf der Fach-Seite und unter „Ohne Frist“. */
            undated.push({ course: c, title: col.name, date: 0, kind: tr('Ohne Frist'), colId: col.id, url: courseUrl(c) });
          }
        }
        try {
          const list = await all(`${V2}/courses/${c.id}/gradebook/users/${me.id}?limit=200`);
          for (const g of list) {
            const dg = g.displayGrade || {};
            const value = dg.text || (dg.score != null ? String(+(+dg.score).toFixed(2)) : '') || g.text || (g.score != null ? String(+(+g.score).toFixed(2)) : '');
            if (!value && g.status !== 'NeedsGrading') continue;
            const col = colMap[g.columnId] || {};
            const key = c.id + '|' + g.columnId;
            const shown = value || 'wird bewertet';
            gradeSnap[key] = shown;
            const possible = (col.score || {}).possible;
            data.grades.push({
              course: c, title: col.name || tr('Bewertung'), value: shown, pending: !value, colId: g.columnId, key, feedback: plain(g.feedback, 6000),
              possible: value && possible && dg.scaleType !== 'Tabular' && !/%|[a-z]/i.test(value) ? possible : null,
              isNew: prevGrades ? prevGrades[key] !== shown : false,
              date: ts(g.modified) || ts((col.grading || {}).due) || 0, url: `${O}/ultra/grades`
            });
          }
        } catch (e) { errs.grades++; errWhy['grades'] = e.message; }
      })(),
      (async () => {
        try {
          const list = await all(`${V1}/courses/${c.id}/discussions?limit=100`, 300);
          for (const d of list) {
            if (d.available === false) continue;
            const date = Math.max(ts(d.modifiedDate || d.modified), ts(d.createdDate || d.created));
            if (date && date < now - 60 * DAY) continue;
            data.discussions.push({ course: c, title: d.title || tr('(ohne Titel)'), body: plain((d.topic || {}).body || d.description), date, url: courseUrl(c) });
          }
        } catch (e) { errs.discussions++; errWhy['discussions'] = e.message; }
      })(),
      (async () => {
        /* Collaborate-Sessions (interne Ultra-API, dieselbe wie im Kurs unter "Videoconferencias"). */
        try {
          const list = await all(`/learn/api/v1/courses/${c.id}/collabultra/sessions?expand=sessionInstances&startTime=${iso(now - HIST)}`, 200);
          /* sessionInstances = gerade geöffnete Räume (z. B. Lehrkraft schon drin), Zeiten stehen an der Session. */
          for (const s of list) {
            const start = ts(s.startTime), end = s.noEndDate ? Infinity : ts(s.endTime);
            if (!start || end < now - HIST || start > now + AHEAD) continue;
            data.live.push({ course: c, title: s.name || tr('Videokonferenz'), sid: s.id, date: start, end,
              open: start - (s.boundaryTime || 0) * 6e4, running: (s.sessionInstances || []).length > 0, url: courseUrl(c) });
          }
        } catch (e) { errs.live++; errWhy['live'] = e.message; }
      })()
    ]);
    done++; tick();
  });

  /* Direktlinks und Versuche für Fristen und Noten. Ohne Versuch antwortet die API mit 404. */
  const sameTitle = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  for (const d of data.deadlines) {
    if (d.colId || !d.course) continue;
    for (const [id, v] of colIndex) if (v.course === d.course && sameTitle(v.col.name, d.title)) { d.colId = id; d.event = false; break; }
  }
  const withCol = [...data.deadlines, ...data.grades, ...undated].filter((it) => it.colId && colIndex.has(it.colId));
  const attempts = new Map();
  await pool([...new Set(withCol.map((it) => it.colId))], 6, async (colId) => {
    const { course } = colIndex.get(colId);
    try { attempts.set(colId, await all(`${V2}/courses/${course.id}/gradebook/columns/${colId}/attempts?userId=${me.id}`)); }
    catch (e) { attempts.set(colId, /404/.test(e.message) ? [] : null); }
  });
  for (const it of withCol) {
    const { course, col } = colIndex.get(it.colId);
    if (col.contentId) it.url = contentUrl(course.id, col.contentId);
    const list = attempts.get(it.colId);
    if (!list) continue;
    /* In Ultra steht das Feedback meist am Versuch, nicht an der Note: das neueste nehmen. */
    if ('feedback' in it && !it.feedback) {
      const fb = [...list].sort((a, b) => ts(a.created) - ts(b.created)).map((a) => plain(a.feedback, 6000)).filter(Boolean);
      if (fb.length) it.feedback = fb[fb.length - 1];
    }
    const sent = list.filter((a) => a.attemptReceipt || /NeedsGrading|Completed/.test(a.status));
    it.att = {
      sent: sent.length,
      open: list.some((a) => /InProgress|Suspended/.test(a.status)),
      allowed: (col.grading || {}).attemptsAllowed || 0,
      last: Math.max(0, ...sent.map((a) => ts((a.attemptReceipt || {}).submissionDate) || ts(a.created)))
    };
  }
  /* Nachhol-Tests für andere ausblenden, wenn du das Original schon abgegeben hast. */
  const extraHidden = [];
  {
    const cand = [...data.deadlines, ...undated].filter((it) => it.colId && colIndex.has(it.colId));
    const names = new Map();
    for (const [id, v] of colIndex) { const k = v.course.id; if (!names.has(k)) names.set(k, []); names.get(k).push([v.col.name, id]); }
    const drop = new Set();
    await pool(cand, 4, async (it) => {
      const list = names.get(it.course.id) || [];
      const base = extraBase(it.title, list.map((x) => x[0]));
      if (!base) return;
      const baseId = (list.find((x) => x[0] === base) || [])[1];
      let at = attempts.get(baseId);
      if (at === undefined) { try { at = await all(`${V2}/courses/${it.course.id}/gradebook/columns/${baseId}/attempts?userId=${me.id}`); } catch (e) { at = null; } }
      if (at && at.some((a) => a.attemptReceipt || /NeedsGrading|Completed/.test(a.status)) && !(it.att && (it.att.sent || it.att.open))) { drop.add(it); extraHidden.push({ title: it.title, base }); }
    });
    if (drop.size) {
      data.deadlines = data.deadlines.filter((d) => !drop.has(d));
      for (let i = undated.length - 1; i >= 0; i--) if (drop.has(undated[i])) undated.splice(i, 1);
    }
  }
  const dlKey = (d) => (d.colId || (d.course ? d.course.id : '') + '|' + d.title) + '|' + d.date;
  const sentAny = (d) => !!(d.att && d.att.sent > 0);
  const isDone = (d) => sentAny(d) && !reopened[dlKey(d)];
  const gradedCourses = new Set([...colIndex.values()].map((v) => v.course.id));

  for (const k of ['announcements', 'contents', 'discussions']) for (const it of data[k]) it.isNew = it.date > lastSeen;
  for (const g of data.grades) {
    if (!g.feedback) continue;
    fbSnap[g.key] = g.feedback.length;
    g.body = g.feedback.length > 220 ? g.feedback.slice(0, 220).trim() + '…' : g.feedback;
    if (prevFb && prevFb[g.key] !== g.feedback.length) g.isNew = g.fbNew = true;
  }
  /* Beim allerersten Laden gilt vorhandenes Feedback als bekannt. */
  if (!prevFb) store.set('feedback', fbSnap);
  data.deadlines.sort((a, b) => a.date - b.date);
  data.live.sort((a, b) => a.date - b.date);
  for (const k of ['announcements', 'contents', 'discussions']) data[k].sort((a, b) => b.date - a.date);
  data.grades.sort((a, b) => (b.isNew - a.isNew) || (b.date - a.date));
  window.__nbxData = { counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])), errs, extraHidden };

  const body = h('div');
  status.replaceWith(body);
  const given = String(me.givenName || (me.name || {}).given || '').toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (s, p, ch) => p + ch.toUpperCase());
  subLine.textContent = tr('Hola {name} · neu seit deinem letzten Besuch am {d}', { name: given, d: fmtDate(lastSeen) });

  const TABS = [['week', tr('Diese Woche')], ['inbox', tr('Neu')], ['courses', tr('Fächer')], ['calendar', tr('Kalender')]];

  const chip = (it) => {
    const c = it.course;
    const name = c ? c.name : (it.courseName || '');
    return h('span', { class: 'chip', title: name + (c && c.sem ? ' (' + c.sem + ')' : '') }, h('i', { style: 'background:' + (c ? c.color : 'var(--faint)') }), h('span', {}, c ? c.short : name));
  };
  const attBadge = (it, cls) => {
    const a = it.att;
    if (!a) return null;
    if (a.sent && it.date && reopened[dlKey(it)]) return h('span', { class: 'st warn' }, tr('Teil abgegeben, weitere Abgabe offen'));
    if (a.sent) {
      const n = a.allowed ? tr(' · {n}/{m} Versuche', { n: a.sent, m: a.allowed }) : a.sent > 1 ? tr(' · {n} Versuche', { n: a.sent }) : '';
      return h('span', { class: 'st ok', title: a.last ? tr('Zuletzt abgegeben: ') + fmtDate(a.last) + ' ' + fmtTime(a.last) : '' }, tr('✓ Abgegeben') + n);
    }
    if (a.open) return h('span', { class: 'st warn' }, tr('⏳ Begonnen, nicht abgegeben'));
    return h('span', { class: 'st ' + (cls || 'mut') }, tr('Nicht abgegeben') + (a.allowed ? tr(' · 0/{m} Versuche', { m: a.allowed }) : ''));
  };
  /* Auf der Fach-Seite ist das Fach klar, dort entfällt der Fach-Chip in jeder Zeile. */
  let chipOff = false;
  const row = (it, opts) => h('li', {}, h('a', { class: 'row' + (opts.done ? ' done' : ''), href: it.url, target: '_blank', rel: 'noopener', title: tr('Öffnen: ') + it.title },
    opts.lead,
    h('div', { class: 'main' },
      h('div', { class: 'title' }, it.title),
      h('div', { class: 'meta' },
        it.isNew ? h('span', { class: 'new' }, tr('NEU')) : null,
        opts.status,
        opts.kind ? h('span', { class: 'kind' }, opts.kind) : null,
        opts.noCourse || chipOff ? null : chip(it),
        opts.meta ? [h('span', { class: 'sep' }, '·'), h('span', { style: 'flex:none' }, opts.meta)] : null),
      opts.body && it.body ? h('div', { class: 'body' }, it.body) : null),
    opts.right));

  const urgency = (t) => (t < now || t < today + 2 * DAY ? 'bad' : t < today + 7 * DAY ? 'warn' : '');
  const deadlineRow = (d, opt = {}) => {
    const done = isDone(d);
    const u = done ? 'ok' : urgency(d.date);
    return row(d, {
      done,
      lead: opt.timeOnly ? h('div', { class: 'when ' + u }, h('div', { class: 'd' }, tr('bis')), h('div', { class: 't' }, fmtTime(d.date))) : h('div', { class: 'when ' + u }, h('div', { class: 'd' }, new Date(d.date).toLocaleDateString(LOC, { weekday: 'short' })),
        h('div', { class: 't' }, new Date(d.date).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit' }))),
      kind: d.att ? null : d.kind, status: attBadge(d, urgency(d.date) || 'mut'), meta: opt.timeOnly ? null : fmtTime(d.date),
      right: h('div', { class: 'right ' + (done ? 'mut' : u) }, done && d.date < now ? tr('erledigt') : rel(d.date))
    });
  };
  const isOpen = (d) => d.colId && d.att && !isDone(d);

  /* Live-Sessions: Beitritt wie in Ultra – Fenster sofort öffnen (sonst blockt der Pop-up-Blocker),
     dann per POST .../launch die persönliche Collaborate-Adresse holen. */
  const isLive = (s) => now <= s.end && (now >= s.open || s.running);
  const xsrf = async () => {
    try {
      const v = (window.__initialContext || {}).xsrf || (POP && opener && !opener.closed && (opener.__initialContext || {}).xsrf);
      if (v) return v;
    } catch (e) {}
    const t = await (await fetch(O + '/ultra/institution-page', { credentials: 'same-origin' })).text();
    const m = /xsrf:\s*"([^"]+)"/.exec(t);
    return m ? m[1] : '';
  };
  const launch = async (s) => {
    const r = await fetch(`${O}/learn/api/v1/courses/${s.course.id}/collabultra/sessions/${s.sid}/launch`, {
      method: 'POST', credentials: 'same-origin', body: '{}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Blackboard-XSRF': await xsrf() }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (!j.url) throw new Error(tr('keine Adresse erhalten'));
    return j.url;
  };
  const join = (s) => (e) => {
    e.preventDefault(); e.stopPropagation();
    const w = window.open('', '_blank');
    try { w.document.title = tr('Verbinde …'); w.document.body.style.cssText = 'font:16px -apple-system,sans-serif;padding:24px'; w.document.body.textContent = tr('Verbinde mit „') + s.title + '“ …'; } catch (err) {}
    launch(s).then((url) => { if (w) w.location.href = url; else window.open(url, '_blank'); })
      .catch((err) => {
        if (w) w.close();
        alert(tr('Beitreten hat nicht geklappt (') + err.message + tr('). Ich öffne den Kurs – dort unter „Videoconferencias“ beitreten.'));
        window.open(s.url, '_blank');
      });
  };
  const liveRow = (s) => {
    /* Vorbei: Zeile führt zu den Aufzeichnungen des Kurses. */
    if (s.end < now && s.course) return row(Object.assign({}, s, { url: recUrl(s.course) }), {
      lead: h('div', { class: 'when' }, h('div', { class: 'd' }, new Date(s.date).toLocaleDateString(LOC, { weekday: 'short' })),
        h('div', { class: 't' }, new Date(s.date).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit' }))),
      kind: tr('Vorbei'), meta: fmtTime(s.date) + '–' + fmtTime(s.end), right: h('div', { class: 'right rec' }, tr('🎬 Aufzeichnung'))
    });
    const on = isLive(s);
    const span = fmtTime(s.date) + (s.end === Infinity ? '' : '–' + fmtTime(s.end));
    return row(s, {
      lead: h('div', { class: 'when' + (on ? ' bad' : '') }, h('div', { class: 'd' }, new Date(s.date).toLocaleDateString(LOC, { weekday: 'short' })),
        h('div', { class: 't' }, new Date(s.date).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit' }))),
      status: on ? h('span', { class: 'st bad' }, h('i', { class: 'dot' }),
        s.running ? tr(' LIVE · Raum läuft') : now < s.date ? tr(' Raum offen · Start ') + fmtTime(s.date) : tr(' LIVE')) : null,
      kind: on ? null : tr('Videokonferenz'), meta: span,
      right: on ? h('button', { class: 'join', onclick: join(s) }, tr('▶ Beitreten'))
        : h('div', { class: 'right mut' }, s.end < now ? tr('vorbei') : s.open - now < DAY ? tr('Beitritt ab ') + fmtTime(s.open) : rel(s.date))
    });
  };


  /* Ausgeblendete Kurse fehlen überall, außer man filtert gezielt auf einen. */
  const hidden = new Set(store.get('hidden', []));
  const kindOv = store.get('courseKind', {});
  const GENERAL_RE = /repositorio|recursos|coordinaci[oó]n|biblioteca|orientaci[oó]n/i;
  /* Allgemein: nur Kurse ohne Fach-Kennung (c.sem), erkannt am Namen (Repositorio, Recursos …) oder daran, dass sie keine bewerteten Aufgaben haben.
     Kurse mit Kennung sind immer Fächer, auch mit „Recursos humanos“ im Namen oder bevor es Aufgaben gibt. */
  const isGeneral = (c) => !!c && (kindOv[c.id] ? kindOv[c.id] === 'general' : !c.sem && (GENERAL_RE.test(c.name) || !gradedCourses.has(c.id)));
  const byCourse = (it) => (ui.course ? !!(it.course && it.course.id === ui.course) : !(it.course && hidden.has(it.course.id)));
  const ownVisible = (o) => (ui.course ? !o.courseId || o.courseId === ui.course : !(o.courseId && hidden.has(o.courseId)));
  const recent = (d) => d.date >= now - DAY;
  const errNote = (key) => (errs[key] ? h('div', { class: 'err' }, tr('In {n} Kurs(en) nicht abrufbar', { n: errs[key] }) + (errWhy[key] ? ` (${errWhy[key]})` : '') + tr(' – bitte ⟳ klicken.')) : null);
  const empty = (txt) => h('div', { class: 'empty' }, txt);
  const go = (tab) => { ui.tab = tab; if (searchInp) searchInp.value = q = ''; render(); };

  /* Kalender: Fristen, Live-Sessions und eigene Termine. Eigene Termine liegen nur im localStorage dieses Browsers. */
  let own = store.get('cal', []);
  const saveOwn = () => store.set('cal', own);

  /* Feste Termine aus den Kursunterlagen. Jeder wird nur einmal eingefügt; gelöschte bleiben gelöscht. */
  const at = (m, d, hh, mm) => +new Date(2026, m - 1, d, hh, mm || 0);
  const SEED = typeof PERSONAL_SEED === 'undefined' ? [] : PERSONAL_SEED;
  if (typeof PERSONAL_RETIRED !== 'undefined') own = own.filter((o) => !PERSONAL_RETIRED.includes(o.id));
  const seeded = new Set(store.get('calSeeded', []));
  const fresh = SEED.filter((s) => !seeded.has(s.id));
  if (fresh.length) {
    own = own.concat(fresh.map((s) => Object.assign({ allDay: false }, s)));
    for (const s of fresh) seeded.add(s.id);
    store.set('calSeeded', [...seeded]);
  }
  const seedById = new Map(SEED.map((s) => [s.id, s]));
  for (const o of own) {
    o.url = o.courseId && byId[o.courseId] ? courseUrl(byId[o.courseId]) : o.url || null;
    if (seedById.has(o.id)) {
      /* Kursplan-Einträge immer auf den aktuellen Stand bringen (Zeit, Titel, Beitrittslink), auch wenn sie schon gespeichert sind. */
      const sd = seedById.get(o.id);
      Object.assign(o, { session: !!sd.session, title: sd.title, start: sd.start, end: sd.end });
      if (sd.join) o.url = sd.join;
    }
  }
  saveOwn();

  /* Eigene Termine, die Live-Sessions sind: aus dem Kursplan markiert oder am Titel erkannt.
     Legt Blackboard zur selben Zeit einen Collaborate-Raum an, zeigt das Dashboard nur den echten Raum. */
  const isSession = (o) => o.session || (!o.due && !o.allDay && /videoconf|videokonf|konferenz|sesi[oó]n|session|tutor[ií]a|clase|webinar|vorlesung/i.test(o.title));
  const ownEnd = (o) => o.end || o.start + (o.allDay ? DAY : 3600e3);
  const ownSessions = () => own
    .filter((o) => isSession(o) && ownEnd(o) >= now && ownVisible(o))
    .filter((o) => !clashOwn(o));
  const ownLive = (o) => now >= o.start - 15 * 6e4 && now <= ownEnd(o);

  /* Doppelte Termine: Lehrkräfte tragen eine Klasse oft im Kalender UND als Collaborate-Session ein.
     Gibt es im selben Fach eine Session innerhalb von 45 Minuten, zeigt das Dashboard nur die Session (mit Beitreten). */
  const near = (a, b) => Math.abs(a - b) < 45 * 6e4;
  const sameCourse = (c, id) => !!c && c.id === id;
  data.deadlines = data.deadlines.filter((d) => !(d.event && d.course && data.live.some((s) => s.course === d.course && near(s.date, d.date))));
  /* Eigener Session-Termin doppelt? Gleiches Fach (oder von Hand ohne Fach eingetragen) und innerhalb von 45 Minuten
     einer Blackboard-Session, eines Kalendertermins oder eines Kursplan-Eintrags: dann zeigt das Dashboard nur den anderen. */
  const courseOk = (c, o) => !o.courseId || sameCourse(c, o.courseId);
  const clashOwn = (o) => isSession(o) && (data.live.some((s) => courseOk(s.course, o) && near(s.date, o.start))
    || data.deadlines.some((d) => d.event && courseOk(d.course, o) && near(d.date, o.start))
    || (!seedById.has(o.id) && own.some((x) => x !== o && seedById.has(x.id) && isSession(x) && (!o.courseId || x.courseId === o.courseId) && near(x.start, o.start))));

  /* Termine aus Ankündigungen: Klassen und Prüfungen, die nur im Text einer Ankündigung stehen. */
  const annEvents = [];
  {
    const seen = new Set();
    for (const a of data.announcements) {
      /* Bibliothek, Repositorio, Recursos: dort stehen Webinare für alle Studierenden, keine Klassen des Masters. */
      if (a.course && !a.course.sem && /repositorio|recursos|biblioteca/i.test(a.course.name)) continue;
      /* Kopierte Kurse tragen manchmal Ankündigungen mit altem Datum (2024): Bezugsjahr ist dann das aktuelle. */
      for (const e of parseDates(a.lines || a.full || '', Math.max(a.date || 0, now - 30 * DAY))) {
        if ((e.end || e.start + (e.allDay ? DAY : 3600e3)) < now - DAY || e.start > now + AHEAD) continue;
        const c = a.course, key = (c ? c.id : '') + '|' + e.start;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!e.allDay && data.live.some((s) => s.course === c && near(s.date, e.start))) continue;
        if (data.deadlines.some((d) => d.course === c && (e.allDay ? startOfDay(d.date) === e.start && d.event : near(d.date, e.start)))) continue;
        annEvents.push({ id: 'ann:' + key, course: c, title: a.title, label: e.label, exam: e.exam, start: e.start, end: e.end, allDay: e.allDay,
          body: e.text, url: a.url, date: e.start });
      }
    }
    /* dazu die Termine aus Kursdokumenten (Erweiterung) */
    const docInfo = await docEventsP;
    /* Noch ungelesene Kalender-Dokumente? Jetzt ist ein Campus-Tab offen, über den die Erweiterung sie laden kann. */
    if ((docInfo.docs || []).some((d) => d.error)) toExt({ nbx: 'rescan' });
    for (const d of docInfo.events || []) {
      const c = byId[d.courseId];
      if (!c || d.end < now - DAY || d.start > now + AHEAD) continue;
      const key = c.id + '|' + d.start;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!d.allDay && data.live.some((s) => s.course === c && near(s.date, d.start))) continue;
      if (data.deadlines.some((x) => x.course === c && (d.exam ? /exam/i.test(x.title) && startOfDay(x.date) === startOfDay(d.start) : near(x.date, d.start) && x.event))) continue;
      annEvents.push({ id: 'doc:' + key, src: 'doc', course: c, title: d.label + (d.num ? ' ' + d.num : '') + ' · ' + c.short, label: d.label + (d.num ? ' ' + d.num : ''), exam: d.exam,
        start: d.start, end: d.end, allDay: d.allDay, body: d.text + ' — ' + d.docTitle, url: d.join || d.url || courseUrl(c), join: d.join || '', date: d.start });
    }
    /* dazu Termine aus Titeln von Kurs-Einträgen */
    for (const t of titleDated) {
      const c = t.course;
      const label = t.title.replace(/^[a-z]{3}\s+\d{2}\.\s*/i, '').replace(/\s*\(M\d+\)\.?/g, '').replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\.?/g, ' ').replace(/\b\d{1,2}[:.]\d{2}(\s*h\b)?/g, ' ').replace(/\s+/g, ' ').replace(/[.\s·-]+$/, '').trim();
      /* Titel sind kurz und fest aufgebaut: ein Datum TT/MM/JJJJ und optional eine Uhrzeit irgendwo im Titel. */
      const dm = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/.exec(t.title), tm = /\b(\d{1,2})[:.](\d{2})\s*h?\b/.exec(t.title.replace(dm ? dm[0] : '', ''));
      if (!dm) continue;
      const yy = +dm[3] < 100 ? 2000 + +dm[3] : +dm[3];
      const st = tm && +tm[1] < 24 ? +new Date(yy, +dm[2] - 1, +dm[1], +tm[1], +tm[2]) : +new Date(yy, +dm[2] - 1, +dm[1]);
      for (const e of [{ start: st, end: null, allDay: !tm, exam: /examen/i.test(t.title), label: '' }]) {
        if ((e.end || e.start + (e.allDay ? DAY : 3600e3)) < now - DAY || e.start > now + AHEAD) continue;
        const key = c.id + '|' + e.start;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!e.allDay && data.live.some((s) => s.course === c && near(s.date, e.start))) continue;
        annEvents.push({ id: 'ttl:' + key, src: 'title', course: c, title: label + ' · ' + c.short, label: label || e.label, exam: e.exam, start: e.start, end: e.end, allDay: e.allDay,
          body: t.title, url: t.join || t.url, join: t.join, date: e.start });
      }
    }
    annEvents.sort((x, y) => x.start - y.start);
  }
  const annVisible = (e) => byCourse(e) && !(e.course && own.some((o) => o.courseId === e.course.id && (e.allDay ? startOfDay(o.start) === e.start : near(o.start, e.start))));
  const annEnd = (e) => e.end || e.start + (e.allDay ? DAY : 3600e3);
  const annEventRow = (e) => row(e, {
    lead: h('div', { class: 'when' }, h('div', { class: 'd' }, new Date(e.start).toLocaleDateString(LOC, { weekday: 'short' })),
      h('div', { class: 't' }, new Date(e.start).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit' }))),
    kind: e.src === 'doc' ? tr('📄 Laut Kursdokument') : e.src === 'title' ? tr('🔗 Laut Kurs-Eintrag') : tr('📢 Laut Ankündigung'), meta: e.allDay ? e.label : e.label + ' · ' + fmtTime(e.start) + (e.end ? '–' + fmtTime(e.end) : ''), body: true,
    right: e.join && now >= e.start - 15 * 6e4 && now <= annEnd(e) ? h('span', { class: 'join' }, tr('▶ Beitreten')) : h('div', { class: 'right mut' }, annEnd(e) < now ? tr('vorbei') : rel(e.start))
  });
  const ownSessionRow = (o) => {
    const on = ownLive(o);
    return row({ title: o.title, url: o.url || courseUrl(byId[o.courseId]), course: byId[o.courseId] }, {
      lead: h('div', { class: 'when' + (on ? ' bad' : '') }, h('div', { class: 'd' }, new Date(o.start).toLocaleDateString(LOC, { weekday: 'short' })),
        h('div', { class: 't' }, new Date(o.start).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit' }))),
      status: on ? h('span', { class: 'st bad' }, h('i', { class: 'dot' }), tr(' Jetzt laut Kursplan')) : null,
      kind: on ? null : tr('Laut Kursplan'), meta: fmtTime(o.start) + (o.end ? '–' + fmtTime(o.end) : ''),
      right: on ? h('span', { class: 'join' }, /bbcollab\.com/.test(o.url || '') ? tr('▶ Beitreten') : tr('▶ Zum Kurs')) : h('div', { class: 'right mut' }, rel(o.start))
    });
  };
  let calMsg = null;
  const DOW = LANG === 'de' ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] : ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  const monthStart = (t) => { const d = new Date(t); return +new Date(d.getFullYear(), d.getMonth(), 1); };
  const addDays = (t, n) => { const d = new Date(t); return +new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  const atTime = (day, hh, mm) => { const d = new Date(day); d.setHours(hh, mm || 0, 0, 0); return +d; };
  const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
  const calEvents = () => [
    ...data.deadlines.filter(byCourse).map((d) => ({ kind: 'deadline', t: d.date, title: (d.event ? fmtTime(d.date) + ' ' : '') + d.title, item: d, cls: d.event ? 'acc' : isDone(d) ? 'ok' : urgency(d.date) || 'acc' })),
    ...data.live.filter(byCourse).map((s) => ({ kind: 'live', t: s.date, title: '🎥 ' + fmtTime(s.date) + ' ' + s.title, item: s, cls: 'live' })),
    ...own.filter((o) => ownVisible(o) && !clashOwn(o)).map((o) => ({ kind: 'own', t: o.start, title: (o.due ? '⏰ ' : '') + o.title, item: o, cls: 'own' })),
    ...annEvents.filter(annVisible).map((e) => ({ kind: 'ann', t: e.start, title: (e.src === 'doc' ? '📄 ' : e.src === 'title' ? '🔗 ' : '📢 ') + (e.allDay ? '' : fmtTime(e.start) + ' ') + e.label + (e.course ? ' · ' + e.course.short : ''), item: e, cls: 'ann' }))
  ].sort((a, b) => a.t - b.t);
  const ownWhen = (o) => (o.allDay ? tr('ganztägig') : fmtTime(o.start) + (o.end ? '–' + fmtTime(o.end) : ''));
  const addOwn = (title, start, end, allDay) => {
    own.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title, start, end, allDay });
    saveOwn();
    ui.calSel = startOfDay(start); ui.calMonth = monthStart(start);
    calMsg = { ok: true, text: tr('✓ Eingetragen: {x}', { x: title + ' · ' + fmtDate(start) + ' ' + ownWhen({ start, end, allDay }) }) };
    render();
  };

  /* Befehlszeile: "Lernen Fundamentos morgen 18:00", "Gruppentreffen Fr 10-12", "Abgabe Entwurf 5.11." */
  const WD = { montag: 0, lunes: 0, dienstag: 1, martes: 1, mittwoch: 2, miercoles: 2, 'miércoles': 2, donnerstag: 3, jueves: 3,
    freitag: 4, viernes: 4, samstag: 5, sabado: 5, 'sábado': 5, sonntag: 6, domingo: 6, Mo: 0, Di: 1, Mi: 2, Do: 3, Fr: 4, Sa: 5, So: 6 };
  const parseCmd = (raw, baseDay) => {
    let s = ' ' + raw.trim() + ' ', day = null, from = null, to = null;
    const cut = (re, fn) => { const m = re.exec(s); if (m && fn(m) !== false) s = s.replace(m[0], ' '); return !!m; };
    cut(/\s(?:am\s+|el\s+)?(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\.?(?=\s)/i, (m) => {
      let y = m[3] ? +m[3] : new Date(now).getFullYear(); if (y < 100) y += 2000;
      let d = +new Date(y, +m[2] - 1, +m[1]);
      if (!m[3] && d < today - 30 * DAY) d = +new Date(y + 1, +m[2] - 1, +m[1]);
      if (+m[2] < 1 || +m[2] > 12 || +m[1] < 1 || +m[1] > 31) return false;
      day = d;
    });
    if (day == null) cut(/\s(übermorgen|uebermorgen|pasado mañana|morgen|mañana|heute|hoy)(?=\s)/i, (m) => {
      const w = m[1].toLowerCase(); day = addDays(today, /über|ueber|pasado/.test(w) ? 2 : /morgen|mañana/.test(w) ? 1 : 0);
    });
    if (day == null) cut(/\sin\s+(\d{1,3})\s+tag(?:en)?(?=\s)/i, (m) => { day = addDays(today, +m[1]); });
    const toWeekday = (key) => { const todayIdx = (new Date(today).getDay() + 6) % 7; day = addDays(today, (WD[key] - todayIdx + 7) % 7); };
    if (day == null) cut(/\s(?:am\s+|nächsten\s+|naechsten\s+|el\s+)?(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)(?=\s)/i,
      (m) => toWeekday(m[1].toLowerCase()));
    /* Kürzel nur groß geschrieben, damit z. B. "so" im Titel nicht als Sonntag gilt. */
    if (day == null) cut(/\s(?:am\s+)?(Mo|Di|Mi|Do|Fr|Sa|So)\.?(?=\s)/, (m) => toWeekday(m[1]));
    const hm = (hh, mm) => (+hh <= 24 && +(mm || 0) < 60 ? [+hh, +(mm || 0)] : null);
    cut(/\s(?:von\s+|de\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|bis|a)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(?:uhr|h)?(?=\s)/i, (m) => {
      const a = hm(m[1], m[2]), b = hm(m[3], m[4]); if (!a || !b) return false; from = a; to = b;
    });
    if (!from) cut(/\s(?:um\s+|ab\s+|a las\s+)?(\d{1,2})[:.](\d{2})\s*(?:uhr|h)?(?=\s)/i, (m) => { from = hm(m[1], m[2]); if (!from) return false; });
    if (!from) cut(/\s(?:um\s+|ab\s+|a las\s+)?(\d{1,2})\s*(?:uhr|h)(?=\s)/i, (m) => { from = hm(m[1]); if (!from) return false; });
    const title = s.replace(/\s+/g, ' ').trim().replace(/^(am|um|von|bis|ab|el|a las)\s+|\s+(am|um|von|bis|ab|el|a las)$/gi, '').trim();
    if (!title) return null;
    const d = day == null ? baseDay : day;
    if (!from) return { title, start: startOfDay(d), end: null, allDay: true };
    const start = atTime(d, from[0], from[1]);
    let end = to ? atTime(d, to[0], to[1]) : start + 3600e3;
    if (end <= start) end = start + 3600e3;
    return { title, start, end, allDay: false };
  };
  const runCmd = (inp) => {
    const text = inp.value.trim();
    if (!text) return;
    const p = parseCmd(text, ui.calSel || today);
    if (!p) { calMsg = { ok: false, text: tr('Ich habe keinen Titel erkannt – schreib z. B. „Lernen Fundamentos morgen 18:00“.') }; render(); return; }
    addOwn(p.title, p.start, p.end, p.allDay);
  };
  const ownRow = (o, opt = {}) => h('li', {}, h('div', { class: 'row' },
    h('div', { class: 'when own' }, h('div', { class: 'd' }, o.allDay ? tr('Tag') : o.due ? tr('bis') : fmtTime(o.start)),
      h('div', { class: 't' }, o.allDay ? '•' : o.due ? fmtTime(o.start) : (o.end ? fmtTime(o.end) : ''))),
    h('div', { class: 'main' },
      o.url ? h('a', { class: 'title tlink', href: o.url, target: '_blank', rel: 'noopener', title: tr('Kurs öffnen') }, o.title) : h('div', { class: 'title' }, o.title),
      h('div', { class: 'meta' }, h('span', { class: 'kind', title: seedById.has(o.id) ? tr('Aus dem Kursplan, den du eingetragen hast') : null },
        seedById.has(o.id) ? tr('Laut Kursplan') : o.due ? tr('Eigene Frist') : tr('Eigener Termin')),
        byId[o.courseId] ? chip({ course: byId[o.courseId] }) : null, opt.noDelete ? null : h('span', { style: 'flex:none' }, ownWhen(o)))),
    opt.noDelete ? null : h('button', { class: 'x del', title: tr('Termin löschen'), onclick: () => { own = own.filter((x) => x.id !== o.id); saveOwn(); calMsg = { ok: true, text: tr('🗑 Gelöscht: ') + o.title }; render(); } }, '🗑')));
  const calendarView = () => {
    const m0 = ui.calMonth || monthStart(now), sel = ui.calSel || today;
    const first = new Date(m0), offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    const byDay = new Map();
    for (const e of calEvents()) { const k = dayKey(e.t); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); }
    const cmd = h('input', { class: 'inp cmd', placeholder: tr('Neuer Termin, z. B. „Lernen Fundamentos morgen 18:00“ oder „Gruppentreffen Fr 10-12“'), spellcheck: 'false',
      onkeydown: (e) => { if (e.key === 'Enter') runCmd(cmd); } });
    /* Einträge im Raster sind Links: Frist/Aufgabe öffnet direkt, laufende Session tritt bei, eigener Termin öffnet seinen Kurs. */
    const chipEl = (e) => {
      const text = (e.kind === 'own' && !e.item.allDay ? fmtTime(e.t) + ' ' : '') + e.title;
      const url = e.item.url;
      const onclick = e.kind === 'live' && isLive(e.item) ? join(e.item) : (ev) => ev.stopPropagation();
      return url ? h('a', { class: 'ev ' + e.cls, href: url, target: '_blank', rel: 'noopener', title: tr('Öffnen: ') + e.title, onclick }, text)
        : h('div', { class: 'ev ' + e.cls, title: e.title }, text);
    };
    const limit = ui.calExpand ? Infinity : 3;
    const grid = [];
    for (let i = 0; i < cells; i++) {
      const t = +new Date(first.getFullYear(), first.getMonth(), 1 - offset + i);
      const list = byDay.get(dayKey(t)) || [];
      grid.push(h('div', { class: 'day' + (new Date(t).getMonth() !== first.getMonth() ? ' other' : '') + (t === today ? ' today' : '') + (t === sel ? ' sel' : ''),
        role: 'button', tabindex: '0', onclick: () => { ui.calSel = t; calMsg = null; render(); } },
        h('div', { class: 'dn' }, String(new Date(t).getDate())),
        list.slice(0, limit).map(chipEl),
        list.length > limit ? h('button', { class: 'more', title: tr('Alle Einträge zeigen'),
          onclick: (ev) => { ev.stopPropagation(); ui.calExpand = true; ui.calSel = t; render(); } }, '+' + (list.length - limit) + tr(' weitere')) : null));
    }
    const selList = byDay.get(dayKey(sel)) || [];
    const fTitle = h('input', { class: 'inp', placeholder: tr('Titel') });
    const fFrom = h('input', { class: 'inp time', type: 'time' });
    const fTo = h('input', { class: 'inp time', type: 'time' });
    const addForm = () => {
      const title = fTitle.value.trim(); if (!title) { fTitle.focus(); return; }
      if (!fFrom.value) return addOwn(title, startOfDay(sel), null, true);
      const [fh, fm] = fFrom.value.split(':').map(Number), start = atTime(sel, fh, fm);
      let end = start + 3600e3;
      if (fTo.value) { const [th, tm] = fTo.value.split(':').map(Number); end = Math.max(atTime(sel, th, tm), start + 15 * 6e4); }
      addOwn(title, start, end, false);
    };
    return h('div', { class: 'card' },
      h('div', { class: 'form' }, cmd, h('button', { class: 'pri', onclick: () => runCmd(cmd) }, tr('Eintragen'))),
      calMsg ? h('div', { class: 'calmsg ' + (calMsg.ok ? 'ok' : 'bad') }, calMsg.text) : null,
      h('div', { class: 'calhead' },
        h('button', { class: 'x', title: tr('Vorheriger Monat'), onclick: () => { ui.calMonth = monthStart(addDays(m0, -1)); render(); } }, '‹'),
        h('b', {}, new Date(m0).toLocaleDateString(LOC, { month: 'long', year: 'numeric' })),
        h('div', { class: 'hbtns' },
          h('button', { class: 'link', title: ui.calExpand ? tr('Pro Tag nur 3 Einträge zeigen') : tr('Alle Einträge jedes Tages zeigen'),
            onclick: () => { ui.calExpand = !ui.calExpand; render(); } }, ui.calExpand ? tr('⤡ Kompakt') : tr('⤢ Alles zeigen')),
          h('button', { class: 'link', onclick: () => { ui.calMonth = monthStart(now); ui.calSel = today; render(); } }, tr('Heute')),
          h('button', { class: 'x', title: tr('Nächster Monat'), onclick: () => { ui.calMonth = monthStart(addDays(m0, 40)); render(); } }, '›'))),
      h('div', { class: 'grid7' }, DOW.map((d) => h('div', { class: 'dow' }, d)), grid),
      h('div', { class: 'legend' }, h('span', { class: 'ev bad' }, tr('Frist offen')), h('span', { class: 'ev ok' }, tr('abgegeben')), h('span', { class: 'ev live' }, tr('Live-Session')), h('span', { class: 'ev own' }, tr('Eigener Termin')), h('span', { class: 'ev ann' }, tr('📢 Aus Ankündigung'))),
      h('div', { class: 'daypanel' },
        h('h2', {}, new Date(sel).toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long' })),
        selList.length ? h('ul', {}, selList.map((e) => (e.kind === 'own' ? ownRow(e.item) : e.kind === 'live' ? liveRow(e.item) : e.kind === 'ann' ? annEventRow(e.item) : deadlineRow(e.item))))
          : empty(tr('An diesem Tag ist nichts eingetragen.')),
        h('div', { class: 'form' }, fTitle, fFrom, fTo, h('button', { class: 'pri', onclick: addForm }, tr('+ Termin')))));
  };

  /* Wochenansicht: alles der nächsten 7 Tage chronologisch, mit Häkchen. Abgaben, die Blackboard als
     abgegeben erkennt, sind automatisch abgehakt; eigene Häkchen liegen nur im localStorage dieses Browsers. */
  const checks = store.get('checks', {});
  for (const [k, v] of Object.entries(checks)) if (v < now - 60 * DAY) delete checks[k];
  const saveChecks = () => store.set('checks', checks);
  /* Ohne Zeitraum: die nächsten 7 Tage plus Überfälliges. Mit Zeitraum (Klick auf einen Wochen-Balken): genau diese Woche. */
  const weekItems = (from, to) => {
    const range = from != null, end = range ? to : addDays(today, 7), list = [];
    for (const d of data.deadlines) {
      if (d.event || !byCourse(d)) continue;
      if (range ? d.date < from || d.date >= end : !recent(d) || d.date >= end || !(d.date >= now || isOpen(d))) continue;
      list.push({ key: 'd:' + dlKey(d), t: d.date, kind: 'deadline', item: d, auto: sentAny(d) });
    }
    /* Sessions stehen nicht in der Liste: man hakt sie nicht ab, sie haben oben ihre eigene Zeile. */
    for (const o of own) {
      if (!ownVisible(o) || (range ? o.start < from || o.start >= end : ownEnd(o) < now || o.start >= end)) continue;
      if (isSession(o)) continue;
      list.push({ key: 'o:' + o.id, t: o.start, kind: 'own', item: o });
    }
    return list.sort((a, b) => a.t - b.t);
  };
  const isChecked = (it) => (it.auto ? !reopened[dlKey(it.item)] : !!checks[it.key]);
  const dayLabel = (t) => {
    const d = startOfDay(t), date = new Date(t).toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long' });
    return d === today ? tr('Heute') + ' · ' + date : d === addDays(today, 1) ? tr('Morgen') + ' · ' + date : date;
  };
  const weekRow = (it) => {
    const done = isChecked(it);
    const box = h('input', { type: 'checkbox', class: 'chk' + (it.auto ? ' auto' : ''), checked: done,
      title: it.auto ? tr('Von Blackboard als abgegeben erkannt – abwählen, wenn noch ein Teil fehlt') : tr('Als erledigt abhaken'),
      onchange: (e) => {
        if (it.auto) { if (e.target.checked) delete reopened[dlKey(it.item)]; else reopened[dlKey(it.item)] = it.t; store.set('reopen', reopened); }
        else { if (e.target.checked) checks[it.key] = it.t; else delete checks[it.key]; saveChecks(); }
        render();
      } });
    const o = it.item;
    const inner = it.kind === 'deadline' ? deadlineRow(o, { timeOnly: true }) : ownRow(o, { noDelete: true });
    return h('li', { class: 'wk' + (done ? ' checked' : '') }, box, inner.firstElementChild);
  };
  /* Arbeitslast: Abgaben pro Woche für die nächsten 6 Wochen, damit volle Wochen früh auffallen.
     Ein Klick auf eine Woche zeigt ihre Abgaben darunter. */
  const weekStart = (t) => addDays(startOfDay(t), -((new Date(t).getDay() + 6) % 7));
  const weekLabel = (i, from) => (i === 0 ? tr('Diese Woche') : i === 1 ? tr('Nächste Woche') : tr('ab {d}', { d: new Date(from).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit' }) }));
  const loadWeeks = () => {
    const w0 = weekStart(now);
    return Array.from({ length: 6 }, (_, i) => {
      const from = addDays(w0, 7 * i), to = addDays(from, 7);
      const items = weekItems(from, to), done = items.filter(isChecked).length;
      return { i, from, to, items, done, open: items.length - done };
    });
  };
  const loadChart = (weeks, sel) => {
    if (!weeks.some((w) => w.items.length)) return null;
    const max = Math.max(3, ...weeks.map((w) => w.items.length));
    const level = (n) => (n >= 5 ? 'bad' : n >= 3 ? 'warn' : '');
    return h('div', { class: 'wload' },
      h('div', { class: 'loadhead' }, h('b', {}, tr('Die nächsten 6 Wochen')), h('span', { class: 'mut' }, tr('Klick auf eine Woche zeigt sie unten'))),
      h('div', { class: 'bars' }, weeks.map((w) => h('button', { class: 'wbar' + (sel === w ? ' on' : ''), disabled: !w.items.length,
        title: w.items.map((x) => x.item.title).join('\n') || tr('Keine Abgaben'),
        onclick: () => { ui.wlSel = ui.wlSel === w.i ? null : w.i; render(); } },
        h('span', { class: 'wn ' + level(w.open) }, w.items.length ? (w.open ? String(w.open) : '✓') : '–'),
        h('span', { class: 'track' },
          h('i', { class: 'o ' + level(w.open), style: 'height:' + Math.round(w.open / max * 100) + '%' }),
          h('i', { class: 'k', style: 'height:' + Math.round(w.done / max * 100) + '%' })),
        h('span', { class: 'wl' }, weekLabel(w.i, w.from))))),
      h('div', { class: 'legend2' }, h('span', {}, h('i', { class: 'o' }), tr('offen')), h('span', {}, h('i', { class: 'k' }), tr('abgegeben / erledigt'))));
  };
  /* Sessions: eine Zeile mit der nächsten, aufklappbar alle kommenden und die vergangenen mit Aufzeichnungen. */
  const sessionsBox = () => {
    const upcoming = [...data.live.filter((s) => byCourse(s) && s.end >= now).map((s) => [s.date, () => liveRow(s)]),
      ...ownSessions().map((o) => [o.start, () => ownSessionRow(o)]),
      ...annEvents.filter((e) => !e.exam && !e.allDay && annVisible(e) && annEnd(e) >= now).map((e) => [e.start, () => annEventRow(e)])].sort((a, b) => a[0] - b[0]);
    const past = data.live.filter((s) => byCourse(s) && s.end < now && s.course).sort((a, b) => b.date - a.date);
    if (!upcoming.length && !past.length) return errNote('live');
    const nextS = data.live.filter((s) => byCourse(s) && s.end >= now).map((s) => ({ t: s.date, title: s.title, course: s.course }))
      .concat(ownSessions().map((o) => ({ t: o.start, title: o.title, course: byId[o.courseId] })))
      .concat(annEvents.filter((e) => !e.exam && !e.allDay && annVisible(e) && annEnd(e) >= now).map((e) => ({ t: e.start, title: e.src ? e.label : e.label + ' (' + tr('laut Ankündigung') + ')', course: e.course })))
      .sort((a, b) => a.t - b.t)[0];
    return h('details', { class: 'nextses', open: !!ui.sesOpen, ontoggle: (e) => { ui.sesOpen = e.target.open; store.set('ui', ui); } },
      h('summary', {}, h('span', { class: 'ns-ico' }, '🎥'),
        nextS ? h('span', { class: 'ns-main' }, h('b', {}, tr('Nächste Session: ')), nextS.title, nextS.course ? h('span', { class: 'ns-c' }, ' · ' + nextS.course.short) : null)
          : h('span', { class: 'ns-main' }, tr('Keine Live-Sessions geplant.')),
        nextS ? h('span', { class: 'ns-t' }, rel(nextS.t)) : null,
        h('span', { class: 'ns-more' }, tr('alle ({n}) ▾', { n: upcoming.length }))),
      upcoming.length ? h('ul', {}, upcoming.map(([, el]) => el())) : null,
      past.length ? [h('div', { class: 'group' }, tr('🎬 Vorbei · Aufzeichnungen')), h('ul', {}, past.slice(0, 10).map(liveRow)),
        h('div', { class: 'hint' }, tr('Ein Klick öffnet die Aufzeichnungen des Fachs in Collaborate. Ob eine Session aufgezeichnet wurde, zeigt erst Collaborate.'))] : null,
      errNote('live'));
  };
  /* Abgaben ohne Datum (z. B. Autoevaluaciones): mit Status, ohne Frist. */
  const undatedRow = (d) => row(d, { done: isDone(d), lead: h('div', { class: 'ico' }, isDone(d) ? '✅' : '📝'), status: attBadge(d, 'mut'), kind: d.att ? null : tr('Ohne Frist'),
    right: h('div', { class: 'right mut' }, tr('ohne Frist')) });
  const undatedOpen = () => undated.filter((d) => byCourse(d) && !isGeneral(d.course) && !isDone(d));
  const weekView = () => {
    const weeks = loadWeeks();
    const sel = weeks.find((w) => w.i === ui.wlSel && w.items.length) || null;
    const all = sel ? sel.items : weekItems(), doneN = all.filter(isChecked).length;
    const shown = all.filter((it) => !(ui.hideChecked && isChecked(it)));
    const groups = new Map();
    for (const it of shown) {
      const b = !sel && it.kind === 'deadline' && it.t < now ? tr('Überfällig') : dayLabel(it.t);
      if (!groups.has(b)) groups.set(b, []);
      groups.get(b).push(it);
    }
    const add = h('input', { class: 'inp', placeholder: tr('Neue Aufgabe, z. B. „Lektüre Tema 3 Do“ oder „Forum schreiben morgen 20:00“'), spellcheck: 'false',
      onkeydown: (e) => { if (e.key === 'Enter') runCmd(add); } });
    const range = sel ? new Date(sel.from).toLocaleDateString(LOC, { day: 'numeric', month: 'short' }) + ' – ' + new Date(addDays(sel.to, -1)).toLocaleDateString(LOC, { day: 'numeric', month: 'short' }) : '';
    return [sessionsBox(), h('div', { class: 'card' },
      loadChart(weeks, sel),
      h('div', { class: 'wkhead' },
        h('div', { class: 'wkprog' },
          sel ? h('div', { class: 'wksel' }, h('b', {}, weekLabel(sel.i, sel.from) + ' · ' + range),
            h('button', { class: 'link', onclick: () => { ui.wlSel = null; render(); } }, tr('← zurück zu den nächsten 7 Tagen'))) : null,
          h('b', {}, all.length && doneN === all.length ? tr('Alles erledigt 🎉') : tr('{n} von {m} erledigt', { n: doneN, m: all.length })),
          h('div', { class: 'pbar' }, h('i', { style: 'width:' + (all.length ? Math.round(doneN / all.length * 100) : 0) + '%' }))),
        h('label', {}, h('input', { type: 'checkbox', checked: !!ui.hideChecked, onchange: (e) => { ui.hideChecked = e.target.checked; render(); } }), tr('Erledigte ausblenden'))),
      sel ? null : h('div', { class: 'form' }, add, h('button', { class: 'pri', onclick: () => runCmd(add) }, tr('Hinzufügen'))),
      calMsg ? h('div', { class: 'calmsg ' + (calMsg.ok ? 'ok' : 'bad') }, calMsg.text) : null,
      shown.length ? [...groups].map(([b, list]) => [h('div', { class: 'group' + (b === tr('Überfällig') ? ' bad' : '') }, b), h('ul', {}, list.map(weekRow))])
        : empty(all.length ? tr('Alles erledigt 🎉') : tr('Nichts geplant in den nächsten 7 Tagen.')),
      undatedOpen().length ? h('details', { class: 'gen', open: !!ui.undOpen, ontoggle: (e) => { ui.undOpen = e.target.open; store.set('ui', ui); } },
        h('summary', {}, tr('📝 Ohne Frist, noch offen ({n})', { n: undatedOpen().length })), h('ul', {}, undatedOpen().map(undatedRow)),
        h('div', { class: 'hint' }, tr('Tests und Aufgaben ohne Abgabedatum, z. B. Autoevaluaciones. Sobald du sie abgibst, verschwinden sie hier.'))) : null,
      errNote('deadlines'),
      h('div', { class: 'hint' }, tr('Häkchen gelten nur in diesem Browser.')))];
  };

  /* Fach-Karten: pro Kurs nur die Fakten, die es gibt; Frist und Datum stehen rechts und werden nie abgeschnitten.
     Aktionen (nur dieses Fach, allgemein, ausblenden) liegen im ⋯-Menü, damit die Karte ruhig bleibt. */
  const cardFor = (c) => {
    const dl = data.deadlines.filter((d) => d.course === c && !d.event);
    const graded = dl.concat(undated.filter((u) => u.course === c)).filter((d) => d.att), sent = graded.filter(isDone).length;
    const next = dl.find((d) => d.date >= now && !isDone(d));
    const ses = [...data.live.filter((s) => s.course === c && s.end >= now).map((s) => ({ t: s.date, title: s.title, url: s.url })),
      ...data.deadlines.filter((d) => d.course === c && d.event && d.date >= now).map((d) => ({ t: d.date, title: d.title, url: d.url })),
      ...own.filter((o) => o.courseId === c.id && isSession(o) && ownEnd(o) >= now).map((o) => ({ t: o.start, title: o.title, url: o.url }))]
      .sort((a, b) => a.t - b.t)[0];
    const lastRec = data.live.filter((s) => s.course === c && s.end < now).sort((a, b) => b.date - a.date)[0];
    const ann = data.announcements.filter((a) => a.course === c && a.isNew).length;
    const files = data.contents.filter((x) => x.course === c && x.isNew).length;
    const grades = data.grades.filter((g) => g.course === c && !g.pending).length;
    const gen = isGeneral(c);
    const fact = (icon, text, right, url, cls) => h('div', { class: 'fact' + (cls ? ' ' + cls : '') }, h('span', { class: 'fi' }, icon),
      url ? h('a', { class: 'ft', href: url, target: '_blank', rel: 'noopener', title: text }, text) : h('span', { class: 'ft' }, text),
      right ? h('span', { class: 'fr' }, right) : null);
    const facts = [
      next ? fact('⏰', next.title, rel(next.date), next.url, next.date < today + 2 * DAY ? 'urgent' : next.date < today + 7 * DAY ? 'soon' : '') : null,
      ses ? fact('🎥', ses.title, fmtDate(ses.t) + ' ' + fmtTime(ses.t), ses.url) : null,
      lastRec ? fact('🎬', tr('Aufzeichnung: {x}', { x: lastRec.title }), fmtDate(lastRec.date), recUrl(c)) : null,
      graded.length || grades ? fact('✓', [graded.length ? tr('{n} von {m} abgegeben', { n: sent, m: graded.length }) : null,
        grades ? (grades === 1 ? tr('1 Note') : tr('{n} Noten', { n: grades })) : null].filter(Boolean).join(' · ')) : null,
      ann || files ? fact('✨', tr('Neu: {x}', { x: [ann ? (ann === 1 ? tr('1 Ankündigung') : tr('{n} Ankündigungen', { n: ann })) : null,
        files ? (files === 1 ? tr('1 Inhalt') : tr('{n} Inhalte', { n: files })) : null].filter(Boolean).join(' · ') }), null, null, 'fresh') : null
    ].filter(Boolean);
    const act = (label, fn) => h('button', { class: 'link', onclick: fn }, label);
    return h('div', { class: 'ccard' + (!next && !ses && !ann && !files ? ' quiet' : '') },
      h('div', { class: 'chead' }, h('i', { style: 'background:' + c.color }),
        h('button', { class: 'cname', title: tr('Alles zu „{x}“ zeigen', { x: c.name }), onclick: () => openCourse(c) }, c.name), c.sem ? h('span', { class: 'kind' }, c.sem) : null,
        h('details', { class: 'cmenu' }, h('summary', { title: tr('Aktionen für dieses Fach') }, '⋯'),
          h('div', { class: 'menu' },
            h('a', { class: 'link', href: courseUrl(c), target: '_blank', rel: 'noopener' }, tr('Im Campus öffnen ↗')),
            h('a', { class: 'link', href: recUrl(c), target: '_blank', rel: 'noopener' }, tr('🎬 Aufzeichnungen')),
            act(tr('Nur dieses Fach'), () => { ui.course = c.id; ui.tab = 'week'; render(); }),
            act(gen ? tr('Als Fach markieren') : tr('Als allgemein markieren'), () => { kindOv[c.id] = gen ? 'subject' : 'general'; store.set('courseKind', kindOv); render(); }),
            act(tr('Ausblenden'), () => { hidden.add(c.id); store.set('hidden', [...hidden]); if (ui.course === c.id) ui.course = ''; render(); })))),
      facts.length ? h('div', { class: 'facts' }, facts) : h('div', { class: 'fnone' }, tr('Gerade nichts offen')),
      h('button', { class: 'link cmore', onclick: () => openCourse(c) }, tr('Alles zu diesem Fach →')));
  };
  const openCourse = (c) => { ui.tab = 'courses'; ui.detail = c.id; if (searchInp) searchInp.value = q = ''; render(); try { scroll.scrollTop = 0; } catch (e) {} };

  /* Fach-Seite: alles zu einem Fach an einem Ort. */
  const courseDetail = (c) => { chipOff = true; try { return courseDetailInner(c); } finally { chipOff = false; } };
  const courseDetailInner = (c) => {
    const mine = (it) => it.course === c;
    const sec = (title, n, ...kids) => [h('div', { class: 'dsec' }, h('h3', {}, title, n != null ? h('span', { class: 'cnt' }, String(n)) : null)), kids];
    const dl = data.deadlines.filter((d) => mine(d) && !d.event);
    const und = undated.filter(mine);
    const openDl = dl.filter((d) => d.date >= now || isOpen(d)), pastDl = dl.filter((d) => !(d.date >= now || isOpen(d))).reverse();
    const ses = [...data.live.filter((s) => mine(s) && s.end >= now).map((s) => [s.date, () => liveRow(s)]),
      ...data.deadlines.filter((d) => mine(d) && d.event && d.date >= now).map((d) => [d.date, () => deadlineRow(d)]),
      ...ownSessions().filter((o) => o.courseId === c.id).map((o) => [o.start, () => ownSessionRow(o)]),
      ...annEvents.filter((e) => e.course === c && annVisible(e) && annEnd(e) >= now).map((e) => [e.start, () => annEventRow(e)])].sort((a, b) => a[0] - b[0]);
    const past = data.live.filter((s) => mine(s) && s.end < now).sort((a, b) => b.date - a.date);
    const grades = data.grades.filter(mine);
    const ann = data.announcements.filter(mine);
    const files = allContents.filter(mine).sort((a, b) => b.date - a.date);
    const disc = data.discussions.filter(mine);
    const ownC = own.filter((o) => o.courseId === c.id && !isSession(o) && ownEnd(o) >= now).sort((a, b) => a.start - b.start);
    const fileRow = (x) => row(x, { lead: h('div', { class: 'ico' }, x.icon), kind: x.kind + (x.changed && x.isNew ? tr(' · geändert') : ''), meta: fmtAgo(x.date), noCourse: true });
    const more = (list, n, fn, label) => (list.length > n ? h('details', { class: 'gen' }, h('summary', {}, label || tr('Alle zeigen ({n})', { n: list.length })), h('ul', {}, list.slice(n).map(fn))) : null);
    return h('div', { class: 'card detail' },
      h('div', { class: 'dhead' },
        h('button', { class: 'link', onclick: () => { ui.detail = null; render(); } }, tr('← Alle Fächer')),
        h('div', { class: 'dtitle' }, h('i', { style: 'background:' + c.color }), h('h2', {}, c.name), c.sem ? h('span', { class: 'kind' }, c.sem) : null),
        h('div', { class: 'dlinks' },
          h('a', { class: 'btn', href: courseUrl(c), target: '_blank', rel: 'noopener' }, tr('Im Campus öffnen ↗')),
          h('a', { class: 'btn', href: recUrl(c), target: '_blank', rel: 'noopener' }, tr('🎬 Aufzeichnungen ↗')),
          schedule.filter((x) => x.course === c).slice(0, 4).map((x) => h('a', { class: 'btn', href: x.url, target: '_blank', rel: 'noopener', title: tr('Zeitplan der Lehrkraft (oft ein Bild oder PDF, das das Dashboard nicht lesen kann)') }, '📅 ' + (x.title.length > 40 ? x.title.slice(0, 38) + '…' : x.title) + ' ↗')))),
      sec(tr('Abgaben'), dl.length + und.length,
        openDl.length ? h('ul', {}, openDl.map((d) => deadlineRow(d))) : und.length ? null : empty(dl.length ? tr('Alles abgegeben 🎉') : tr('Keine Abgaben eingetragen.')),
        und.length ? [h('div', { class: 'group' }, tr('Ohne Frist ({n})', { n: und.length })), h('ul', {}, und.map(undatedRow))] : null,
        pastDl.length ? h('details', { class: 'gen' }, h('summary', {}, tr('Vergangene Abgaben ({n})', { n: pastDl.length })), h('ul', {}, pastDl.map((d) => deadlineRow(d)))) : null),
      ses.length || past.length ? sec(tr('Live-Sessions'), null,
        ses.length ? h('ul', {}, ses.map(([, el]) => el())) : empty(tr('Keine Live-Sessions geplant.')),
        past.length ? h('details', { class: 'gen' }, h('summary', {}, tr('🎬 Vergangene Sessions & Aufzeichnungen ({n})', { n: past.length })), h('ul', {}, past.map(liveRow))) : null) : null,
      ownC.length ? sec(tr('Eigene Termine'), ownC.length, h('ul', {}, ownC.map((o) => ownRow(o)))) : null,
      grades.length ? sec(tr('Noten & Feedback'), grades.length, h('ul', {}, grades.map((g) => gradeRow(g)))) : null,
      ann.length ? sec(tr('Ankündigungen'), ann.length, h('ul', {}, ann.slice(0, 3).map(annRow)), more(ann, 3, annRow)) : null,
      files.length ? sec(tr('Dateien & Inhalte'), files.length, h('ul', {}, files.slice(0, 8).map(fileRow)), more(files, 8, fileRow)) : null,
      disc.length ? sec(tr('Foren'), disc.length, h('ul', {}, disc.map((d) => row(d, { lead: h('div', { class: 'ico' }, '💬'), meta: d.date ? fmtAgo(d.date) : null, body: true, noCourse: true })))) : null);
  };
  const coursesView = () => {
    if (ui.detail && byId[ui.detail]) return courseDetail(byId[ui.detail]);
    const nextDue = (c) => { const n = data.deadlines.find((d) => d.course === c && !d.event && d.date >= now && !isDone(d)); return n ? n.date : Infinity; };
    const shown = courses.filter((c) => !hidden.has(c.id));
    const subj = shown.filter((c) => !isGeneral(c)).sort((a, b) => nextDue(a) - nextDue(b) || a.name.localeCompare(b.name));
    const gen = shown.filter(isGeneral), hid = courses.filter((c) => hidden.has(c.id));
    return h('div', {},
      subj.length ? h('div', { class: 'cgrid' }, subj.map(cardFor)) : empty(tr('Keine Fächer sichtbar.')),
      gen.length ? [h('div', { class: 'group' }, tr('Allgemeine Kurse')), h('div', { class: 'cgrid' }, gen.map(cardFor))] : null,
      hid.length ? h('details', { class: 'hidlist' }, h('summary', {}, tr('Ausgeblendet ({n})', { n: hid.length })),
        h('ul', {}, hid.map((c) => h('li', { class: 'hrow' }, h('span', {}, c.name),
          h('button', { class: 'link', onclick: () => { hidden.delete(c.id); store.set('hidden', [...hidden]); render(); } }, tr('Einblenden')))))) : null,
      h('div', { class: 'hint' }, tr('Ausgeblendete Kurse verschwinden aus allen Ansichten. „Allgemein“ trennt Sammelkurse wie das Repositorio von deinen Fächern.')));
  };

  /* Note mit Feedback: Anfang direkt sichtbar, ganzer Text zum Aufklappen. */
  const gradeRow = (g, opt = {}) => {
    const li = row(g, { lead: h('div', { class: 'ico' }, '🎓'), noCourse: !opt.withCourse, status: attBadge(g), body: true,
      kind: g.feedback ? (g.fbNew ? tr('💬 Neues Feedback') : tr('💬 Feedback')) : null,
      right: h('div', { class: 'right' + (g.pending ? ' mut' : '') }, g.value + (g.possible ? ' / ' + g.possible : '')) });
    if (g.feedback && g.feedback.length > (g.body || '').length) li.append(h('details', { class: 'more-text' }, h('summary', {}, tr('Ganzes Feedback lesen')), h('div', { class: 'fulltext' }, g.feedback)));
    return li;
  };
  const annRow = (a) => {
    const li = row(a, { lead: h('div', { class: 'ico' }, '📢'), meta: fmtAgo(a.date), body: true });
    if (a.full && a.full.length > (a.body || '').length) li.append(h('details', { class: 'more-text' }, h('summary', {}, tr('Ganzen Text lesen')), h('div', { class: 'fulltext' }, a.full)));
    return li;
  };

  /* Suche über alles Geladene: Fristen, Sessions, Ankündigungen, alle Inhalte, Noten mit Feedback, Foren, eigene Termine, Kurse.
     Groß/klein und Akzente egal, mehrere Wörter müssen alle vorkommen. */
  const norm = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  searchInp = h('input', { class: 'inp search', type: 'search', placeholder: tr('🔍 Suchen …'), spellcheck: 'false', value: q,
    title: tr('Sucht in allen Fächern (Taste /)'),
    oninput: (e) => { q = e.target.value; render(); },
    onkeydown: (e) => { if (e.key === 'Escape' && searchInp.value) { e.stopPropagation(); e.preventDefault(); searchInp.value = q = ''; render(); } } });
  searchInp.value = q;
  const searchView = () => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    const hit = (...parts) => { const t = norm(parts.join(' ')); return terms.every((w) => t.includes(w)); };
    const cn = (it) => (it.course ? it.course.name : it.courseName || '');
    const groups = [
      [tr('Fristen & Termine'), data.deadlines.filter((d) => byCourse(d) && hit(d.title, cn(d))).sort((a, b) => Math.abs(a.date - now) - Math.abs(b.date - now)), deadlineRow],
      [tr('Ohne Frist'), undated.filter((d) => byCourse(d) && hit(d.title, cn(d))), undatedRow],
      [tr('Live-Sessions'), data.live.filter((s) => byCourse(s) && hit(s.title, cn(s))), liveRow],
      [tr('Eigene Termine'), own.filter((o) => ownVisible(o) && hit(o.title, o.courseId && byId[o.courseId] ? byId[o.courseId].name : '')).sort((a, b) => a.start - b.start), (o) => ownRow(o, { noDelete: true })],
      [tr('Ankündigungen'), data.announcements.filter((a) => byCourse(a) && hit(a.title, a.full, cn(a))), annRow],
      [tr('Dateien & Inhalte'), allContents.filter((x) => byCourse(x) && hit(x.title, x.kind, cn(x))).sort((a, b) => b.date - a.date),
        (x) => row(x, { lead: h('div', { class: 'ico' }, x.icon), kind: x.kind, meta: fmtDate(x.date) })],
      [tr('Noten & Feedback'), data.grades.filter((g) => byCourse(g) && hit(g.title, g.feedback, cn(g))), (g) => gradeRow(g, { withCourse: true })],
      [tr('Foren'), data.discussions.filter((d) => byCourse(d) && hit(d.title, d.body, cn(d))), (d) => row(d, { lead: h('div', { class: 'ico' }, '💬'), body: true })],
      [tr('Fächer'), courses.filter((c) => hit(c.name, c.sem)).map((c) => ({ course: c, title: c.name, url: courseUrl(c) })),
        (c) => row(c, { lead: h('div', { class: 'ico' }, '📚'), kind: c.course.sem || null, noCourse: true })]
    ].filter(([, list]) => list.length);
    const total = groups.reduce((n, [, list]) => n + list.length, 0);
    const LIM = 25;
    return h('div', { class: 'card' },
      h('div', { class: 'wkhead' }, h('b', {}, total ? tr('{n} Treffer für „{q}“', { n: total, q: q.trim() }) : tr('Nichts gefunden für „{q}“', { q: q.trim() })),
        h('button', { class: 'link', onclick: () => { searchInp.value = q = ''; render(); } }, tr('Suche beenden'))),
      groups.map(([label, list, fn]) => [h('div', { class: 'group' }, label + ' · ' + list.length), h('ul', {}, list.slice(0, LIM).map(fn)),
        list.length > LIM ? h('div', { class: 'empty' }, tr('+ {n} weitere – Suche genauer machen', { n: list.length - LIM })) : null]),
      h('div', { class: 'hint' }, tr('Durchsucht alle Fächer: Titel, Ankündigungstexte, Feedback und Foren. Ankündigungen und Foren der letzten 60 Tage.') + (ui.course ? tr(' (nur gefiltertes Fach)') : '')));
  };

  /* „Neu“: ein Posteingang für Ankündigungen, Dateien, Noten und Foren, nach Zeit gruppiert. Allgemeine Kurse stehen gesammelt unten. */
  const INBOX = [['all', tr('Alles')], ['announcements', '📢 ' + tr('Ankündigungen')], ['contents', '📎 ' + tr('Dateien')], ['grades', '🎓 ' + tr('Noten')], ['discussions', '💬 ' + tr('Foren')]];
  const inboxAll = () => ['announcements', 'contents', 'grades', 'discussions']
    .flatMap((k) => data[k].filter(byCourse).map((it) => Object.assign(it, { type: k })));
  const inboxNew = () => inboxAll().filter((it) => it.isNew && !isGeneral(it.course)).length;
  const inboxRow = (it) => it.type === 'announcements' ? annRow(it)
    : it.type === 'grades' ? gradeRow(it, { withCourse: true })
    : it.type === 'contents' ? row(it, { lead: h('div', { class: 'ico' }, it.icon), kind: it.kind + (it.changed ? tr(' · geändert') : ''), meta: fmtAgo(it.date) })
    : row(it, { lead: h('div', { class: 'ico' }, '💬'), kind: tr('Forum'), meta: it.date ? fmtAgo(it.date) : null, body: true });
  const inboxView = () => {
    const f = INBOX.some(([k]) => k === ui.inbox) ? ui.inbox : 'all';
    const base = inboxAll().filter((it) => f === 'all' || it.type === f);
    const list = base.filter((it) => !ui.onlyNew || it.isNew).sort((a, b) => b.date - a.date);
    const mine = list.filter((it) => !isGeneral(it.course)), gen = list.filter((it) => isGeneral(it.course));
    const when = (t) => (!t ? tr('Älter') : t >= today ? tr('Heute') : t >= today - DAY ? tr('Gestern') : t >= today - 6 * DAY ? tr('Letzte 7 Tage') : tr('Älter'));
    const groups = new Map();
    for (const it of mine) { const b = when(it.date); if (!groups.has(b)) groups.set(b, []); groups.get(b).push(it); }
    const max = ui.inboxMax || 40;
    let left = max;
    const nNew = (k) => inboxAll().filter((it) => it.isNew && !isGeneral(it.course) && (k === 'all' || it.type === k)).length;
    return h('div', { class: 'card' },
      h('div', { class: 'wkhead' },
        h('div', { class: 'pills' }, INBOX.map(([k, l]) => h('button', { class: 'pill' + (f === k ? ' on' : ''), onclick: () => { ui.inbox = k; ui.inboxMax = 0; render(); } },
          l, nNew(k) ? h('span', { class: 'c n' }, String(nNew(k))) : null))),
        h('label', {}, h('input', { type: 'checkbox', checked: !!ui.onlyNew, onchange: (e) => { ui.onlyNew = e.target.checked; render(); } }), tr('Nur Neues'))),
      mine.length ? [...groups].map(([b, items]) => {
        if (left <= 0) return null;
        const part = items.slice(0, left); left -= part.length;
        return [h('div', { class: 'group' }, b), h('ul', {}, part.map(inboxRow))];
      }) : empty(ui.onlyNew ? tr('Nichts Neues seit deinem letzten Besuch.') : tr('Hier ist noch nichts.')),
      mine.length > max ? h('button', { class: 'link showmore', onclick: () => { ui.inboxMax = max + 40; render(); } }, tr('Ältere zeigen ({n})', { n: mine.length - max })) : null,
      gen.length ? h('details', { class: 'gen' }, h('summary', {}, tr('Allgemeine Kurse ({n})', { n: gen.length })), h('ul', {}, gen.slice(0, 30).map(inboxRow))) : null,
      ['announcements', 'contents', 'grades', 'discussions'].map(errNote),
      h('div', { class: 'hint' }, tr('Ankündigungen und Foren der letzten 60 Tage, Dateien der letzten 30 Tage. Ältere Dateien findest du über die Suche oder auf der Fach-Seite.')));
  };

  const views = { week: weekView, inbox: inboxView, courses: coursesView, calendar: calendarView };

  /* DELEGADO-START: nur in der eigenen Version. „Für die Klasse veröffentlichen“: kommende Termine ohne persönliche Daten
     über die Erweiterung in die Klassen-Seite (GitHub Pages, Datei termine.json) schreiben. */
  const pubSt = Object.assign({ skip: [], kinds: {}, courseNote: {}, msg: '', avisoSkip: [], last: 0, url: '', auto: true, lastSig: '', autoAt: 0, autoTry: 0 }, store.get('publish', {}));
  /* Ohne Erweiterung (iPhone/Safari mit Lesezeichen): Veröffentlichen über die eigene Editor-Seite auf GitHub Pages.
     Der GitHub-Schlüssel liegt dort (github.io), nie im Speicher des Campus. */
  const PUB_SITE = 'https://lyixo.github.io', PUB_EDITOR = PUB_SITE + '/agenda/editar.html';
  /* Fingerabdruck der Termine ohne Zeitstempel: gleich = nichts Neues zu veröffentlichen. */
  const pubSig = (p) => JSON.stringify(Object.assign({}, p, { updated: '' }));
  let pubState = null;
  const PUB_PROGRAM = 'Máster en Dirección y Organización de Proyectos · Octubre 26';
  const PUB_KIND = { exam: 'Examen', due: 'Abgabe', class: 'Klasse', opt: 'Optional' };
  const clsName = (c) => {
    if (!c) return '';
    if (/coordinaci[oó]n/i.test(c.name)) return 'Coordinación del máster';
    let s = c.name.replace(/^\d{4}-\d{2}_[^_]+_M\d+_/, '').replace(/^\d{2}[-.]\d{2}\.\s*/, '').split(':')[0].replace(/_T_[\w-]+$/, '').trim();
    if (s === s.toUpperCase()) s = s.charAt(0) + s.slice(1).toLowerCase();
    return s.replace(/\b(pmp|scrum|tfg|tfm|efqm)\b/gi, (m) => m.toUpperCase());
  };
  /* Kurse ohne Semester (Centro de Escritura, SCRUM, Coordinación) gehören nicht zum Studienplan: immer „Opcional“,
     unabhängig davon, auf welchem Gerät und mit welchen ausgeblendeten Kursen veröffentlicht wird. */
  const pubKindOf = (c, title) => (/examen/i.test(title) ? 'exam' : !c || !c.sem || isGeneral(c) ? 'opt' : null);
  const pubItems = () => {
    const until = now + 16 * 7 * DAY, out = [];
    const ok = (c) => c && !hidden.has(c.id);
    const add = (o) => { if (ok(o.c) && o.start >= now - 3600e3 && o.start < until) out.push(o); };
    for (const d of data.deadlines) add({ key: 'd:' + (d.colId || (d.course ? d.course.id : '') + '|' + d.title) + '|' + d.date, c: d.course, title: d.title, start: d.date, end: null,
      kind: d.event ? pubKindOf(d.course, d.title) || 'class' : /examen/i.test(d.title) ? 'exam' : d.course && !d.course.sem ? 'opt' : 'due',
      /* Direktlink zur Aufgabe: zeigt jedem im Campus den eigenen Abgabestatus. Nur der Link, nichts von deinem Status. */
      task: !d.event && /\/ultra\/redirect\?/.test(d.url || '') ? d.url : '' });
    for (const s of data.live) add({ key: 's:' + s.sid + ':' + s.date, c: s.course, title: s.title, start: s.date, end: s.end === Infinity ? null : s.end, kind: pubKindOf(s.course, s.title) || 'class' });
    for (const o of own) {
      if (!SEED.some((x) => x.id === o.id) || clashOwn(o)) continue;
      const c = byId[o.courseId];
      add({ key: 'o:' + o.id, c, title: o.title, start: o.start, end: o.end || null, allDay: !!o.allDay, kind: pubKindOf(c, o.title) || (isSession(o) ? 'class' : 'due') });
    }
    for (const e of annEvents) {
      if (!e.course || own.some((o) => o.courseId === e.course.id && (e.allDay ? startOfDay(o.start) === e.start : near(o.start, e.start)))) continue;
      add({ key: 'a:' + e.id, c: e.course, title: e.label, start: e.start, end: e.end || null, allDay: !!e.allDay, kind: e.exam ? 'exam' : pubKindOf(e.course, e.label) || 'class',
        note: e.src === 'doc' ? 'Según el calendario del profesor' : e.src === 'title' ? 'Según el curso' : 'Según un anuncio del profesor' });
    }
    for (const x of out) if (pubSt.kinds[x.key]) x.kind = pubSt.kinds[x.key];
    return out.sort((a, b) => a.start - b.start);
  };
  const pubAvisos = () => data.announcements.filter((a) => a.course && !hidden.has(a.course.id) && !isGeneral(a.course) && a.date > now - 7 * DAY)
    .map((a) => ({ key: 'n:' + a.course.id + '|' + a.date, c: a.course, title: a.title, date: a.date }));
  const pubPayload = () => {
    const iso = (t) => new Date(t).toISOString();
    return {
      version: 1, updated: iso(Date.now()), by: 'el delegado', program: PUB_PROGRAM, message: String(pubSt.msg || '').trim(),
      items: pubItems().filter((x) => !pubSt.skip.includes(x.key)).map((x) => {
        const note = [x.note, pubSt.courseNote[x.c.id]].filter(Boolean).join(' · ');
        const o = { kind: x.kind, course: clsName(x.c), courseId: x.c.id, title: x.title, start: iso(x.start) };
        if (x.end) o.end = iso(x.end);
        if (x.allDay) o.allDay = true;
        if (note) o.note = note;
        if (x.task) o.task = x.task;
        return o;
      }),
      avisos: pubAvisos().filter((a) => !pubSt.avisoSkip.includes(a.key)).map((a) => ({ course: clsName(a.c), title: a.title, date: iso(a.date) }))
    };
  };
  const pubSave = () => {
    const keys = new Set(pubItems().map((x) => x.key)), ak = new Set(pubAvisos().map((a) => a.key));
    pubSt.skip = pubSt.skip.filter((k) => keys.has(k)); pubSt.avisoSkip = pubSt.avisoSkip.filter((k) => ak.has(k));
    for (const k of Object.keys(pubSt.kinds)) if (!keys.has(k)) delete pubSt.kinds[k];
    store.set('publish', pubSt);
  };
  const toBridge = toExt;
  /* Ein Veröffentlichungs-Vorgang. Über die Erweiterung (Laptop) oder, ohne Erweiterung, über die Editor-Seite (iPhone). */
  const pubDone = (payload, auto) => {
    pubSt.last = Date.now(); pubSt.lastSig = pubSig(payload); if (auto) pubSt.autoAt = Date.now();
    store.set('publish', pubSt);
  };
  const sendPublish = (payload, auto, cb) => {
    const id = Math.random().toString(36).slice(2);
    let tm = null;
    const onMsg = (e) => {
      if (!e.data || e.data.nbx !== 'published' || e.data.id !== id) return;
      offExt(onMsg); clearTimeout(tm);
      if (e.data.ok) { pubSt.url = e.data.url || pubSt.url; pubDone(payload, auto); }
      cb(e.data);
    };
    onExt(onMsg);
    tm = setTimeout(() => { offExt(onMsg); cb({ ok: false, error: 'Keine Antwort von der Erweiterung nach 60 s. Prüf die Internetverbindung, lade die Erweiterung unter chrome://extensions neu und versuch es noch einmal.' }); }, 60000);
    toBridge({ nbx: 'publish', id, data: payload });
  };
  const viaEditor = (payload) => {
    let sent = false;
    const onMsg = (e) => {
      if (e.origin !== PUB_SITE || !e.data) return;
      if (e.data.nbx === 'editor-ready' && !sent && win) { sent = true; win.postMessage({ nbx: 'agenda', data: payload }, PUB_SITE); pubState = { busy: true, text: 'Termine übergeben. Tippe im Editor auf „Publicar“.' }; render(); }
      if (e.data.nbx === 'editor-published') {
        removeEventListener('message', onMsg);
        pubDone(payload, false); pubSt.url = PUB_SITE + '/agenda/'; store.set('publish', pubSt);
        pubState = { ok: true, text: 'Veröffentlicht. In etwa einer Minute ist die Klassen-Seite für alle aktuell.' }; render();
      }
    };
    addEventListener('message', onMsg);
    const win = window.open(PUB_EDITOR + '#campus', '_blank');
    if (!win) { removeEventListener('message', onMsg); pubState = { ok: false, text: 'Der Editor konnte nicht geöffnet werden (Pop-up-Sperre). Erlaube Pop-ups für den Campus und tippe noch einmal.' }; render(); return; }
    pubState = { busy: true, text: 'Editor wird geöffnet …' }; render();
  };
  const doPublish = () => {
    pubSave();
    const payload = pubPayload();
    if (!hasBridge()) { viaEditor(payload); return; }
    pubState = { busy: true, text: 'Wird veröffentlicht …' }; render();
    sendPublish(payload, false, (r) => {
      pubState = r.ok ? { ok: true, text: 'Veröffentlicht. In etwa einer Minute ist die Klassen-Seite für alle aktuell.' } : { ok: false, text: r.error || 'Unbekannter Fehler', setup: !!r.setup };
      render();
    });
  };
  /* Automatik (nur mit Erweiterung): nach dem Laden prüfen, ob sich die Termine seit dem letzten Veröffentlichen geändert haben.
     Höchstens alle 10 Minuten ein Versuch; nach einem Einrichtungsfehler bis zum nächsten Öffnen nicht mehr. */
  const autoPublishSoon = () => {
    if (!pubSt.auto || !hasBridge() || window.__nbxAutoOff) return;
    setTimeout(() => {
      if (!host.isConnected) return;
      const payload = pubPayload();
      if (pubSig(payload) === pubSt.lastSig || Date.now() - (pubSt.autoTry || 0) < 10 * 60e3) return;
      pubSt.autoTry = Date.now(); store.set('publish', pubSt);
      sendPublish(payload, true, (r) => {
        if (!r.ok) { pubSt.autoErr = r.error || 'Fehler'; if (r.setup) window.__nbxAutoOff = true; } else pubSt.autoErr = '';
        store.set('publish', pubSt); render();
      });
    }, window.__nbxAutoDelay != null ? window.__nbxAutoDelay : 2500);
  };
  const publishView = () => {
    const items = pubItems(), avisos = pubAvisos(), skip = new Set(pubSt.skip), askip = new Set(pubSt.avisoSkip);
    const n = items.filter((x) => !skip.has(x.key)).length;
    const toggle = (list, key, on) => { const i = list.indexOf(key); if (on && i >= 0) list.splice(i, 1); if (!on && i < 0) list.push(key); pubSave(); render(); };
    const box = 'display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line)';
    const courses = [...new Map(items.map((x) => [x.c.id, x.c])).values()];
    return [
      h('div', { class: 'group' }, 'Für die Klasse veröffentlichen'),
      h('div', { class: 'hint' }, 'Das kommt auf die Klassen-Seite: Termine der nächsten 16 Wochen und Ankündigungs-Titel der letzten 7 Tage. Nie dabei: Noten, Abgabestatus, Feedback, Videokonferenz-Links. Häkchen weg = bleibt privat.'),
      h('div', { class: 'group' }, 'Nachricht an die Klasse (optional)'),
      h('textarea', { class: 'inp', rows: 2, style: 'width:100%;box-sizing:border-box;resize:vertical', placeholder: 'z. B. Recordad: el domingo examen de Esquema', oninput: (e) => { pubSt.msg = e.target.value; store.set('publish', pubSt); } }, pubSt.msg || ''),
      h('div', { class: 'group' }, 'Termine (' + n + ' von ' + items.length + ')'),
      items.length ? h('ul', {}, items.map((x) => h('li', { style: box + (skip.has(x.key) ? ';opacity:.45' : '') },
        h('input', { type: 'checkbox', checked: !skip.has(x.key), onchange: (e) => toggle(pubSt.skip, x.key, e.target.checked), 'aria-label': 'Veröffentlichen: ' + x.title }),
        h('div', { style: 'flex:1;min-width:0' },
          h('div', { class: 'title' }, x.title),
          h('div', { class: 'meta' }, h('span', {}, clsName(x.c) + ' · ' + fmtDate(x.start) + (x.allDay ? '' : ' ' + fmtTime(x.start) + (x.end ? '–' + fmtTime(x.end) : ''))), x.note ? h('span', { class: 'kind' }, x.note) : null)),
        h('select', { class: 'inp', style: 'flex:0 0 auto;min-width:0;width:auto', onchange: (e) => { pubSt.kinds[x.key] = e.target.value; pubSave(); render(); } },
          Object.entries(PUB_KIND).map(([k, l]) => h('option', { value: k, selected: x.kind === k }, l)))))) : empty('Keine kommenden Termine.'),
      courses.length ? [h('div', { class: 'group' }, 'Hinweis pro Fach (optional)'),
        h('ul', {}, courses.map((c) => h('li', { style: box + ';align-items:center' }, h('span', { style: 'flex:1;min-width:0' }, clsName(c)),
          h('input', { class: 'inp', style: 'flex:0 1 260px', placeholder: 'z. B. Solo inscritos', value: pubSt.courseNote[c.id] || '', onchange: (e) => { pubSt.courseNote[c.id] = e.target.value.trim(); store.set('publish', pubSt); } }))))] : null,
      avisos.length ? [h('div', { class: 'group' }, 'Ankündigungen der Lehrkräfte (nur Titel)'),
        h('ul', {}, avisos.map((a) => h('li', { style: box + (askip.has(a.key) ? ';opacity:.45' : '') },
          h('input', { type: 'checkbox', checked: !askip.has(a.key), onchange: (e) => toggle(pubSt.avisoSkip, a.key, e.target.checked), 'aria-label': 'Veröffentlichen: ' + a.title }),
          h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'title' }, a.title), h('div', { class: 'meta' }, clsName(a.c) + ' · ' + fmtDate(a.date))))))] : null,
      pubState ? h('div', { class: pubState.ok ? 'hint' : pubState.busy ? 'hint' : 'err', style: 'padding-top:12px' }, pubState.text) : null,
      h('div', { style: 'display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:12px 0' },
        h('button', { class: 'pri', disabled: pubState && pubState.busy ? true : null, onclick: doPublish }, 'Jetzt veröffentlichen'),
        pubSt.url ? h('a', { href: pubSt.url, target: '_blank', rel: 'noopener' }, 'Klassen-Seite öffnen') : null,
        h('button', { class: 'link', onclick: () => (hasBridge() ? toBridge({ nbx: 'openOptions' }) : window.open(PUB_EDITOR, '_blank')) }, 'GitHub-Verbindung einrichten'),
        h('button', { class: 'link', onclick: () => go('week') }, 'Zurück')),
      h('div', { class: 'hint' }, pubSt.last ? 'Zuletzt veröffentlicht: ' + fmtDate(pubSt.last) + ' ' + fmtTime(pubSt.last) + (pubSt.autoAt && pubSt.autoAt === pubSt.last ? ' (automatisch)' : '') : 'Noch nie veröffentlicht.'),
      hasBridge() ? h('label', { style: 'padding:4px 0 10px' }, h('input', { type: 'checkbox', checked: !!pubSt.auto, onchange: (e) => { pubSt.auto = e.target.checked; store.set('publish', pubSt); if (pubSt.auto) autoPublishSoon(); render(); } }),
        'Automatisch veröffentlichen, sobald sich im Campus etwas ändert (wenn das Dashboard offen ist)') : h('div', { class: 'hint' }, 'Auf dem Handy: „Jetzt veröffentlichen“ öffnet deinen Editor auf GitHub, dort tippst du auf „Publicar“.'),
      pubSt.autoErr ? h('div', { class: 'err' }, 'Automatik: ' + pubSt.autoErr) : null
    ];
  };
  views.publish = publishView;
  const delegadoBtn = () => h('button', { onclick: () => { pubState = null; go('publish'); }, title: pubSt.autoAt ? 'Zuletzt automatisch veröffentlicht: ' + fmtDate(pubSt.autoAt) + ' ' + fmtTime(pubSt.autoAt) : null },
    '📣 Für die Klasse' + (pubSt.auto && hasBridge() ? (pubSt.autoErr ? ' · ⚠️' : pubSt.autoAt && now - pubSt.autoAt < DAY ? ' · auto ' + fmtTime(pubSt.autoAt) : ' · auto') : ''));
  /* DELEGADO-END */


  /* Kursauswahl: 1. Semester, 2. Semester, ganzjährig, dann allgemeine Kurse; innerhalb alphabetisch. */
  const courseGroups = () => {
    const label = { '1S': tr('1. Semester'), '2S': tr('2. Semester'), I: tr('Ganzjährig'), general: tr('Allgemein'), other: tr('Weitere Kurse') };
    const rank = { '1S': 0, '2S': 1, I: 2, other: 3, general: 4 };
    const groups = new Map();
    for (const c of [...courses].sort((a, b) => a.short.localeCompare(b.short))) {
      const k = isGeneral(c) ? 'general' : c.sem in rank ? c.sem : 'other';
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(c);
    }
    return [...groups].sort((a, b) => rank[a[0]] - rank[b[0]]).map(([k, list]) => [label[k], list]);
  };

  /* Tabs: vier Ansichten – nach Zeit (Woche, Kalender), nach Fach, und was neu ist. */
  const tabBtns = (counts) => {
    /* Während einer Suche ist kein Tab markiert. */
    const on = (k) => !q.trim() && ui.tab === k;
    const badge = (k, n) => (n ? h('span', { class: 'c' + (k === 'inbox' ? ' n' : '') }, String(n)) : null);
    return TABS.map(([k, l]) => h('button', { class: 'tab' + (on(k) ? ' on' : ''), onclick: () => { if (k === 'courses') ui.detail = null; go(k); } }, l, badge(k, counts[k])));
  };

  const render = () => {
    store.set('ui', ui);
    const searching = !!q.trim();
    /* Das Suchfeld wird bei jedem Neuzeichnen wiederverwendet; Fokus und Cursor bleiben erhalten. */
    const focused = root.activeElement === searchInp, caret = [searchInp.selectionStart, searchInp.selectionEnd];
    const liveNow = data.live.filter((s) => byCourse(s) && isLive(s));
    const ownNow = ownSessions().filter(ownLive);
    const counts = { week: weekItems().filter((it) => !isChecked(it)).length, inbox: inboxNew() };

    body.replaceChildren(...[
      ui.course ? h('div', { class: 'filterbar' }, tr('🔎 Filter aktiv: nur „') + byId[ui.course].name + '“ – ', h('button', { class: 'link', onclick: () => { ui.course = ''; render(); } }, tr('alle Kurse zeigen'))) : null,
      liveNow.length + ownNow.length ? h('div', { class: 'banner' }, h('ul', {}, liveNow.map(liveRow), ownNow.map(ownSessionRow))) : null,
      h('div', { class: 'nav' },
        h('div', { class: 'tabs' }, tabBtns(counts)),
        h('div', { class: 'tools' },
          searchInp,
          h('select', { onchange: (e) => { ui.course = e.target.value; render(); } },
            h('option', { value: '' }, tr('Alle Kurse')),
            courseGroups().map(([label, list]) => h('optgroup', { label }, list.map((c) => h('option', { value: c.id, selected: ui.course === c.id, title: c.name },
              c.short + (hidden.has(c.id) ? ' ' + tr('(ausgeblendet)') : '')))))))),
      searching ? searchView() : (views[ui.tab] || views.week)(),
      h('footer', {}, h('span', {}, tr('Version 26.11. 19:00 · Stand ') + fmtTime(now) + tr(' · lädt alle 5 Min. neu · Esc schließt')),
        h('span', { class: 'credit' }, tr('Erstellt von') + ' ', CREATOR.url ? h('a', { href: CREATOR.url, target: '_blank', rel: 'noopener' }, CREATOR.name) : CREATOR.name),
        h('a', { class: 'mail', href: 'https://outlook.office.com/mail/', target: '_blank', rel: 'noopener' }, tr('📧 Uni-Mail')),
        typeof delegadoBtn === 'function' ? delegadoBtn() : null,
        h('button', { class: 'pri', onclick: () => { store.set('lastSeen', Date.now()); store.set('grades', gradeSnap); store.set('feedback', fbSnap); close(); } }, tr('Alles als gesehen markieren')))].flat(Infinity).filter((x) => x != null && x !== false));
    if (focused) { searchInp.focus(); try { searchInp.setSelectionRange(caret[0], caret[1]); } catch (e) {} }
    clearTimeout(snapTimer); snapTimer = setTimeout(postSnapshot, 800);
  };
  /* Für die Chrome-Erweiterung (bridge.js): kommende Sessions und offene Abgaben, damit sie erinnern kann.
     Ohne Erweiterung hört niemand zu und es passiert nichts. */
  let snapTimer = null;
  function postSnapshot() {
    try {
      const two = now + 2 * DAY, week = now + 7 * DAY;
      const sessions = [
        ...data.live.filter((s) => s.end >= now && s.date < two && s.course).map((s) => ({ key: 's:' + s.sid + ':' + s.date, title: s.title, course: s.course.short, courseId: s.course.id, start: s.date, end: s.end === Infinity ? s.date + 2 * 3600e3 : s.end, url: s.url })),
        ...ownSessions().filter((o) => ownEnd(o) >= now && o.start < two).map((o) => ({ key: 'o:' + o.id + ':' + o.start, title: o.title, course: byId[o.courseId] ? byId[o.courseId].short : '', courseId: o.courseId || '', start: o.start, end: ownEnd(o),
          url: o.url || '', join: /bbcollab\.com/.test(o.url || '') ? o.url : '' })),
        ...annEvents.filter((e) => !e.exam && !e.allDay && annVisible(e) && annEnd(e) >= now && e.start < two).map((e) => ({ key: 'a:' + e.id, title: e.src ? e.label : e.label + ' (laut Ankündigung)', course: e.course ? e.course.short : '', courseId: e.course ? e.course.id : '', start: e.start, end: annEnd(e), url: e.url, join: e.join || '' }))];
      const deadlines = data.deadlines.filter((d) => !d.event && d.date >= now && d.date < week).map((d) => ({ title: d.title, date: d.date, done: d.att ? isDone(d) : null, courseId: d.course ? d.course.id : '' }));
      toExt({ nbx: 'snapshot', data: { sessions, deadlines } });
    } catch (e) {}
  }
  render();
  if (typeof autoPublishSoon === 'function') autoPublishSoon();
  /* Nach dem automatischen Neuladen an derselben Stelle weiterlesen. */
  if (window.__nbxScroll) { try { scroll.scrollTop = window.__nbxScroll; } catch (e) {} delete window.__nbxScroll; }

  /* Nächstes Neuladen: spätestens nach 5 Minuten, früher wenn ein Session-Raum auf- oder zugeht. */
  const changes = data.live.flatMap((s) => [s.open, s.end]).filter((t) => t > now && t !== Infinity).map((t) => t - now + 2000);
  /* Nicht neu laden, solange gerade etwas eingetippt wird – sonst wäre der Text weg. */
  const scheduleRefresh = (ms) => {
    refreshTimer = setTimeout(() => {
      if (!host.isConnected) return;
      const a = root.activeElement;
      if (a && a.tagName === 'INPUT' && a.value) scheduleRefresh(60e3);
      else refresh();
    }, ms);
  };
  scheduleRefresh(Math.min(REFRESH_MS, ...changes));
})();
