
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

import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
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

export default function ATSCO2Test({ serialPort }) {
	
    const handleClickStartScan = async () => {
        setScaning(true);

        const writer = serialPort.writable.getWriter();

        const id_arr = getIdRangeArray(idScanRange);
        const function_code_arr = functionCode.filter(a => functionCodeSelect.indexOf(a.code) > -1).map(a => a.code);
        for (const id of id_arr) {
            for (const function_code of function_code_arr) {
                await (new Promise((resolve, reject) => {
                    setTimeout(resolve, timeoutMS);
                }));

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
                await writer.write(data);
                console.log(`ID: ${id}, Function: ${function_code}, Data: ${data}`);
            }
        }
        writer.releaseLock();

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
                                        {functionCode.filter(a => functionCodeSelect.indexOf(a.code) > -1).map(a => <TableCell align="center">{a.label}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scanRows.map(id => (
                                        <TableRow
                                            key={id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align="center" component="th" scope="row">{id}</TableCell>
                                            {functionCode.filter(a => functionCodeSelect.indexOf(a.code) > -1).map(a => 
                                            <TableCell align="center">
                                                {(() => {

                                                })(a)}
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
