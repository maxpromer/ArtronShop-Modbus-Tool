import { FunctionType, DataType } from "./ModbusUtility";

// SVG icon
import ATS_CO2_SVG from "./ATS_CO2_SVG";
import ATS_LUX_SVG from "./ATS_LUX_SVG";
import XY_MD02_SVG from "./XY_MD02_SVG";
import ATS_TH_SVG from "./ATS_TH_SVG";
import PRESS485_SVG from "./PRESS485_SVG";
import ATS_DECIBEL_SVG from "./ATS_DECIBEL_SVG";
import SOIL_RS485_SVG from "./SOIL_RS485_SVG";
import WIND_SPEED_SVG from "./WIND_SPEED_SVG";
import WIND_DIRCTION_SVG from "./WIND_DIRCTION_SVG";
import WATER_LEVEL_SVG from "./WATER_LEVEL_SVG";

// MUI icon
import Co2Icon from '@mui/icons-material/Co2';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import LightModeIcon from '@mui/icons-material/LightMode';
import WaterIcon from '@mui/icons-material/Water';
import SpeedIcon from '@mui/icons-material/Speed';
import GasMeterIcon from '@mui/icons-material/GasMeter';
import AirIcon from '@mui/icons-material/Air';
import PropaneTankIcon from '@mui/icons-material/PropaneTank';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

const TYPE_TEMP = {
    icon: ThermostatIcon,
    label: "อุณหภูมิ",
    unit: "°C"
};

const TYPE_HUMI = {
    icon: OpacityIcon,
    label: "ความชื้น",
    unit: "%RH"
};

const CONFIGS_ATS_SERIES = [
    {
        label: "หมายเลขอุปกรณ์ (Modbus ID)",
        type: "number",
        min: 1,
        max: 127,
        register: {
            function: FunctionType.Holding,
            address: 0x0101,
            type: DataType.uint16
        }
    },
    {
        label: "ความเร็วการสื่อสาร (Baud rate)",
        type: "option",
        option: [ 9600, 14400, 19200 ],
        register: {
            function: FunctionType.Holding,
            address: 0x0102,
            type: DataType.uint16
        }
    }
]

