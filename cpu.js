const malloc = (bytes) => new Array(bytes).fill(0);
const balloc = (bytes) => new Array(bytes).fill(false);

const mk_regs = () => ({
    a: 0,
    x: 0,
    y: 0,
    sp: 0,
    pc: 0,
    ir: 0, // internal instruction register
});

const pinout = {
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
    SYNC: 25,
};
const mk_pins = () => {
    // TODO: just use a number... everyone would be happier
    const pins = malloc(40);
    pins[pinout.SYNC] = true;
    return pins;
};

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

export const mk_e64 = () => {
    return {
        mem: malloc(1 << 16),
        regs: mk_regs(),
        flags: mk_flags(),
        pins: mk_pins(),
    };
};

// Exec one instruction
export const step = (compy) => {
    compy.regs.pc++;
    return compy;
};

const get_data_bus = (pins) => {
    // return what's on the data bus.
    return 0xa9;
};
const put_data_bus = (pins, value) => {
    // write value to bus.
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

const get_address_bus = (pins) => {
    const addr = get_addr(pins);
    console.log("get addr", addr);
    return addr;
};

const put_address_bus = (pins, value) => {
    pins[pinout.A0] = value & (1 < 0);
    pins[pinout.A1] = value & (1 < 1);
    pins[pinout.A2] = value & (1 < 2);
    pins[pinout.A3] = value & (1 < 3);
    pins[pinout.A4] = value & (1 < 4);
    pins[pinout.A5] = value & (1 < 5);
    pins[pinout.A6] = value & (1 < 6);
    pins[pinout.A7] = value & (1 < 7);
    pins[pinout.A8] = value & (1 < 8);
    pins[pinout.A9] = value & (1 < 9);
    pins[pinout.A10] = value & (1 < 10);
    pins[pinout.A11] = value & (1 < 11);
    pins[pinout.A12] = value & (1 < 12);
    pins[pinout.A13] = value & (1 < 13);
    pins[pinout.A14] = value & (1 < 14);
    pins[pinout.A15] = value & (1 < 15);
    console.log("put addr", value);
    return value;
};

const fetch = (cpu) => {
    put_data_bus(cpu.pins, cpu.regs.pc);
    cpu.pins[pinout.SYNC] = false;
};

// Tick one clock cycle
// https://floooh.github.io/2019/12/13/cycle-stepped-6502.html
export const tick = (cpu) => {
    const { pins, regs } = cpu;
    if (pins[pinout.SYNC]) {
        regs.ir = get_data_bus(pins) << 3;
        pins[pinout.SYNC] = false;
    }
    switch (regs.ir++) {
        case (0xa9 << 3) | 0:
            put_address_bus(pins, regs.pc++);
            console.log("tick 1 0xa9", regs.pc);
            break;
        case (0xa9 << 3) | 1:
            console.log("tick 2 0xa9");
            fetch(cpu);
            break;
    }

    return pins;
};
