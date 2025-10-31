import { malloc, hex } from "./utils.js";
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

mem[0] = 0xea;
mem[1] = 0xa9;
mem[2] = 0x03;
mem[3] = 0xea;
mem[4] = 0xa2;
mem[5] = 0x05;
mem[6] = 0x69;
mem[7] = 0x01;

init_cpu(cpu);
put_data(cpu.pins, mem[get_addr(cpu.pins)]);

for (let i = 0; i < 12; i++) {
    tick(cpu);
    const addr = get_addr(cpu.pins);
    if (cpu.pins[pinout.RW]) {
        put_data(cpu.pins, mem[addr]);
    } else {
        print("write....");
        mem[addr] = get_data(cpu.pins);
    }
}

console.log("A:", cpu.regs.a, "X:", cpu.regs.x, "Y:", cpu.regs.y);
