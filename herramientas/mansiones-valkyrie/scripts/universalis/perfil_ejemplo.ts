// Perfil de ejemplo para partida_mesa.ts: «La noche que no termina» (tres noches que se repiten,
// 2-4 investigadores). Cópialo y cámbialo para tu escenario: lo que va aquí es lo que una mesa real
// haría en ese escenario y no se puede deducir de los ficheros.
//
// Estrategias (STRAT): N = mesa que juega sin saber el truco; C = mesa que no alerta a Gaspar y quema
// el cuaderno en la noche 3; B = mesa que se lleva a Clara y va a por la campana.
import type { Perfil, Inv, Ctx } from './partida_mesa.ts';

const G_SALON = ['TokenGaspar', 'TokenXSalon', 'TokenClara1', 'TokenInesSalon', 'TokenCharco', 'TokenOrquesta', 'TokenInvitada'];
const G_EXT = ['TokenXTerraza', 'TokenVistaMar', 'TokenFarol', 'TokenXMuelle', 'TokenBordeMuelle', 'TokenPendiente', 'TokenXCampanario', 'TokenRayas', 'TokenCampana', 'TokenClara3'];
const G_COM = ['TokenRegistro', 'TokenReloj', 'TokenPerchero', 'TokenXComedor', 'TokenDoctor', 'TokenRosa', 'TokenAparador', 'TokenTarta', 'TokenXBiblioteca', 'TokenEstanteria', 'TokenFotos'];
const G_ARR = ['TokenXEscalera', 'TokenRetrato', 'TokenXPasillo', 'TokenXCuartoClara', 'TokenDibujos', 'TokenXSuite', 'TokenLibroCuentas', 'TokenGramofono', 'TokenInesSuite', 'TokenJoyero'];
const CLARA = ['TokenClara3', 'TokenClara1', 'TokenClara2'];
const vigilR = (c: Ctx) => (c.NH >= 3 ? 2 : 0);

