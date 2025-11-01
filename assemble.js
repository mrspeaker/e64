const ops = {
    lda: {
        abs: 0xa5,
        imm: 0xa9,
    },
    sta: {
        abs: 0x85,
    },
    adc: {
        imm: 0x69,
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
    const asm = lines.reduce((bytes, line) => {
        const [mnemonic, operand] = line.split(" ");
        const op = parse_op(operand);
        console.log(op);
        const opcode = get_by_mnem_and_mode(mnemonic, op.mode);
        bytes.push(opcode, op.value);
        return bytes;
    }, []);
    console.log(asm);
    return asm;
};
