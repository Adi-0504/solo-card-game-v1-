import * as THREE from 'https://esm.sh/three@0.186.0';
import { moveTo, lift, pulse } from './animation.js';
const suitSymbol = { cross: '✚', triangle: '△', square: '□', diamond: '◇' };
export class Renderer {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    renderer;
    ray = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    root = new THREE.Group();
    tableGroup = new THREE.Group();
    handGroup = new THREE.Group();
    hit = new Map();
    cardMeshes = new Map();
    constructor(canvas) { this.scene.background = new THREE.Color(0x17120e); this.camera.position.set(0, -10, 10); this.camera.lookAt(0, 0, 0); this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); this.renderer.shadowMap.enabled = true; this.scene.add(this.root); this.root.add(this.tableGroup, this.handGroup); this.setupLights(); this.setupTable(); this.resize(); addEventListener('resize', () => this.resize()); this.renderer.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); }
    setupLights() { const hemi = new THREE.HemisphereLight(0xfff4df, 0x24180f, 2.1); this.scene.add(hemi); const key = new THREE.DirectionalLight(0xffead0, 3); key.position.set(3, -4, 10); key.castShadow = true; this.scene.add(key); }
    setupTable() { const geo = new THREE.BoxGeometry(22, 14, .3); const mat = new THREE.MeshStandardMaterial({ color: 0x3b2b20, roughness: .72, metalness: .05 }); const t = new THREE.Mesh(geo, mat); t.position.z = -.22; t.receiveShadow = true; this.root.add(t); }
    resize() { const w = innerWidth, h = innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); }
    makeCard(c) { const geo = new THREE.BoxGeometry(1.05, 1.48, .12); const mat = new THREE.MeshStandardMaterial({ color: 0xf2e7d1, roughness: .55, metalness: .02 }); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.cardId = c.id; const tex = this.cardTexture(c); const face = new THREE.Mesh(new THREE.PlaneGeometry(.94, 1.37), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); face.position.z = .066; m.add(face); this.cardMeshes.set(c.id, m); this.hit.set(c.id, m); return m; }
    cardTexture(c) { const cn = document.createElement('canvas'); cn.width = 300; cn.height = 420; const x = cn.getContext('2d'); x.fillStyle = '#f2e7d1'; x.fillRect(0, 0, 300, 420); x.strokeStyle = '#8d765d'; x.lineWidth = 5; x.strokeRect(8, 8, 284, 404); x.fillStyle = '#231a14'; x.textAlign = 'center'; x.font = 'bold 110px system-ui'; x.fillText(String(c.number), 150, 160); x.font = '90px serif'; x.fillText(suitSymbol[c.suit], 150, 285); x.font = '24px system-ui'; x.fillText(c.suit, 150, 365); return new THREE.CanvasTexture(cn); }
    render(state) { this.clearGroup(this.tableGroup); this.clearGroup(this.handGroup); this.hit.clear(); this.cardMeshes.clear(); const tableStart = -(state.table.length - 1) * .57; state.table.forEach((c, i) => { const m = this.makeCard(c); m.position.set(tableStart + i * 1.14, 1.05, 0); m.rotation.x = -.05; this.tableGroup.add(m); }); const handStart = -(state.hand.length - 1) * .53; state.hand.forEach((c, i) => { const m = this.makeCard(c); m.position.set(handStart + i * 1.06, -2.45, .08); m.rotation.x = -.03; this.handGroup.add(m); }); }
    clearGroup(g) { while (g.children.length) {
        const o = g.children.pop();
        o.traverse((v) => { if (v instanceof THREE.Mesh) {
            v.geometry.dispose();
            const material = v.material;
            if (Array.isArray(material))
                material.forEach(m => { m.map?.dispose(); m.dispose(); });
            else {
                material.map?.dispose();
                material.dispose();
            }
        } });
    } }
    setCardPosition(id, x, y, z, animate = true) { const o = this.cardMeshes.get(id); if (!o)
        return; animate ? moveTo(o, x, y, z) : o.position.set(x, y, z); }
    pick(x, y) { const r = this.renderer.domElement.getBoundingClientRect(); this.pointer.x = ((x - r.left) / r.width) * 2 - 1; this.pointer.y = -((y - r.top) / r.height) * 2 + 1; this.ray.setFromCamera(this.pointer, this.camera); const hits = this.ray.intersectObjects([...this.cardMeshes.values()], true); for (const h of hits) {
        let o = h.object;
        while (o.parent && !o.userData.cardId)
            o = o.parent;
        if (o.userData.cardId)
            return String(o.userData.cardId);
    } return null; }
    liftCard(id, on) { const o = this.cardMeshes.get(id); if (o)
        lift(o, on); }
    pulseCard(id) { const o = this.cardMeshes.get(id); if (o)
        pulse(o); }
    frame() { requestAnimationFrame(() => this.frame()); this.renderer.render(this.scene, this.camera); }
}