const perfil: Perfil = {
  inicio: 'TileInicio:s1',
  nocheVar: 'noche', horaVar: 'hora',
  apodos: [[/el Ancla|al Ancla|del Ancla/i, 1], [/la Mano Caliente/i, 2], [/Once Segundos/i, 3], [/Manos Rápidas/i, 5], [/Cara al Agua/i, 6], [/Último Golpe/i, 7], [/la Pareja de Baile/i, 8]],
  vidaMonstruos: { CustomMonsterAhogado: [2, 1, 2], CustomMonsterGaspar: [6, 2, 3], CustomMonsterGasparEntero: [8, 2, 3], CustomMonsterDoctor: [2, 1, 3] },
  accesos: { TokenXBodega: ['TileComedor:s3'], TokenXTerraza: ['TileInicio:s2', 'TileInicio:s3'] },
  noMarcar: /^TokenX|^TokenCampana$/,

  // Qué quiere hacer cada uno. r = posición en la mesa (0, 1, 2, 3).
  plan(i, c) {
    const n = c.noche(), h = c.hora(), S = c.STRAT, e = c.estado; let r = c.INV.indexOf(i);
    // en la noche 3, el Ancla (quien sujetó a Clara la noche 2) va a por ella: el texto le da ventaja
    if (n === 3) { const a = c.porApodo(1); const k = a ? c.INV.indexOf(a) : -1; if (k > 0) { if (r === k) r = 0; else if (r === 0) r = k; } }
    if (c.NH <= 2) {
      if (n === 1) return r === 0 ? [...G_SALON, 'TokenXTerraza', 'TokenVistaMar', 'TokenXMuelle', 'TokenBordeMuelle', 'TokenXCampanario', 'TokenClara3'] : [...G_COM, ...G_ARR.slice(0, 9)];
      if (n === 2) {
        if (r === 0 && h >= 4 && !e.vigil) return CLARA;
        return r === 0
          ? ['TokenRosa', 'TokenXBiblioteca', 'TokenEstanteria', 'TokenFotos', 'TokenXBodega2', 'TokenXBodega', 'TokenTrajes', 'TokenExvoto', ...CLARA]
          : ['TokenGaspar', 'TokenXEscalera', 'TokenXPasillo', 'TokenXGaspar', 'TokenBotas', 'TokenCuaderno', 'TokenXCuartoClara', 'TokenDibujos', 'TokenXSuite', 'TokenInesSuite', 'TokenGramofono', 'TokenLibroCuentas'];
      }
      if (S === 'B' || (S === 'C' && r === 0)) return r === 0
        ? ['TokenClara1', 'TokenClara2', 'TokenClara3', 'TokenXTerraza', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana']
        : ['TokenXTerraza', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana'];
      return r === 0
        ? ['TokenClara1', 'TokenClara2', 'TokenClara3', 'TokenXEscalera', 'TokenXPasillo', 'TokenXSuite', 'TokenInesSuite', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana']
        : ['TokenXEscalera', 'TokenXPasillo', 'TokenXGaspar', 'TokenBotas', 'TokenCuaderno', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana'];
    }
    if (n === 1) return [c.NH === 3 ? [...G_SALON, 'TokenXTerraza', 'TokenVistaMar', 'TokenXMuelle', 'TokenBordeMuelle', 'TokenXCampanario'] : G_SALON, G_COM, G_ARR, G_EXT][r];
    const pend = c.V('pendiente') === 1 ? ['TokenInvitada'] : ['TokenPendiente', 'TokenInvitada'];
    if (n === 2) {
      if (r === vigilR(c) && h >= 4 && !e.vigil) return CLARA;
      return [
        ['TokenRosa', 'TokenDespensa', 'TokenXBodega', 'TokenTrajes', 'TokenExvoto', 'TokenXBiblioteca', 'TokenEstanteria', 'TokenFotos'],
        ['TokenGaspar', 'TokenXEscalera', 'TokenXPasillo', 'TokenXGaspar', 'TokenBotas', 'TokenCuaderno', 'TokenFrascos'],
        ['TokenXEscalera', 'TokenXPasillo', 'TokenXSuite', 'TokenInesSuite', 'TokenGramofono', 'TokenLibroCuentas', 'TokenXCuartoClara', 'TokenDibujos', 'TokenJoyero'],
        ['TokenXBiblioteca', 'TokenEstanteria', 'TokenFotos', 'TokenTelefono', 'TokenPerchero', 'TokenTarta', 'TokenCharco', ...pend, 'TokenXBodega', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana', 'TokenBordeMuelle'],
      ][r];
    }
    return [
      ['TokenClara1', 'TokenClara2', 'TokenClara3', 'TokenXTerraza', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana'],
      ['TokenXEscalera', 'TokenXPasillo', 'TokenXGaspar', 'TokenBotas', 'TokenCuaderno', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana'],
      ['TokenXTerraza', 'TokenXMuelle', 'TokenXCampanario', 'TokenRayas', 'TokenCampana'],
      ['TokenDoctor', ...(c.V('pendiente') === 1 ? ['TokenInvitada'] : []), 'TokenXTerraza', 'TokenXMuelle', 'TokenXCampanario', 'TokenCampana'],
    ][r];
  },
  // Citas: lo que el texto pide («a las doce, en la terraza») y una mesa atenta cumple.
  cita(i, c) {
    const n = c.noche(), h = c.hora(), r = c.INV.indexOf(i), e = c.estado;
    if (n === 1 && h === 5 && !/Terraza|Salon|Inicio/.test(i.pos)) return 'TileTerraza:s1';
    if (n === 2 && h === 2 && r === 0) return 'TileComedor:s4';
    if (e.vigil === i) { const t = CLARA.find(c.onBoard); if (t) return c.access(t)[0] ?? null; }
    if (n === 3 && e.claraWith === i && !e.claraConInes && c.STRAT !== 'B' && c.NH <= 2) return 'TileSuiteInes:s2';
    return null;
  },
  preferir(c) {
    const p = [/Venga con nosotros|Que venga con vosotros/, /^Tocarla al revés/, /Gaspar, el maître/, /Quedarte con ella/, /Llevarla con vosotros/, /Dejar a Clara con su madre/, /Pedirle que os ayude/, /Sujetarla con las dos/, /Beber/, /Acompañarla/, /Hacia el muelle/, /Intentarlo|^Tocar$|^Agarrarse|^Asomarse|Intentar cogerla|^Bailar/];
    return c.STRAT === 'C' && c.noche() === 3 ? [/Quemarlo/, ...p] : p;
  },
  evitar(c) {
    const base = 'como la tocó Inés|dibujos de Clara|Quemarlo|Inés, su madre|El doctor Martínez|No lo sabemos|Lo que no cuadra|Decirle que sabéis';
    return new RegExp(c.STRAT === 'C' ? base + '|Decirle que os acordáis|Hablarle de la foto' : base, 'i');
  },
  quienSufre(raw, c) {
    if (/Cada investigador en la planta baja/.test(raw)) return c.vivos().filter((i) => /Inicio|Salon|Comedor|Biblioteca|Bodega|Terraza|Muelle/.test(i.pos));
    if (/Cada investigador en la bodega o en el muelle/.test(raw)) return c.vivos().filter((i) => /Bodega|Muelle/.test(i.pos));
    if (/Quien la lleva/.test(raw) && c.estado.claraWith) return [c.estado.claraWith];
    if (/El investigador más cercano a Gaspar/.test(raw)) { const g = c.monstruo(/Gaspar/); if (g) { const t = c.nearestInv(g[1]); if (t) return [t]; } }
    return null;
  },
  elegirInvestigador(ev, c) {
    const e = c.estado;
    if (ev === 'EventMedianoche2Vigila') return e.vigil ?? e.claraWith ?? c.actor;
    if (ev === 'EventOscurasQuien') return c.vivos().find((i) => /Terraza|Salon|Inicio/.test(i.pos));
    if (ev === 'EventParadaQuien') return c.fallaronVoluntad[0];
    if (ev === 'EventBandejaTirada') return c.vivos().find((i) => i.pos === 'TileComedor:s4');
    if (ev === 'EventVals') { const { d } = c.bfs('TileSalon:s2'); return c.vivos().filter((i) => i !== e.claraWith).sort((a, b) => (d[a.pos] ?? 99) - (d[b.pos] ?? 99))[0]; }
    return undefined;
  },
  respuestas: [
    [/Hay alguien en la cocina/, (c) => c.vivos().some((i) => i.pos === 'TileComedor:s4'), /Hay alguien/, /No hay nadie/],
    [/Sí, hay alguno/, (c) => c.vivos().some((i) => /Terraza|Salon|Inicio/.test(i.pos)), /Sí, hay alguno/, /No hay ninguno/],
  ],
  // Lo que los textos mueven o deciden y la app no sabe (dónde está Clara, quién sueña…).
  alEvento(name, raw, c) {
    const e = c.estado, a = c.actor;
    if (/Mueve a tu investigador a cualquier espacio del muelle/.test(raw)) { a.pos = 'TileMuelle:s3'; c.P(`      ${a.n} baja por la escalera de servicio al muelle.`); }
    if (/al pie de la escalera del campanario/.test(raw) && /Coloca a/.test(raw)) { const h = c.porApodo(7); if (h) h.pos = 'TileCampanario:s1'; }
    if (/en el muelle, junto a la puerta del campanario/.test(raw)) { const h = c.porApodo(7); if (h) h.pos = 'TileMuelle:s4'; }
    if (name === 'TokenCampana') (e.campanaVista ??= {})[c.noche()] = true;
    if (name === 'EventClaraLlevar' || name === 'EventClaraRescate') { e.claraWith = a; c.P(`      👧 Clara va con ${a.n}.`); }
    if (name === 'EventClaraVigilar') { e.vigil = a; c.P(`      👧 ${a.n} se queda con Clara hasta medianoche.`); }
    if (name === 'EventClaraConInes') { e.claraWith = null; e.claraConInes = true; c.P('      👧 Clara se encierra con Inés en la suite.'); }
    if (/^Event(GasparArrebata|GasparEntraSuite)$/.test(name)) { e.claraWith = null; e.claraConInes = false; c.P('      👧 Gaspar se lleva a Clara al muelle.'); }
    // a 4: el sueño del cuarto de Gaspar saca a un investigador del tablero dos rondas
    if (/^EventSueno[PV]$/.test(name)) { e.dreamer = a; a.pos = 'SUENO'; c.P(`      🌊 ${a.n} es el Náufrago: fuera del tablero dos rondas.`); }
    if (e.dreamer && /^Event(SuenoDespiertaMuelle|Sueno2B)$/.test(name)) { e.dreamer.pos = 'TileMuelle:s3'; c.P(`      🌊 ${e.dreamer.n} vuelve en el muelle.`); e.dreamer = null; }
    if (e.dreamer && /^EventSuenoC1(Si|No)$/.test(name)) { e.dreamer.pos = 'TileCuartoGaspar:s1'; c.P(`      🌊 ${e.dreamer.n} vuelve en el cuarto de Gaspar.`); e.dreamer = null; }
  },
  // Diálogos que no se resuelven pulsando un botón «razonable».
  dialogo(d, ev, raw, c) {
    const en = d.buttons.filter((b: any) => b.enabled); const e = c.estado;
    if (ev === 'EventSueno1' || ev === 'EventSueno2A') { const b = en[c.rnd(en.length)]; c.P('      ➜ ' + b.button.getLabel().translate()); d.onButton(b.num); return true; }
    if (ev === 'EventGasparPersigue' || ev === 'EventGasparSuite') {
      const g = c.monstruo(/Gaspar/); const m = g?.[0];
      if (m) { if (ev === 'EventGasparPersigue' && e.claraWith) c.moveMonster(m, 2, e.claraWith); if (ev === 'EventGasparSuite') c.moveMonster(m, 2, 'TileSuiteInes:s2'); }
      const at = m ? c.mpos.get(m) : '';
      if (ev === 'EventGasparPersigue') { const ok = !!e.claraWith && at === e.claraWith.pos; if (ok) c.actor = e.claraWith; c.P(`      ➜ ${ok ? 'alcanza a quien lleva a Clara' : 'no llega a Clara'}`); d.onButton(en[ok ? 1 : 0].num); return true; }
      const llega = at === 'TileSuiteInes:s2' || at === 'TilePasillo:s2'; let entra = false;
      if (llega) { let ex = 0; for (let k = 0; k < 2; k++) if (c.rnd(8) < 3) ex++; entra = ex >= 2; c.P(`      🎲 Gaspar tira contra la Obstrucción: ${ex} éxitos`); }
      c.P(`      ➜ ${entra ? 'Entra' : 'No entra'}`); d.onButton(en[entra ? 1 : 0].num); return true;
    }
    return false;
  },
  turnoEspecial(i, c) {
    if (c.estado.dreamer !== i) return false;
    if (c.onBoard('TokenNiebla')) { c.P(`   🌊 ${i.n} (Náufrago) pulsa la niebla`); c.pulsarFicha('TokenNiebla'); }
    else c.P(`   🌊 ${i.n} (Náufrago) sigue en la niebla`);
    return true;
  },
  accionEspecial(i, c) {
    if (c.STRAT === 'C' && c.noche() === 3 && c.V('tieneCuaderno') === 1 && c.V('cuadernoQuemado') === 0) {
      c.P(`   🔥 ${i.n} [acción] saca el cuaderno de Gaspar y le prende fuego`); i.acc--; c.lanzarEvento('EventMirarCuaderno'); return true;
    }
    return false;
  },
  puedeAtacar(m, i, c) { return !(m === 'CustomMonsterGasparEntero' && c.estado.claraWith !== i); },
  fichaDisponible(t, c) {
    if (t !== 'TokenCampana') return true;
    return c.V('campanaRota') !== 1 && (c.V('campanaTiembla') === 1 || !c.estado.campanaVista?.[c.noche()]);
  },
  accionesExtra(i, c) { return c.V('rosaAliada') === 1 && i === c.INV[0] ? 1 : 0; },
  alEmpezarNoche(c) { const e = c.estado; e.vigil = null; e.claraWith = null; e.claraConInes = false; e.dreamer = null; },
  tirada(ev, quien, sk, c) {
    const a = c.porApodo(1); if (!a || a !== quien || !/^EventGasparTiradaM[123]$/.test(ev)) return null;
    if (ev === 'EventGasparTiradaM3') { c.P(`      ⚓ ${a.n} es el Ancla: no suelta (1 éxito sin tirar)`); return 1; }
    const ex = Math.max(0, c.roll(quien, sk) + (ev === 'EventGasparTiradaM2' ? 1 : -1)); c.P(`      ⚓ Ancla: ${ex}`); return ex;
  },
  rompecabezas(w, i, c) {
    const sol = w.questPuzzle.puzzleSolution.split(' ').map(Number);
    return c.V('sabeReves') === 1 && c.V('conoceCancion') === 1 ? [sol] : [[4, 2, 2, 1], sol];
  },
};
export default perfil;
