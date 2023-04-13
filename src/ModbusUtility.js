
export const FunctionType = {
    Coils:          { read: 0x01, write_single: 0x05 },
    DiscreteInputs: { read: 0x02 },
    Holding:        { read: 0x03, write_single: 0x06 },
    Input:          { read: 0x04 }
};

export const DataType = {
    int16: {
        size: 2, // in bytes
        process: {
            encode: a => {
                if (a < 0) { // if nagative number
                    a = Math.abs(a);
                    a = (a ^ 0xFFFF) + 1; // Two's complement
                }
                return ([ (a >> 8) & 0xFF, a & 0xFF ]);
            },
            decode: a => {
                let n = (a[0] << 8) | a[1];
                if (n & 0x8000) {
                    n = (n ^ 0xFFFF) + 1; // Two's complement
                    n = -n;
                }
                return n;
            }
        }
    },
    uint16: {
        size: 2, // in bytes
        process: {
            encode: a => ([ (a >> 8 & 0xFF), a & 0xFF ]),
            decode: a => (a[0] << 8) | a[1]
        }
    },
    uint32: {
        size: 4, // in bytes
        process: {
            encode: a => ([ (a >> 8 & 0xFF), a & 0xFF, (a >> 24 & 0xFF), (a >> 16) & 0xFF ]),
            decode: a => ((a[2] << 24) | (a[3] << 16) | (a[0] << 8) | a[1])
        }
    },
}
