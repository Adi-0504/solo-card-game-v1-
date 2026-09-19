export const SUITS = ['cross', 'triangle', 'square', 'diamond'];
export const CONFIG = { HAND_SIZE: 13, MIN_GROUP: 4, WIN_GROUPS: 3, MAX_TABLE: 52 };
const next = (n) => ((n - 1 + 1) % 13) + 1;
export function isConsecutive(a, b) { return b === next(a); }
export function makeDeck() { const out = []; for (let n = 1; n <= 13; n++)
    for (const s of SUITS)
        out.push({ id: `${n}-${s}`, number: n, suit: s }); return out; }
export function cloneCard(c) { return { ...c }; }
export class RNG {
    state;
    constructor(seed) { this.state = (seed >>> 0) || 0x9e3779b9; }
    next() { let x = this.state; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.state = x >>> 0; return this.state / 4294967296; }
    int(max) { return Math.floor(this.next() * max); }
}
function shuffle(a, rng) { const x = [...a]; for (let i = x.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [x[i], x[j]] = [x[j], x[i]];
} return x; }
function draw(deck, rng) { if (!deck.length)
    return null; return deck.shift() ?? null; }
export function createState(seed = Math.floor(Math.random() * 0xffffffff)) { const rng = new RNG(seed); const deck = shuffle(makeDeck(), rng); const hand = deck.splice(0, CONFIG.HAND_SIZE); return { version: 1, seed, rng: rng.state, deck, hand, table: [], completed: [], turn: 0, paused: false, ended: false }; }
function sameSymbolRun(row, start, end) { if (end - start + 1 < CONFIG.MIN_GROUP)
    return false; const suit = row[start].suit; for (let i = start; i <= end; i++)
    if (row[i].suit !== suit)
        return false; return true; }
function maximalNumberRun(row, from) { let end = from; while (end + 1 < row.length && isConsecutive(row[end].number, row[end + 1].number))
    end++; return end; }
export function detectCompletion(row) {
    if (row.length < CONFIG.MIN_GROUP)
        return null;
    // One placement resolves at most one maximal contiguous number run. A fully same-suit run counts twice.
    for (let start = 0; start < row.length; start++) {
        if (start > 0 && isConsecutive(row[start - 1].number, row[start].number))
            continue;
        const end = maximalNumberRun(row, start);
        const len = end - start + 1;
        if (len >= CONFIG.MIN_GROUP) {
            const two = sameSymbolRun(row, start, end);
            return { start, end, groups: two ? 2 : 1, cards: row.slice(start, end + 1).map(cloneCard) };
        }
    }
    return null;
}
export function apply(state, action) {
    if (action.type === 'new')
        return createState();
    if (action.type === 'pause')
        return { ...state, paused: true };
    if (action.type === 'resume')
        return { ...state, paused: false };
    if (state.paused || state.ended)
        return state;
    if (action.type === 'play') {
        const hi = state.hand.findIndex(c => c.id === action.cardId);
        if (hi < 0 || action.index < 0 || action.index > state.table.length)
            return state;
        const hand = [...state.hand];
        const card = hand.splice(hi, 1)[0];
        const table = [...state.table];
        table.splice(action.index, 0, card);
        const rng = new RNG(state.rng);
        const nextCard = draw([...state.deck], rng);
        let deck = [...state.deck];
        if (nextCard)
            hand.push(nextCard);
        let completed = [...state.completed];
        let resolved = detectCompletion(table);
        let newTable = table;
        let groups = 0;
        if (resolved) {
            groups = resolved.groups;
            completed.push(resolved.cards);
            newTable = table.slice(0, resolved.start).concat(table.slice(resolved.end + 1));
        }
        const ended = completed.reduce((n, g) => n + (g.length >= CONFIG.MIN_GROUP ? 1 : 0), 0) >= CONFIG.WIN_GROUPS;
        return { version: 1, seed: state.seed, rng: rng.state, deck, hand, table: newTable, completed, turn: state.turn + 1, paused: false, ended };
    }
    return state;
}
export function serialize(state) { return JSON.stringify(state); }
export function validateState(v) { if (!v || typeof v !== 'object')
    return false; const s = v; return s.version === 1 && Array.isArray(s.hand) && Array.isArray(s.deck) && Array.isArray(s.table) && Array.isArray(s.completed) && s.hand.length <= 13 && s.table.length <= CONFIG.MAX_TABLE && Number.isInteger(s.rng) && Number.isInteger(s.turn) && typeof s.paused === 'boolean' && typeof s.ended === 'boolean'; }
export function deserialize(raw) { try {
    const v = JSON.parse(raw);
    return validateState(v) ? v : null;
}
catch {
    return null;
} }
