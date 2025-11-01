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
import { assemble } from "./assemble.js";

const cpu = mk_cpu();
const mem = malloc(1 << 16);
const put_mem = (vs, off = 0) => {
    vs.forEach((v, i) => (mem[i + off] = v));
};

const prg = `
 lda #15
 sta $20
loop
 lda $20
 adc #$1
 sta $20
 jmp loop
`;

put_mem(assemble(prg));

init_cpu(cpu);
put_data(cpu.pins, mem[get_addr(cpu.pins)]);

for (let i = 0; i < 10; i++) {
    tick(cpu);
    const addr = get_addr(cpu.pins);
    if (cpu.pins[pinout.RW]) {
        put_data(cpu.pins, mem[addr]);
    } else {
        const data = get_data(cpu.pins);
        mem[addr] = data;
    }
}

console.log(
    "A:",
    hex(cpu.regs.a),
    "X:",
    hex(cpu.regs.x),
    "Y:",
    hex(cpu.regs.y),
);
