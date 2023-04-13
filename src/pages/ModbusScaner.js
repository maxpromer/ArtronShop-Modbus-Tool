
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
import CircularProgress from '@mui/material/CircularProgress';

import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DoDisturbOnRoundedIcon from '@mui/icons-material/DoDisturbOnRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import styles from '../../styles/ModbusScaner.module.scss';

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

export default function ModbusScaner({ serialPort }) {
	const [ idScanRange, setIdScanRange ] = React.useState("1-10");
	const handleChangeidScanRangeInput = e => {
		setIdScanRange(e.target.value.replace(/[^0-9\-\,]|/g, ''));
	}

	const functionCode = [
		{
			code: 1,
			label: "01: Read Coils"
		},
		{
			code: 2,
			label: "02: Read Discrete Inputs"
		},
		{
			code: 3,
			label: "03: Read Holding Registers"
		},
		{
			code: 4,
			label: "04: Read Input Registers"
		},
	]
	const [ functionCodeSelect, setFunctionCodeSelect ] = React.useState([ 3 ]);
	const handleChange = e => {
		const { value } = e.target;
		// On autofill we get a stringified value.
		setFunctionCodeSelect(typeof value === 'string' ? value.split(',') : value);
	};

	const [ timeoutMS, setTimeoutMS ] = React.useState(500);
	const handleChangeTimeoutInput = e => {
		setTimeoutMS(e.target.value);
	}

    const getIdRangeArray = (text_range) => {
        const id_arr = [];
		const pushWithCheck = id => {
			if (id_arr.indexOf(id) > -1) {
				return; // Skip
			}

			id_arr.push(id);
		}
		const regex = /\d+-\d+|\d+/gm;
		let m;
		while ((m = regex.exec(idScanRange)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			
			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				if (match.indexOf('-') >= 0) {
					const [ start, end ] = match.split('-');
					for (let i=+start;i<=+end;i++) {
						pushWithCheck(i);
					}
				} else {
					pushWithCheck(+match);
				}
			});
		}

		return id_arr;
    }

	const scanRows = getIdRangeArray(idScanRange);

    const [ scaning, setScaning ] = React.useState(false);
    const [ scanResult, setScanResult ] = React.useState({});

    const SCANING               = -1;
    const SCAN_DONE_NOT_FOUND   = 0;
    const SCAN_DONE_FOUND_ERROR = 1;
    const SCAN_DONE_FOUND_WORK  = 2;
    let clean = false;
    const scanStatusUpdate = (id, function_code, status) => {
        const newScanResult = { ...scanResult };
        if (typeof newScanResult[id] === "undefined") {
            newScanResult[id] = {};
        }
        newScanResult[id][function_code] = status;
        console.log(newScanResult);
        setScanResult(newScanResult);
    }

    const handleClickStartScan = async () => {
        const scanStauts = {};
        setScanResult(scanStauts);
        await (new Promise((resolve => setTimeout(resolve, 10))));
        setScaning(true);

        const writer = serialPort.writable.getWriter();
        window.serial_writer = writer;
        // const reader = serialPort.readable.getReader();
        /*if (!serialPort.readable.locked) {
            serialPort.readable.pipeTo(new WritableStream({
                write(chunk) {
                    /*
                    for (let key of chunk) {
                            term.write(String.fromCharCode(key));
                            serialLastData += String.fromCharCode(key);
                        }*/
                    /*console.log("IN", chunk);
                }
            }));
        }*/
        
        

        const id_arr = getIdRangeArray(idScanRange);
        const function_code_arr = functionCode.filter(a => functionCodeSelect.indexOf(a.code) > -1).map(a => a.code);
        for (const id of id_arr) {
            if (!serialPort) {
                return;
            }
            scanStauts[id] = {};
            setScanResult(JSON.parse(JSON.stringify(scanStauts)));
            for (const function_code of function_code_arr) {
                scanStauts[id][function_code] = SCANING;
                setScanResult(JSON.parse(JSON.stringify(scanStauts)));

                const data = new Uint8Array([
                    id, // Devices Address
                    function_code, // Function code
                    0x00, // Start Address HIGH
                    0x01, // Start Address LOW
                    0x00, // Quantity HIGH
                    0x01, // Quantity LOW
                    0x00, // CRC LOW
                    0x00  // CRC HIGH
                ]);
                const crc = crc16(data, data.length - 2);
                data[data.length - 2] = crc & 0xFF;
                data[data.length - 1] = (crc >> 8) & 0xFF;
                writer.write(data);
                console.log(`ID: ${id}, Function: ${function_code}, Data: ${data}`);
                
                // Read back
                const deviceIdFocus = id;
                const functionCodeFocus = function_code;
                const reader = serialPort.readable.getReader();
                window.serial_reader = reader;
                try {
                    const found = await (new Promise(async (resolve, reject) => {
                        setTimeout(() => {
                            reader.cancel();
                        }, timeoutMS);
                        
                        let foundDeviceCode = 0; // 0: Not Reply    1: Reply error     2: Reply data
                        let state = 0;
                        while(1) {
                            const { value, done } = await reader.read();
                            if (value) {
                                for (const data of value) {
                                    if (state == 0) {
                                        if (data === deviceIdFocus) {
                                            state = 1;
                                        }
                                    } else if (state == 1) {
                                        if (data === functionCodeFocus) {
                                            foundDeviceCode = 2;
                                        } else {
                                            foundDeviceCode = 1;
                                        }
                                        state = 2;
                                    } else if (state == 2) {
                                        reader.cancel();
                                        state = 3;
                                    } else if (state == 3) {
                                        // Not do things
                                    }
                                }
                            }
                            if (done) {
                                console.log("Done !");
                                resolve(foundDeviceCode);
                                break;
                            }
                        }
                    }));
                    if (found === 0) {
                        console.log(`ID: ${deviceIdFocus} device not reply`);
                        // scanStatusUpdate(id, function_code, SCAN_DONE_NOT_FOUND);
                        scanStauts[id][function_code] = SCAN_DONE_NOT_FOUND;
                    } else if (found === 1) {
                        console.log(`ID: ${deviceIdFocus} found but function return error !`);
                        // scanStatusUpdate(id, function_code, SCAN_DONE_FOUND_ERROR);
                        scanStauts[id][function_code] = SCAN_DONE_FOUND_ERROR;
                    } else if (found === 2) {
                        console.log(`ID: ${deviceIdFocus} found and function work !`);
                        // scanStatusUpdate(id, function_code, SCAN_DONE_FOUND_WORK);
                        scanStauts[id][function_code] = SCAN_DONE_FOUND_WORK;
                    }
                    setScanResult(JSON.parse(JSON.stringify(scanStauts)));
                } catch(e) {
                    console.log(e);
                } finally {
                    if (serialPort?.readable?.lock) {
                        await reader.releaseLock();
                        window.serial_reader = null;
                    }
                }
                await (new Promise((resolve => setTimeout(resolve, 100))))
            }
        }
        writer.releaseLock();
        window.serial_writer = null;

        setScaning(false);
    }

	return (
		<>
            <div className={[ styles.content_box, !serialPort && styles.content_disable ].join(" ")}>
                <div>
                    <div>
                        <h3>ตั้งค่าการสแกน</h3>
                        <TextField
                            label="ช่วงหมายเลขสแกน"
                            value={idScanRange}
                            onChange={handleChangeidScanRangeInput}
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <FormControl sx={{ mb: 2, width: "100%" }}>
                            <InputLabel id="demo-multiple-checkbox-label">Function</InputLabel>
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                multiple
                                value={functionCodeSelect}
                                onChange={handleChange}
                                size="small"
                                input={
                                    <OutlinedInput
                                        label="Function"
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                }
                                renderValue={(selected) => functionCode.filter(a => selected.indexOf(a.code) > -1).map(a => a.label).join(', ')}
                            >
                                {functionCode.map(item => (
                                    <MenuItem key={item.code} value={item.code}>
                                        <Checkbox checked={functionCodeSelect.indexOf(item.code) > -1} />
                                        <ListItemText primary={item.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Timeout (ms)"
                            helperText={`ใช้เวลาสแกน ${Math.round(((timeoutMS / 1000) * scanRows.length) / 60)} นาที ${Math.round(((timeoutMS / 1000) * scanRows.length) % 60)} วินาที`}
                            value={timeoutMS}
                            onChange={handleChangeTimeoutInput}
                            size="small"
                            type="number"
                            InputProps={{
                                min: 100,
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <LoadingButton variant="contained" color="primary" onClick={handleClickStartScan} loading={scaning} disableElevation>เริ่มสแกน</LoadingButton>
                    </div>
                </div>
                <div>
                    <div>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">ID</TableCell>
                                        {functionCode.filter(a => functionCodeSelect.indexOf(a.code) > -1).map(a => <TableCell align="center" key={a.code}>{a.label}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scanRows.map(id => (
                                        <TableRow
                                            key={id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align="center" component="th" scope="row">{id}</TableCell>
                                            {functionCode.filter(a => functionCodeSelect.indexOf(a.code) > -1).map(({ code }) => 
                                            <TableCell key={code} align="center">
                                                {(() => {
                                                    if (typeof scanResult?.[id]?.[code] !== "undefined") {
                                                        const status = scanResult?.[id]?.[code];
                                                        if (status === SCANING) {
                                                            return <CircularProgress size={20}/>;
                                                        } else if (status === SCAN_DONE_NOT_FOUND) {
                                                            return <CancelRoundedIcon sx={{ color: "#E74C3C" }} />;
                                                        } else if (status === SCAN_DONE_FOUND_ERROR) {
                                                            return <DoDisturbOnRoundedIcon sx={{ color: "#F1C40F" }} />;
                                                        } else if (status === SCAN_DONE_FOUND_WORK) {
                                                            return <CheckCircleRoundedIcon sx={{ color: "#2ECC71" }} />;
                                                        }
                                                    }

                                                    return "";
                                                })()}
                                            </TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
		</>
	)
}
