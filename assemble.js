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
    jmp: {
        abs: 0x4c,
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
    const symbols = {};
    const asm_with_symbols = lines.reduce((bytes, line) => {
        if (line[0] !== " ") {
            // label
            const pc = bytes.length;
            symbols[line.trim()] = pc;
            return bytes;
        }
        const [mnemonic, operand] = line.trim().split(" ");
        if (operand[0].match(/^[a-zA-Z]/)) {
            // operand is a symbol
            const opcode = get_by_mnem_and_mode(mnemonic, "abs");
            // TODO: oh nope... operand is 2 bytes.. need to replace properly
            // (Currently only works with addr < 256)
            bytes.push(opcode, operand, 0);
            return bytes;
        }
        const op = parse_op(operand);
        const opcode = get_by_mnem_and_mode(mnemonic, op.mode);
        bytes.push(opcode, op.value);
        return bytes;
    }, []);

    // Replace symbols
    const asm = asm_with_symbols.map((v) => {
        if (typeof v === "string") {
            return symbols[v];
        }
        return v;
    });
    console.log(asm, symbols);
    return asm;
};
