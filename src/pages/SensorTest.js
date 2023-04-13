
import * as React from 'react';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LoadingButton from '@mui/lab/LoadingButton';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import SsidChartIcon from '@mui/icons-material/SsidChart';
import SettingsIcon from '@mui/icons-material/Settings';

import SaveIcon from '@mui/icons-material/Save';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment';

import useStateWithRef from 'react-usestateref'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
)

const BoxSensorValue = ({ icon, label, value, uint, ...props }) => <Box sx={{
    borderRadius: 4,
    px: 2,
    py: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    border: "2px solid #ECF0F1",
    ...props.sx,
}}>
    {icon}
    <div style={{
       display: "flex",
       flexDirection: "column", 
       textAlign: "right",
       flexGrow: 1
    }}>
        <div>
            <span style={{
                fontSize: 24,
                color: "#2C3E50",
                marginRight: 5
            }}>{value}</span>
            <span style={{
                fontSize: 12,
                color: "#2C3E50"
            }}>{uint}</span>
        </div>
        <div style={{ 
            color: "#808B96",
            marginTop: -5,
            fontSize: 14
        }}>{label}</div>
    </div>
</Box>;

function crc16(buffer, length) {
    let crc = 0xFFFF;
    let odd = 0;

    for (var i = 0; i < length; i++) {
        crc = crc ^ buffer[i];

        for (var j = 0; j < 8; j++) {
            odd = crc & 0x0001;
            crc = crc >> 1;
            if (odd) {
                crc = crc ^ 0xA001;
            }
        }
    }

    return crc;
};

function InputConfigRow({ configsInfo, value, onChangeSensorConfigs, onClickSaveConfigs }) {
    const [ edited, setEdited ] = React.useState(false);
    
    const addonProps = {
        value,
        onChange: e => {
            setEdited(true);
            onChangeSensorConfigs(e)
        }
    };

    const sendConfigsToDevice = async () => {
        if (await onClickSaveConfigs(configsInfo.register, value)()) {
            setEdited(false);
        }
    };

    const endAdornment = edited && (
        <InputAdornment position="end">
            <IconButton
                onClick={sendConfigsToDevice}
                edge="end"
            >
                <SaveIcon />
            </IconButton>
        </InputAdornment>
    );
    
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2
        }}>
            <div>{configsInfo.label}</div>
            {configsInfo.type === "number" && <TextField
                type="text"
                size="small"
                sx={{ width: 140 }}
                InputProps={{ endAdornment }}
                {...addonProps}
            />}
            {configsInfo.type === "option" && <Select
                size="small"
                sx={{ width: 140 }}
                endAdornment={endAdornment}
                {...addonProps}
            >
                {Array.isArray(configsInfo.option) && configsInfo.option.map((a, index) => <MenuItem key={index} value={index}>{a}</MenuItem>)}
                {!Array.isArray(configsInfo.option) && typeof configsInfo.option === "object" && Object.keys(configsInfo.option).map((a, index) => <MenuItem key={index} value={a}>{configsInfo.option[a]}</MenuItem>)}
            </Select>}
        </Box>
    );
}

