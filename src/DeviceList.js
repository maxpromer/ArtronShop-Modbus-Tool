import { FunctionType, DataType } from "./ModbusUtility";

// SVG icon
import ATS_CO2_SVG from "./ATS_CO2_SVG";
import ATS_LUX_SVG from "./ATS_LUX_SVG";

// MUI icon
import Co2Icon from '@mui/icons-material/Co2';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import LightModeIcon from '@mui/icons-material/LightMode';

const TYPE_TEMP = {
    icon: ThermostatIcon,
    label: "อุณหภูมิ",
    uint: "°C"
};

const TYPE_HUMI = {
    icon: OpacityIcon,
    label: "ความชื้น",
    uint: "%RH"
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
                uint: "lx",
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
                uint: "ppm",
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
    }
]);
