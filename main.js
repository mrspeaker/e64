import { malloc } from "./utils.js";
import { mk_cpu, step, tick, get_addr, get_data } from "./cpu.js";

const cpu = mk_cpu();
const mem = malloc(1 << 16);

mem[0] = 0xa9;
mem[1] = 0x01;

console.log(cpu.regs.pc, mem);
const pins = tick(cpu);
const addr = get_addr(pins);
mem[addr] = get_data(pins);
console.log("oh hai", addr, mem[addr]);
