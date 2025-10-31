import { malloc } from "./utils.js";
import {
    mk_cpu,
    init_cpu,
    step,
    tick,
    get_addr,
    get_data,
    put_data,
    pinout,
} from "./cpu.js";

const cpu = mk_cpu();
const mem = malloc(1 << 16);

mem[0] = 0xa9;
mem[1] = 0x03;
mem[2] = 0xa2;
mem[3] = 0x05;

let pins = init_cpu(cpu);
put_data(pins, mem[get_addr(pins)]);

for (let i = 0; i < 4; i++) {
    pins = tick(cpu);
    put_data(pins, mem[get_addr(pins)]);
    console.log("PC:", cpu.regs.pc);
    const addr = get_addr(pins);
    if (pins[pinout.RW]) {
        console.log("PUTING ON DDT", addr, mem[addr]);
        put_data(pins, mem[addr]);
    } else {
        mem[addr] = get_data(pins);
    }
}

console.log("A:", cpu.regs.a, "X:", cpu.regs.x);
