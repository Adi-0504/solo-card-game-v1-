import { gsap } from 'https://esm.sh/gsap@3.15.0';
export function moveTo(obj, x, y, z, d = .35) { return gsap.to(obj.position, { x, y, z, duration: d, ease: 'power2.out' }); }
export function lift(obj, lifted = true) { return gsap.to(obj.position, { z: lifted ? 0.32 : 0, duration: .18, ease: 'power2.out' }); }
export function pulse(obj) { return gsap.fromTo(obj.scale, { x: 1, y: 1, z: 1 }, { x: 1.04, y: 1.04, z: 1.04, duration: .16, yoyo: true, repeat: 1, ease: 'power2.inOut' }); }
