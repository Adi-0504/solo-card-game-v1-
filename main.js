import { createState, apply, CONFIG } from './game.js';
import { load, save, clear } from './storage.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
const canvas = document.querySelector('#game');
const renderer = new Renderer(canvas);
renderer.frame();
let state = createState();
let busy = false;
const progress = document.querySelector('#progress');
const pause = document.querySelector('#pause');
const hint = document.querySelector('#hint');
const pausePanel = document.querySelector('#pausePanel');
const endPanel = document.querySelector('#endPanel');
const error = document.querySelector('#error');
function groups() { return state.completed.reduce((n, g) => n + (g.length >= 4 ? 1 : 0), 0); }
function ui() { progress.textContent = `完成 ${groups()} / ${CONFIG.WIN_GROUPS}`; pause.hidden = state.ended; pausePanel.toggleAttribute('hidden', !state.paused); endPanel.toggleAttribute('hidden', !state.ended); hint.textContent = state.paused || state.ended ? '' : '拖曳一張牌到桌面列，放到左端、右端或兩張牌之間'; renderer.render(state); }
async function commit(next) { state = next; try {
    await save(state);
}
catch {
    error.textContent = '保存失敗：目前局面仍在記憶體中，但瀏覽器可能無法持久保存。';
    error.hidden = false;
} ui(); }
function tableIndex(clientX) { if (!state.table.length)
    return 0; const ratio = Math.max(0, Math.min(1, clientX / innerWidth)); return Math.max(0, Math.min(state.table.length, Math.round(ratio * state.table.length))); }
new Input(renderer, (id, x) => { if (busy || state.paused || state.ended)
    return; busy = true; const next = apply(state, { type: 'play', cardId: id, index: tableIndex(x) }); if (next !== state)
    commit(next).finally(() => busy = false);
else
    busy = false; });
pause.onclick = () => { if (!state.ended) {
    state = apply(state, { type: 'pause' });
    save(state).catch(() => { });
    ui();
} };
document.querySelector('#resume').addEventListener('click', () => { state = apply(state, { type: 'resume' }); save(state).catch(() => { }); ui(); });
async function newGame() { await clear(); state = createState(); await save(state).catch(() => { }); ui(); }
document.querySelector('#newGame').addEventListener('click', newGame);
document.querySelector('#playAgain').addEventListener('click', newGame);
window.addEventListener('pagehide', () => { void save(state); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden')
    void save(state); });
(async () => { const saved = await load(); if (saved)
    state = saved; ui(); if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('./sw.js').catch(() => { }); })();
