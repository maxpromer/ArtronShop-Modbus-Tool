
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

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import SettingsIcon from '@mui/icons-material/Settings';

import Co2Icon from '@mui/icons-material/Co2';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';

import ATS_CO2_SVG from "../ATS_CO2_SVG";

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
                color: "#2C3E50"
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
    var crc = 0xFFFF;
    var odd;

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

export default function ATSCO2Test({ serialPort, modbusId }) {
    const [ readValue, setReadValue ] = React.useState(false);

    const handleClickStartReadValue = () => {
        setReadValue(true);
    }

    React.useEffect(() => {
        if (readValue) {

        }

        return () => {

        }
    }, [ readValue ]);

    const [ tabSelect, setTabSelect ] = React.useState(0);
    const handleChangeTabSelect = (e, newValue) => setTabSelect(newValue);

	return (
		<>
            <Container maxWidth="lg">
                <Box pt={4}>
                    <Grid container spacing={2}>
                        <Grid item md={3}>
                            <ATS_CO2_SVG 
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: 400
                                }}
                            />
                            <Box>
                                <Paper p={1}>

                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={9}>
                            <Paper>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tabSelect} onChange={handleChangeTabSelect} centered>
                                        <Tab label="อ่านค่า" icon={<SsidChartIcon />} />
                                        <Tab label="ตั้งค่า" icon={<SettingsIcon />} />
                                    </Tabs>
                                </Box>
                                {tabSelect === 0 && <Box p={2}>
                                    <Grid container spacing={2} justifyContent="space-around">
                                        {[
                                            {
                                                icon: <Co2Icon sx={{ fontSize: 50, color: "#2C3E50" }} />,
                                                label: "CO2",
                                                value: "\u00A0",
                                                uint: "ppm"
                                            },
                                            {
                                                icon: <ThermostatIcon sx={{ fontSize: 50, color: "#2C3E50" }} />,
                                                label: "อุณหภูมิ",
                                                value: "12.1" || "\u00A0",
                                                uint: "°C"
                                            },
                                            {
                                                icon: <OpacityIcon sx={{ fontSize: 50, color: "#2C3E50" }} />,
                                                label: "ความชื้น",
                                                value: "\u00A0",
                                                uint: "%RH"
                                            },
                                        ].map((a, index) => <Grid key={index} item md={4} sx={{ display: "flex", justifyContent: "center" }}>
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
                                                locale: "th",
                                                scales: {
                                                    x: {
                                                        type: 'time',
                                                        time: {
                                                            tooltipFormat: 'DD/MM/YYYY',
                                                            unit: 'day'
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
                                                        display: false,
                                                    },
                                                }
                                            }}
                                            data={{
                                                labels: [],
                                                datasets: [
                                                    {
                                                        label: 'CO2 (ppm)',
                                                        data: [ ],
                                                        fill: false,
                                                        tension: 0.4,
                                                        borderColor: "#2ECC71",
                                                        backgroundColor: "#2ECC71",
                                                    },
                                                    {
                                                        label: 'อุณหภูมิ (°C)',
                                                        data: [ ],
                                                        fill: false,
                                                        tension: 0.4,
                                                        borderColor: "#F1C40F",
                                                        backgroundColor: "#F1C40F",
                                                    },
                                                    {
                                                        label: 'ความชื้น (%RH)',
                                                        data: [ ],
                                                        fill: false,
                                                        tension: 0.4,
                                                        borderColor: "#3498DB",
                                                        backgroundColor: "#3498DB",
                                                    },
                                                ]
                                            }}
                                        />
                                    </Box>
                                </Box>}
                                {tabSelect === 1 && <Box p={3}>
                                    {[
                                        {
                                            label: "หมายเลขอุปกรณ์ (Modbus ID)",
                                            type: "number",
                                            props: {
                                                min: 1,
                                                max: 127
                                            }
                                        },
                                        {
                                            label: "ความเร็วการสื่อสาร (Baud rate)",
                                            type: "option",
                                            option: [ 9600, 14400, 19200 ]
                                        },
                                        {
                                            label: "ปรับแต่งอุณหภูมิ (°C)",
                                            type: "number",
                                            isFloat: true,
                                            props: {
                                                min: -10,
                                                max: 10
                                            }
                                        },
                                        {
                                            label: "ปรับแต่งความชื้น (%RH)",
                                            type: "number",
                                            isFloat: true,
                                            props: {
                                                min: -10,
                                                max: 10
                                            }
                                        },
                                        {
                                            label: "ปรับแต่ง CO2 (ppm)",
                                            type: "number",
                                            isFloat: true,
                                            props: {
                                                min: -1000,
                                                max: 1000
                                            }
                                        }
                                    ].map((a, index) => <Box key={index} mb={2} sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <div>{a.label}</div>
                                        {a.type === "number" && <TextField
                                            type="number"
                                            size="small"
                                            sx={{ width: 80 }}
                                            {...a.props}
                                        />}
                                        {a.type === "option" && <Select
                                            size="small"
                                            sx={{ width: 100 }}
                                            {...a.props}
                                        >
                                            {a.option.map((a, index) => <MenuItem key={index} value={a}>{a}</MenuItem>)}
                                        </Select>}
                                    </Box>)}
                                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                        <LoadingButton variant="contained" disableElevation>บันทึก</LoadingButton>
                                    </Box>
                                </Box>}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
		</>
	)
}
