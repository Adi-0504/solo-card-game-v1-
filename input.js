export class Input {
    renderer;
    onDrop;
    downId = null;
    startX = 0;
    startY = 0;
    constructor(renderer, onDrop) {
        this.renderer = renderer;
        this.onDrop = onDrop;
        const c = renderer.renderer.domElement;
        c.addEventListener('pointerdown', (e) => this.down(e));
        c.addEventListener('pointermove', (e) => this.move(e));
        c.addEventListener('pointerup', (e) => this.up(e));
        c.addEventListener('pointercancel', () => this.cancel());
    }
    down(e) { const id = this.renderer.pick(e.clientX, e.clientY); if (!id)
        return; this.downId = id; this.startX = e.clientX; this.startY = e.clientY; this.renderer.liftCard(id, true); }
    move(e) { if (!this.downId)
        return; }
    up(e) { if (!this.downId)
        return; const id = this.downId; this.downId = null; this.renderer.liftCard(id, false); const moved = Math.hypot(e.clientX - this.startX, e.clientY - this.startY) > 12; this.onDrop(id, e.clientX, e.clientY); void moved; }
    cancel() { if (this.downId)
        this.renderer.liftCard(this.downId, false); this.downId = null; }
}
