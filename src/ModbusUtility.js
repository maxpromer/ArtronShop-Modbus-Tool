
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
            encode: a => ([ (a >> 8 & 0xFF), a & 0xFF ]),
            decode: a => (a[0] << 8) | a[1]
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