export default function SensorTest({ serialPort, modbusId, sensorInfo }) {
    const [ tabSelect, setTabSelect, tabSelectRef ] = useStateWithRef(0);
    const handleChangeTabSelect = (e, newValue) => setTabSelect(newValue);

    const [ sensorValue, setSensorValue, sensorValueRef ] = useStateWithRef([ ]);
    const [ sensorConfigs, setSensorConfigs ] = React.useState([ ]);
    const [ logs, setLogs, logsRef ] = useStateWithRef([ ]);

    const [
        LOG_OK,
        LOG_SUCCESS,
        LOG_ERROR,
    ] = [ 0, 1, 2 ];

    const logsBoxRef = React.useRef(null);

    const addLog = (text, code = 0) => {
        setLogs([ ...logsRef.current ].concat({ code, text }));
        // console.log(logsBoxRef.current);
        setTimeout(() => {
            logsBoxRef.current.scrollTop = logsBoxRef?.current?.scrollHeight || 0;
        }, 100);
    }

    const handleChangeSensorConfigs = index => (e) => {
        const newSensorConfigs = [ ...sensorConfigs ];
        newSensorConfigs[index] = e.target.value;
        setSensorConfigs(newSensorConfigs);
    }

    const hex = data => Array.from(data).map(a => a.toString(16)).map(a => a.length === 1 ? ("0" + a) : a).join(" ").toUpperCase();


    const ModbusReadRegister = async (id, function_code, start_address, quantity) => {
        { // Master -> Slave
            const data = new Uint8Array([
                id,                          // Devices Address
                function_code,               // Function code
                (start_address >> 8) & 0xFF, // Start Address HIGH
                start_address & 0xFF,        // Start Address LOW
                (quantity >> 8) & 0xFF,      // Quantity HIGH
                quantity & 0xFF,             // Quantity LOW
                0x00,                        // CRC LOW
                0x00                         // CRC HIGH
            ]);
            const crc = crc16(data, data.length - 2);
            data[data.length - 2] = crc & 0xFF;
            data[data.length - 1] = (crc >> 8) & 0xFF;

            const writer = serialPort.writable.getWriter();
            window.serial_writer = writer;
            await writer.write(data);
            writer.releaseLock();
            window.serial_writer = null;
            addLog("<| " + hex(data), LOG_OK);
        }

        { // Master <- Slave
            const recv_bytes = (2 * quantity);
            const read_len = 1 + 1 + 1 + recv_bytes + 2; // ID, Function, Bytes Size, <Data>, <CRC *2>

            let data_recv = [];
            try {
                const loop_read = new Promise(async (resolve, reject) => {
                    let data = [];
                    let reader = null;
                    try {
                        reader = serialPort.readable.getReader();
                    } catch(e) {
                        reject(e);
                        return;
                    }
                    window.serial_reader = reader;

                    const timer = setTimeout(() => {
                        if (serialPort?.readable?.locked) {
                            reader.cancel();
                        }
                    }, 1000); // wait max 2 sec

                    try {
                        while (1) {
                            const { value, done } = await reader.read();
                            if (value) {
                                data = data.concat(Array.from(value));
                            }
                            if (data.length >= read_len) {
                                await reader.cancel();
                            }
                            if (done) {
                                clearTimeout(timer);
                                resolve(data);
                                break;
                            }
                        }
                    } catch(e) {
                        reject(e);
                    } finally {
                        if (reader) {
                            reader.releaseLock();
                            window.serial_reader = null;
                        }
                    }
                });
                data_recv = await loop_read;
            } catch(e) {
                console.error("serial port error", e);
            }
            if (data_recv.length > 0) {
                addLog(">| " + hex(data_recv), LOG_OK);
            }

            if (data_recv.length != read_len) {
                throw "recv len invalid";
            }

            if (data_recv[0] != id) {
                throw "recv id invalid";
            }

            if (data_recv[1] != function_code) {
                throw "recv function code invalid";
            }

            if (data_recv[2] != recv_bytes) {
                throw "recv data size invalid";
            }

            const recv_crc = (data_recv[read_len - 1] << 8) | data_recv[read_len - 2];
            const crc = crc16(data_recv, data_recv.length - 2);
            if (crc != recv_crc) {
                console.log("recv crc", recv_crc, "cal crc", crc);
                throw "recv crc invalid";
            }

            const only_data = [];
            for (let i=3;i<(read_len - 2);i++) {
                only_data.push(data_recv[i]);
            }
            return only_data;
        }

        return null;
    }

    const read_sensor_value_polling = async () => {
        if (tabSelectRef.current !== 0) {
            return;
        }

        try {
            const sensor_bytes = sensorInfo.sensor.map(a => a.register.type.size).reduce((partialSum, a) => partialSum + a, 0);
            const data = await ModbusReadRegister(modbusId, sensorInfo.sensor[0].register.function.read, sensorInfo.sensor[0].register.address, sensor_bytes / 2);

            const value = [];
            let index = 0;
            for (const sensor of sensorInfo.sensor) {
                const raw_data = [];
                for (let i=0;i<sensor.register.type.size;i++) {
                    raw_data.push(data[index++]);
                }
                let register_value = sensor.register.type.process.decode(raw_data);
                if (typeof sensor.register.process?.decode === "function") {
                    register_value = sensor.register.process.decode(register_value);
                }
                value.push(register_value);
            }

            setSensorValue([ ...sensorValueRef.current ].slice(-51).concat({
                time: new Date(),
                value
            }));
        } catch(e) {
            console.error(e);
        }

        window.read_timer = setTimeout(read_sensor_value_polling, 1000); // 1 sec
    }

    const read_settings_once = async () => {
        try {
            const configs_bytes = sensorInfo.configs.map(a => a.register.type.size).reduce((partialSum, a) => partialSum + a, 0);
            const data = await ModbusReadRegister(modbusId, sensorInfo.configs[0].register.function.read, sensorInfo.configs[0].register.address, configs_bytes / 2);

            const value = [];
            let index = 0;
            for (const config of sensorInfo.configs) {
                const raw_data = [];
                for (let i=0;i<config.register.type.size;i++) {
                    raw_data.push(data[index++]);
                }
                console.log("config", config);
                let register_value = config.register.type.process.decode(raw_data);
                if (typeof config.register.process?.decode === "function") {
                    register_value = config.register.process.decode(register_value);
                }
                value.push(register_value);
            }
            console.log("value", value);

            setSensorConfigs(value);
        } catch(e) {
            console.error(e);
        }
    }

    React.useEffect(() => {
        if (serialPort) {
            if (tabSelect === 0) { // อ่านค่า
                setSensorValue([ ]);
                read_sensor_value_polling();
            } else if (tabSelect === 1) { // ตั้งค่า
                read_settings_once();
            }
        }

        return () => {
            if (window.read_timer) {
                clearTimeout(window.read_timer);
                window.read_timer = null;
            }
        }
    }, [ serialPort, tabSelect ]);

    const ModbusWriteRegister = async (id, function_code, address, value) => {
        { // Master -> Slave
            const data = new Uint8Array([
                id,                          // Devices Address
                function_code,               // Function code
                (address >> 8) & 0xFF,       // Address HIGH
                address & 0xFF,              // Address LOW
            ]
            .concat(value)
            .concat([
                0x00,                        // CRC LOW
                0x00                         // CRC HIGH
            ]));
            const crc = crc16(data, data.length - 2);
            data[data.length - 2] = crc & 0xFF;
            data[data.length - 1] = (crc >> 8) & 0xFF;

            const writer = serialPort.writable.getWriter();
            await writer.write(data);
            writer.releaseLock();
            addLog("<| " + hex(data), LOG_OK);
        }

        { // Master <- Slave
            let read_len = 1 + 1 + 1 + 2 + 2; // ID, Function, Bytes Size, <Data * 2>, <CRC *2>
            if (sensorInfo.key === "xy-md02") {
                read_len += 1;
            }

            let data_recv = [];
            try {
                const loop_read = new Promise(async (resolve, reject) => {
                    let data = [];
                    const reader = serialPort.readable.getReader();

                    const timer = setTimeout(() => {
                        if (serialPort.readable.locked) {
                            reader.cancel();
                        }
                    }, 1000); // wait max 2 sec

                    try {
                        while (1) {
                            const { value, done } = await reader.read();
                            if (value) {
                                data = data.concat(Array.from(value));
                            }
                            if (data.length >= read_len) {
                                await reader.cancel();
                            }
                            if (done) {
                                clearTimeout(timer);
                                resolve(data);
                                break;
                            }
                        }
                    } catch(e) {
                        reject(e);
                    } finally {
                        reader.releaseLock();
                    }
                });
                data_recv = await loop_read;
            } catch(e) {
                console.error("serial port error", e);
            }
            if (data_recv.length > 0) {
                addLog(">| " + hex(data_recv), LOG_OK);
            }

            console.log(sensorInfo, data_recv.length, read_len);

            if (data_recv.length != read_len) {
                throw "recv len invalid";
            }

            if (data_recv[0] != id) {
                throw "recv id invalid";
            }

            if (data_recv[1] != function_code) {
                throw "recv function code invalid";
            }

            if (sensorInfo.key === "xy-md02") {
                return true;
            }

            if (data_recv[2] != 2) {
                throw "recv data size invalid";
            }

            const recv_data = (data_recv[3] << 8) | data_recv[4];
            const value_int = (value[0] << 8) | value[1];
            if (value_int != recv_data) {
                console.log("write", value, "but recv data", recv_data);
                throw "recv value invalid";
            }

            const recv_crc = (data_recv[6] << 8) | data_recv[5];
            console.log("crc info", data_recv, data_recv.length - 2);
            const crc = crc16(data_recv, data_recv.length - 2);
            if (crc != recv_crc) {
                console.log("recv crc", recv_crc, "but cal crc", crc);
                // throw "recv crc invalid"; // Bug on ATS-CO2, ATS-LUX
            }

            return true;
        }

        return null;
    }

    const handleClickSaveConfigs = (registerInfo, value) => async () => {
        console.log("info", registerInfo, "value", value);
        try {
            if (typeof registerInfo.process?.encode === "function") {
                value = registerInfo.process.encode(value);
            }
            let register_value = registerInfo.type.process.encode(value);
            await ModbusWriteRegister(modbusId, registerInfo.function.write_single, registerInfo.address, register_value);
        } catch(e) {
            console.log(e);
            window.alert(e);
            return false;
        }

        return true;
    }

	return (
		<>
            <Container maxWidth="lg">
                <Box pt={4}>
                    <Grid container spacing={2}>
                        <Grid item md={3}>
                            {sensorInfo.image && <sensorInfo.image 
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: 400
                                }}
                            />}
                            <Box mt={2}>
                                <Box sx={{ 
                                    background: "#1C2833", 
                                    height: 160, 
                                    fontSize: 10, 
                                    p: 2,
                                    overflowY: "auto",
                                    fontFamily: '"Lucida Console", "Courier New", monospace'
                                }} ref={logsBoxRef}>
                                    {logs.map((line, index) => <Box key={index} sx={{ color: ([ "#FFF", "#0F0", "#F00" ])[line.code] }}>{line.text}</Box>)}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={9}>
                            <Paper>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tabSelect} onChange={handleChangeTabSelect} centered>
                                        {sensorInfo.sensor && <Tab label="อ่านค่า" icon={<SsidChartIcon />} />}
                                        {sensorInfo.configs && <Tab label="ตั้งค่า" icon={<SettingsIcon />} />}
                                    </Tabs>
                                </Box>
                                {tabSelect === 0 && <Box p={2}>
                                    <Grid container spacing={2} justifyContent="space-around">
                                        {sensorInfo.sensor.map((a, index) => ({
                                            ...a,
                                            icon: a.icon && <a.icon sx={{ fontSize: 50, color: "#2C3E50" }} />,
                                            value: sensorValue?.[sensorValue.length - 1]?.value?.[index] || "",
                                        })).map((a, index) => <Grid key={index} item md={4} sx={{ display: "flex", justifyContent: "center" }}>
                                            <BoxSensorValue
                                                {...a}
                                                sx={{
                                                    width: 160
                                                }}
                                            />
                                        </Grid>)}
                                    </Grid>
                                    <Box sx={{ mt: 2 }}>
                                        <Line
                                            options={{
                                                responsive: true,
                                                interaction: {
                                                    intersect: false,
                                                },
                                                animations: false,
                                                locale: "th",
                                                scales: {
                                                    x: {
                                                        type: 'time',
                                                        time: {
                                                            tooltipFormat: 'HH:mm:ss',
                                                            unit: 'second',
                                                            displayFormats: {
                                                                second: 'HH:mm:ss'
                                                            }
                                                        },
                                                        title: {
                                                            display: false,
                                                        },
                                                        adapters: {
                                                            date: {
                                                                locale: "th"
                                                            }
                                                        },
                                                    },
                                                    y: {
                                                        display: true,
                                                    },
                                                }
                                            }}
                                            data={{
                                                labels: sensorValue.map(a => a.time),
                                                datasets: sensorInfo.sensor.map((a, index) => ({
                                                    ...a,
                                                    data: sensorValue?.map(a => a.value?.[index]) || [ ],
                                                    fill: false,
                                                    tension: 0.4,
                                                    borderColor: a.color,
                                                    backgroundColor: a.color,
                                                }))
                                            }}
                                        />
                                    </Box>
                                </Box>}
                                {tabSelect === 1 && <Box p={3}>
                                    {sensorInfo.configs.map((configsInfo, index) => 
                                        <InputConfigRow key={index} {...({
                                            configsInfo,
                                            value: typeof sensorConfigs[index] !== "undefined" ? sensorConfigs[index] : "",
                                            onChangeSensorConfigs: handleChangeSensorConfigs(index),
                                            onClickSaveConfigs: handleClickSaveConfigs
                                        })} />
                                    )}
                                </Box>}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
		</>
	)
}
