import { mk_e64, step, tick, get_addr } from "./cpu.js";

const comp = mk_e64();

comp.mem[0] = 0xa9;
comp.mem[1] = 0x01;
console.log(comp.regs.pc, comp.mem);
const pins = tick(comp);
console.log("pins", pins, "addr:", get_addr(pins));
const pins2 = tick(comp);
console.log("pins", pins2, "addr:", get_addr(pins2));
const pins3 = tick(comp);
console.log("pins", pins3, "addr:", get_addr(pins3));
const pins4 = tick(comp);
console.log("pins", pins4, "addr:", get_addr(pins4));
