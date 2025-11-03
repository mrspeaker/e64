import { hex } from "./utils.js";

const ops = {
    lda: {
        abs: 0xa5,
        imm: 0xa9,
    },
    ldy: {
        imm: 0xa0,
    },
    ldx: {
        imm: 0xa2,
    },
    sta: {
        abs: 0x85,
    },
    adc: {
        imm: 0x69,
    },
    jmp: {
        abs: 0x4c,
    },
    bne: {
        rel: 0xd0,
    },
    beq: {
        rel: 0xf0,
    },
};

const get_by_mnem_and_mode = (mnemonic, mode) => {
    const m = ops[mnemonic];
    if (!m) {
        throw new Error("missing mnemonic:" + mnemonic);
    }
    const v = m[mode];
    if (!v) {
        throw new Error("missing mode for " + mnemonic + ": " + mode);
    }
    return v;
};

const mnem_has_mode = (mnemonic, mode) => !!ops[mnemonic]?.[mode];

const parse_op = (op) => {
    let mode = "abs";
    let base = 10;
    let value = 0;
    if (op[0] === "#") {
        mode = "imm";
        op = op.slice(1);
    }
    if (op[0] === "$") {
        base = 16;
        op = op.slice(1);
    }
    return {
        mode,
        value: parseInt(op, base),
    };
};

export const assemble = (prg) => {
    const lines = prg.split("\n").filter((l) => l.trim());
    const symbols = {};
    const asm_with_symbols = lines.reduce((bytes, line) => {
        const pc = bytes.length;
        if (line.match(/^[a-zA-Z][a-zA-Z0-9_]*:/)) {
            // label
            symbols[line.trim().slice(0, -1)] = pc;
            return bytes;
        }
        const [mnemonic, operand] = line.trim().split(" ");

        // is operand is a symbol?
        if (operand[0].match(/^[a-zA-Z]/)) {
            const is_rel = mnem_has_mode(mnemonic, "rel");
            const opcode = get_by_mnem_and_mode(
                mnemonic,
                is_rel ? "rel" : "abs",
            );
            // operand for abs is 2 bytes
            bytes.push(opcode, { sym: operand, rel: is_rel, pc: pc + 1 }); // pc + 1? for the opcode?
            if (!is_rel) bytes.push(0); // high byte of addr
            return bytes;
        }

        // Non symbol
        const op = parse_op(operand);
        const opcode = get_by_mnem_and_mode(mnemonic, op.mode);
        bytes.push(opcode, op.value);
        return bytes;
    }, []);

    // Replace symbols
    const asm = asm_with_symbols.map((v, i) => {
        if (typeof v !== "number") {
            if (v.rel) {
                // TODO: guard too big jump
                const dist = symbols[v.sym] - v.pc + 0xff;
                return dist & 0xff;
            }
            // A lil' dodge...
            asm_with_symbols[i + 1] = symbols[v.sym] & 0xff00;
            return symbols[v.sym] & 0xff;
        }
        return v;
    });
    console.log(asm.map(hex), symbols);
    return asm;
};
