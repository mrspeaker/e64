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

const $ = (sel) => document.querySelector(sel);
const $click = (sel, f) => $(sel).addEventListener("click", f);

const cpu = mk_cpu();
const mem = malloc(1 << 16);
const put_mem = (vs, off = 0) => {
    vs.forEach((v, i) => (mem[i + off] = v));
};

$click("#btnAssemble", () => {
    const p = $("#prg").innerHTML;
    const asm = assemble(p);
    $("#bytes").innerHTML = asm
        .map((v) => v.toString(16).padStart(2, "0"))
        .join(" ");

    run_prg(asm);

    $("#flags").innerHTML =
        "A:" +
        hex(cpu.regs.a) +
        " X:" +
        hex(cpu.regs.x) +
        " Y:" +
        hex(cpu.regs.y) +
        " N:" +
        Object.entries(cpu.flags);
});

function run_prg(asm) {
    put_mem(asm);
    init_cpu(cpu);
    put_data(cpu.pins, mem[get_addr(cpu.pins)]);

    for (let i = 0; i < 120; i++) {
        tick(cpu);
        const addr = get_addr(cpu.pins);
        if (cpu.pins[pinout.RW]) {
            put_data(cpu.pins, mem[addr]);
        } else {
            const data = get_data(cpu.pins);
            mem[addr] = data;
        }
    }
}