export default ([
    {
        name: "ATS-LUX",
        description: "อ่านค่าเซ็นเซอร์แสงความแม่นยำสูง",
        image: ATS_LUX_SVG,
        sensor: [
            {
                icon: LightModeIcon,
                label: "แสงสว่าง",
                unit: "lx",
                color: "#2ECC71",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.uint32
                }
            },
        ],
        configs: CONFIGS_ATS_SERIES.concat([
            {
                label: "ปรับแต่งค่าแสง (lx)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0103,
                    type: DataType.int16
                }
            },
        ])
    },
    {
        name: "ATS-CO2",
        description: "อ่านค่าเซ็นเซอร์วัด CO2 คุณภาพสูง",
        image: ATS_CO2_SVG,
        sensor: [
            {
                ...TYPE_TEMP,
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
            {
                ...TYPE_HUMI,
                color: "#3498DB",
                register: {
                    function: FunctionType.Input,
                    address: 0x0002,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
            {
                icon: Co2Icon,
                label: "CO2",
                unit: "ppm",
                color: "#2ECC71",
                register: {
                    function: FunctionType.Input,
                    address: 0x0003,
                    type: DataType.uint16
                }
            },
        ],
        configs: CONFIGS_ATS_SERIES.concat([
            {
                label: "ปรับแต่งอุณหภูมิ (°C)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0103,
                    type: DataType.int16,
                    process: {
                        encode: a => Math.floor(a * 10),
                        decode: a => a / 10
                    }
                }
            },
            {
                label: "ปรับแต่งความชื้น (%RH)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0104,
                    type: DataType.int16,
                    process: {
                        encode: a => Math.floor(a * 10),
                        decode: a => a / 10
                    }
                }
            },
            {
                label: "ปรับแต่ง CO2 (ppm)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0105,
                    type: DataType.int16,
                }
            },
        ])
    },
    {
        key: "xy-md02",
        name: "XY-MD02",
        description: "อ่านค่าเซ็นเซอร์วัดอุณหภูมิและความชื้น",
        image: XY_MD02_SVG,
        sensor: [
            {
                ...TYPE_TEMP,
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
            {
                ...TYPE_HUMI,
                color: "#3498DB",
                register: {
                    function: FunctionType.Input,
                    address: 0x0002,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
        ],
        configs: [].concat(CONFIGS_ATS_SERIES[0]).concat([
            {
                label: "ความเร็วการสื่อสาร (Baud rate)",
                type: "option",
                option: { 
                    9600: 9600, 
                    14400: 14400,
                    19200: 19200,
                },
                register: {
                    function: FunctionType.Holding,
                    address: 0x0102,
                    type: DataType.uint16
                }
            },
            {
                label: "ปรับแต่งอุณหภูมิ (°C)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0103,
                    type: DataType.int16,
                    process: {
                        encode: a => Math.floor(a * 10),
                        decode: a => a / 10
                    }
                }
            },
            {
                label: "ปรับแต่งความชื้น (%RH)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0104,
                    type: DataType.int16,
                    process: {
                        encode: a => Math.floor(a * 10),
                        decode: a => a / 10
                    }
                }
            },
        ])
    },
    {
        key: "ats-th",
        name: "ATS-TH",
        description: "อ่านค่าเซ็นเซอร์วัดอุณหภูมิและความชื้นควาแม่นยำสูง",
        image: ATS_TH_SVG,
        sensor: [
            {
                ...TYPE_TEMP,
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
            {
                ...TYPE_HUMI,
                color: "#3498DB",
                register: {
                    function: FunctionType.Input,
                    address: 0x0002,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
        ],
        configs: CONFIGS_ATS_SERIES.concat([
            {
                label: "ปรับแต่งอุณหภูมิ (°C)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0103,
                    type: DataType.int16,
                    process: {
                        encode: a => Math.floor(a * 10),
                        decode: a => a / 10
                    }
                }
            },
            {
                label: "ปรับแต่งความชื้น (%RH)",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0104,
                    type: DataType.int16,
                    process: {
                        encode: a => Math.floor(a * 10),
                        decode: a => a / 10
                    }
                }
            },
        ])
    },
    ,
    {
        key: "ats-decibel",
        name: "ATS-DECIBEL",
        description: "อ่านค่าเซ็นเซอร์วัดความดังเสียง",
        image: ATS_DECIBEL_SVG,
        sensor: [
            {
                icon: GraphicEqIcon,
                label: "ความดัง",
                unit: "dB",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0000,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10
                    }
                }
            },
        ],
        configs: [
            {
                label: "หมายเลขอุปกรณ์ (Modbus ID)",
                type: "number",
                min: 1,
                max: 255,
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D0,
                    type: DataType.uint16
                }
            },
            {
                label: "ความเร็วการสื่อสาร (Baud rate)",
                type: "option",
                option: [ 2400, 4800, 9600 ],
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D1,
                    type: DataType.uint16
                }
            }
        ]
    },
    {
        key: "press485",
        name: "PRESS485",
        description: "อ่านค่าเซ็นเซอร์วัดความดัน",
        image: PRESS485_SVG,
        sensor: [
            {
                icon: ThermostatIcon,
                label: "ความดัน",
                unit: "",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.int16,
                    process: {
                        decode: a => a
                    }
                }
            }
        ],
        configs: CONFIGS_ATS_SERIES.concat([
            {
                label: "ปรับแต่งความดัน",
                type: "number",
                register: {
                    function: FunctionType.Holding,
                    address: 0x0103,
                    type: DataType.int16,
                    process: {
                        encode: a => a,
                        decode: a => a
                    }
                }
            }
        ])
    },
    {
        key: "soil-rs485",
        name: "Soil RS485",
        description: "อ่านค่าเซ็นเซอร์วัดความชื้นในดิน",
        image: SOIL_RS485_SVG,
        sensor: [
            {
                icon: WaterIcon,
                label: "ความชื้นในดิน",
                unit: "%",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0000,
                    type: DataType.uint16,
                    process: {
                        decode: a => a / 10.0
                    }
                }
            },
            {
                icon: ThermostatIcon,
                label: "อุณหภูมิ",
                unit: "°C",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.int16,
                    process: {
                        decode: a => a / 10.0
                    }
                }
            },
            {
                icon: SpeedIcon,
                label: "ความนำไฟฟ้า",
                unit: "us/cm",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0002,
                    type: DataType.uint16,
                    process: {
                        decode: a => a
                    }
                }
            },
            {
                icon: OpacityIcon,
                label: "PH",
                unit: "",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0003,
                    type: DataType.uint16,
                    process: {
                        decode: a => a / 10.0
                    }
                }
            },
            {
                icon: GasMeterIcon,
                label: "ไนโตรเจน (N)",
                unit: "mg/kg",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0004,
                    type: DataType.uint16,
                    process: {
                        decode: a => a
                    }
                }
            },
            {
                icon: GasMeterIcon,
                label: "ฟอสฟอรัส (P)",
                unit: "mg/kg",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0005,
                    type: DataType.uint16,
                    process: {
                        decode: a => a
                    }
                }
            },
            {
                icon: GasMeterIcon,
                label: "โพแทสเซียม (K)",
                unit: "mg/kg",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0006,
                    type: DataType.uint16,
                    process: {
                        decode: a => a
                    }
                }
            }
        ],
        configs: [
            {
                label: "หมายเลขอุปกรณ์ (Modbus ID)",
                type: "number",
                min: 1,
                max: 254,
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D0,
                    type: DataType.uint16
                }
            },
            {
                label: "ความเร็วการสื่อสาร (Baud rate)",
                type: "option",
                option: [ 2400, 4800, 9600 ],
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D1,
                    type: DataType.uint16
                }
            }
        ]
    },
    {
        key: "wind-speed",
        name: "Wind Speed",
        description: "อ่านค่าเซ็นเซอร์วัดความเร็วลม",
        image: WIND_SPEED_SVG,
        sensor: [
            {
                icon: AirIcon,
                label: "ความเร็วลม",
                unit: "m/s",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0000,
                    type: DataType.uint16,
                    process: {
                        decode: a => a / 10.0
                    }
                }
            },
        ],
        configs: [
            {
                label: "หมายเลขอุปกรณ์ (Modbus ID)",
                type: "number",
                min: 1,
                max: 254,
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D0,
                    type: DataType.uint16
                }
            },
            {
                label: "ความเร็วการสื่อสาร (Baud rate)",
                type: "option",
                option: [ 2400, 4800, 9600, 19200, 38400, 57600, 115200, 1200 ],
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D1,
                    type: DataType.uint16
                }
            }
        ]
    },
    {
        key: "wind-direction",
        name: "Wind Direction",
        description: "อ่านค่าเซ็นเซอร์วัดทิศทางลม",
        image: WIND_DIRCTION_SVG,
        sensor: [
            {
                icon: AirIcon,
                label: "ทิศทางลม",
                unit: "°",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.uint16,
                    process: {
                        decode: a => a
                    }
                }
            },
        ],
        configs: [
            {
                label: "หมายเลขอุปกรณ์ (Modbus ID)",
                type: "number",
                min: 1,
                max: 254,
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D0,
                    type: DataType.uint16
                }
            },
            {
                label: "ความเร็วการสื่อสาร (Baud rate)",
                type: "option",
                option: [ 2400, 4800, 9600, 19200, 38400, 57600, 115200, 1200 ],
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D1,
                    type: DataType.uint16
                }
            }
        ]
    },
    {
        key: "water-level",
        name: "Water Level",
        description: "อ่านค่าเซ็นเซอร์วัดระดับน้ำ",
        image: WATER_LEVEL_SVG,
        sensor: [
            {
                icon: PropaneTankIcon,
                label: "ระดับน้ำ",
                unit: "",
                color: "#F1C40F",
                register: {
                    function: FunctionType.Input,
                    address: 0x0001,
                    type: DataType.uint16,
                    process: {
                        decode: a => a
                    }
                }
            },
        ],
        configs: [
            {
                label: "หมายเลขอุปกรณ์ (Modbus ID)",
                type: "number",
                min: 1,
                max: 254,
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D0,
                    type: DataType.uint16
                }
            },
            {
                label: "ความเร็วการสื่อสาร (Baud rate)",
                type: "option",
                option: [ 2400, 4800, 9600, 19200, 38400, 57600, 115200, 1200 ],
                register: {
                    function: FunctionType.Holding,
                    address: 0x07D1,
                    type: DataType.uint16
                }
            }
        ]
    },
]);
