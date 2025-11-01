import { malloc, balloc, hex } from "./utils.js";

export const mk_cpu = () => ({
    regs: mk_regs(),
    flags: mk_flags(),
    pins: mk_pins(),
});

const mk_regs = () => ({
    a: 0,
    x: 0,
    y: 0,
    sp: 0,
    pc: 0,
    ir: 0, // internal instruction register
    ad: 0, // 16-bit address pointer
});

export const pinout = {
    A0: 0,
    A1: 1,
    A2: 2,
    A3: 3,
    A4: 4,
    A5: 5,
    A6: 6,
    A7: 7,
    A8: 8,
    A9: 9,
    A10: 10,
    A11: 11,
    A12: 12,
    A13: 13,
    A14: 14,
    A15: 15,

    D0: 16,
    D1: 17,
    D2: 18,
    D3: 19,
    D4: 20,
    D5: 21,
    D6: 22,
    D7: 23,

    RW: 24,
    SYNC: 25,
};
// TODO: just use a number... everyone would be happier
const mk_pins = () => malloc(40);

const mk_flags = () => ({
    carry: false,
    zero: false,
    irq: false,
    decimal: false,
    brk: false,
    unused: false,
    overflow: false,
    negative: false,
});

// Exec one instruction
export const step = (compy) => {
    compy.regs.pc++;
    return compy;
};

export const get_data = (pins) => {
    // return what's on the data bus.
    return (
        (pins[pinout.D0] << 0) +
        (pins[pinout.D1] << 1) +
        (pins[pinout.D2] << 2) +
        (pins[pinout.D3] << 3) +
        (pins[pinout.D4] << 4) +
        (pins[pinout.D5] << 5) +
        (pins[pinout.D6] << 6) +
        (pins[pinout.D7] << 7)
    );
};
export const put_data = (pins, value) => {
    pins[pinout.D0] = !!(value & (1 << 0));
    pins[pinout.D1] = !!(value & (1 << 1));
    pins[pinout.D2] = !!(value & (1 << 2));
    pins[pinout.D3] = !!(value & (1 << 3));
    pins[pinout.D4] = !!(value & (1 << 4));
    pins[pinout.D5] = !!(value & (1 << 5));
    pins[pinout.D6] = !!(value & (1 << 6));
    pins[pinout.D7] = !!(value & (1 << 7));
};

export const get_addr = (pins) =>
    pins[pinout.A0] +
    (pins[pinout.A1] << 1) +
    (pins[pinout.A2] << 2) +
    (pins[pinout.A3] << 3) +
    (pins[pinout.A4] << 4) +
    (pins[pinout.A5] << 5) +
    (pins[pinout.A6] << 6) +
    (pins[pinout.A7] << 7) +
    (pins[pinout.A8] << 8) +
    (pins[pinout.A9] << 9) +
    (pins[pinout.A10] << 10) +
    (pins[pinout.A11] << 11) +
    (pins[pinout.A12] << 12) +
    (pins[pinout.A13] << 13) +
    (pins[pinout.A14] << 14) +
    (pins[pinout.A15] << 15);

const put_addr = (pins, value) => {
    pins[pinout.A0] = !!(value & (1 << 0));
    pins[pinout.A1] = !!(value & (1 << 1));
    pins[pinout.A2] = !!(value & (1 << 2));
    pins[pinout.A3] = !!(value & (1 << 3));
    pins[pinout.A4] = !!(value & (1 << 4));
    pins[pinout.A5] = !!(value & (1 << 5));
    pins[pinout.A6] = !!(value & (1 << 6));
    pins[pinout.A7] = !!(value & (1 << 7));
    pins[pinout.A8] = !!(value & (1 << 8));
    pins[pinout.A9] = !!(value & (1 << 9));
    pins[pinout.A10] = !!(value & (1 << 10));
    pins[pinout.A11] = !!(value & (1 << 11));
    pins[pinout.A12] = !!(value & (1 << 12));
    pins[pinout.A13] = !!(value & (1 << 13));
    pins[pinout.A14] = !!(value & (1 << 14));
    pins[pinout.A15] = !!(value & (1 << 15));
    return pins;
};

const fetch = (cpu) => {
    put_addr(cpu.pins, cpu.regs.pc);
    cpu.pins[pinout.SYNC] = true;
};

export const init_cpu = (cpu) => {
    fetch(cpu);
    cpu.pins[pinout.RW] = true;
    cpu.pins[pinout.SYNC] = true;
    return cpu.pins;
};

// Tick one clock cycle
// https://floooh.github.io/2019/12/13/cycle-stepped-6502.html
export const tick = (cpu) => {
    const { pins, regs } = cpu;
    console.log("tick PC:", regs.pc, " t:", regs.ir & 3);
    if (pins[pinout.SYNC]) {
        regs.ir = get_data(pins) << 3;
        console.log("IR: ", hex(regs.ir >> 3));
        pins[pinout.SYNC] = false;
        regs.pc++;
    }

    pins[pinout.RW] = true;

    switch (regs.ir++) {
        // JMP
        case (0x4c << 3) | 0:
            put_addr(pins, regs.pc++);
            break;
        case (0x4c << 3) | 1:
            put_addr(pins, regs.pc++);
            regs.ad = get_data(pins);
            break;
        case (0x4c << 3) | 2:
            regs.pc = (get_data(pins) << 8) | regs.ad;
            fetch(cpu);
            break;

        // ADC # (no carry!)
        case (0x69 << 3) | 0:
            put_addr(pins, regs.pc++);
            break;
        case (0x69 << 3) | 1:
            regs.a = (regs.a + get_data(pins)) & 0xff;
            fetch(cpu);
            break;

        // STA (zp)
        case (0x85 << 3) | 0:
            put_addr(pins, regs.pc++);
            break;
        case (0x85 << 3) | 1:
            put_addr(pins, get_data(pins));
            put_data(pins, regs.a);
            pins[pinout.RW] = false;
            break;
        case (0x85 << 3) | 2:
            fetch(cpu);
            break;

        // LDX #
        case (0xa2 << 3) | 0:
            put_addr(pins, regs.pc++);
            break;
        case (0xa2 << 3) | 1:
            regs.x = get_data(pins);
            fetch(cpu);
            break;

        // LDA zp (3 cycles)
        case (0xa5 << 3) | 0:
            put_addr(pins, regs.pc++);
            break;
        case (0xa5 << 3) | 1:
            //_SA(_GD());
            put_addr(pins, get_data(pins));
            break;
        case (0xa5 << 3) | 2:
            //c->A=_GD();_NZ(c->A);
            regs.a = get_data(pins);
            fetch(cpu);
            break;

        // LDA #
        case (0xa9 << 3) | 0:
            put_addr(pins, regs.pc++);
            break;
        case (0xa9 << 3) | 1:
            regs.a = get_data(pins);
            fetch(cpu);
            break;

        // NOP
        case (0xea << 3) | 0:
            put_addr(pins, regs.pc);
            break;
        case (0xea << 3) | 1:
            fetch(cpu);
            break;

        default:
            put_addr(pins, regs.pc++);
            fetch(cpu);
            break;
    }
    return pins;
};
