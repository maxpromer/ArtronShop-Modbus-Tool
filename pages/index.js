import * as React from 'react';
import Head from 'next/head'
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import styles from '../styles/Index.module.scss'

import SearchIcon from '@mui/icons-material/Search';

import ModbusScaner from '../src/pages/ModbusScaner';

export default function Home() {
	const [ selectTool, setSelectTool ] = React.useState(null);

	const handleSelectTool = newSelectTool => e => {
		setSelectTool(newSelectTool);
	};

	const [ serialConfigs, setSerialConfigs ] = React.useState({
		baud: 9600,
		parity: "None",
		data_bits: 8,
		stop_bit: 1
	});
	
	const [ baudrateEl, setBaudrateEl ] = React.useState(null);
	const handleOpenSelectBaudrate = e => {
		setBaudrateEl(e.currentTarget);
	};
	const handleCloseBaudrateSelect = () => {
		setBaudrateEl(null);
	};
	const handleSelectBaudrate = baud => () => {
		const newSerialConfigs = { ...serialConfigs };
		newSerialConfigs.baud = baud;
		setSerialConfigs(newSerialConfigs);
		handleCloseBaudrateSelect();
	};

	const [ parityEl, setParityEl ] = React.useState(null);
	const handleOpenSelectParity = e => {
		setParityEl(e.currentTarget);
	};
	const handleCloseParitySelect = () => {
		setParityEl(null);
	};
	const handleSelectParity = parity => () => {
		const newSerialConfigs = { ...serialConfigs };
		newSerialConfigs.parity = parity;
		setSerialConfigs(newSerialConfigs);
		handleCloseParitySelect();
	};

	const [ stopBitEl, setStopBitEl ] = React.useState(null);
	const handleOpenSelectStopBit = e => {
		setStopBitEl(e.currentTarget);
	};
	const handleCloseStopBitSelect = () => {
		setStopBitEl(null);
	};
	const handleSelectStopBit = stop_bit => () => {
		const newSerialConfigs = { ...serialConfigs };
		newSerialConfigs.stop_bit = stop_bit;
		setSerialConfigs(newSerialConfigs);
		handleCloseStopBitSelect();
	};

	const [ serialPort, setSerialPort ] = React.useState(null);

	React.useEffect(() => {
		navigator.serial.addEventListener("disconnect", () => {
			console.log("serial disconnect");
			setSerialPort(null);
		});
	}, []);

	const handleClickConnect = async () => {
		let port;
		try {
			port = await navigator.serial.requestPort();
		} catch(e) {
			console.log("request port fail", e);
			return;
		}

		try {
			await port.open({ 
				baudRate: serialConfigs.baud,
				parity: serialConfigs.parity.toLocaleLowerCase(),
				dataBits: 8,
				stopBits: serialConfigs.stop_bit
			});
		} catch(e) {
			alert("Error: " + e.toString());
			return;
		}

		console.log("serial connected");
		setSerialPort(port);
	}

	const handleClickDisconnect = async () => {
		if (!serialPort) {
			return;
		}

		await serialPort.close();
		setSerialPort(null);
	}

	return (
		<>
			<Head>
				<title>ArtronShop Modbus Tool</title>
				<meta name="description" content="Scan & Read & Write & Simulation Modbus device" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<section>
					{selectTool == null && <div className={styles.tool_select_box}>
						<Typography variant="h1" component="h2" sx={{ mb: 1 }}>เลือกเครื่องมือที่ต้องการใช้งาน</Typography>
						<ul className={styles.tool_select_item_box}>
							<li>
								<div onClick={handleSelectTool("scan")}>
									<div>
										<SearchIcon sx={{ fontSize: 100 }} />
									</div>
									<div>
										<Typography variant="h3" component="h3">ค้นหา</Typography>
										<Typography variant="subtitle1">สแกนหาหมายเลขอุปกรณ์ Modbus RTU ที่ต่อบนบัสทั้งหมด</Typography>
									</div>
								</div>
							</li>
						</ul>
					</div>}
					{selectTool != null && <>
						<div className={styles.connect_control_box}>
							<div>
								<div>Baudrate: <span onClick={handleOpenSelectBaudrate}>{serialConfigs.baud}</span></div>
								<Menu
									anchorEl={baudrateEl}
									open={Boolean(baudrateEl)}
									onClose={handleCloseBaudrateSelect}
								>
									{[ 
										2400, 4800, 9600, 19200, 38400, 57600, 115200 
									].map(
										baud => <MenuItem key={baud} onClick={handleSelectBaudrate(baud)}>{baud}</MenuItem>
									)}
								</Menu>
								<div>Parity: <span onClick={handleOpenSelectParity}>{serialConfigs.parity}</span></div>
								<Menu
									anchorEl={parityEl}
									open={Boolean(parityEl)}
									onClose={handleCloseParitySelect}
								>
									{[ 
										"None", "Even", "Odd"
									].map(
										parity => <MenuItem key={parity} onClick={handleSelectParity(parity)}>{parity}</MenuItem>
									)}
								</Menu>
								<div>Data bits: <span>{serialConfigs.data_bits}</span></div>
								<div>Stop bit: <span onClick={handleOpenSelectStopBit}>{serialConfigs.stop_bit}</span></div>
								<Menu
									anchorEl={stopBitEl}
									open={Boolean(stopBitEl)}
									onClose={handleCloseStopBitSelect}
								>
									{[ 
										1, 2
									].map(
										stop_bit => <MenuItem key={stop_bit} onClick={handleSelectStopBit(stop_bit)}>{stop_bit}</MenuItem>
									)}
								</Menu>
							</div>
							<div>
								{!serialPort && <Button variant="contained" color="primary" onClick={handleClickConnect} disableElevation>เชื่อมต่อ</Button>}
								{serialPort && <Button variant="contained" color="secondary" onClick={handleClickDisconnect} disableElevation>ยกเลิกเชื่อมต่อ</Button>}
							</div>
						</div>
						<ModbusScaner serialPort={serialPort} />
					</>}
				</section>
				<footer>พัฒนาโดย <a href="https://www.artronshop.co.th" target="_blank">บริษัท อาร์ทรอน ชอป จำกัด</a> | ให้บริการวิจัยและพัฒนาอุปกรณ์อิเล็กทรอนิกส์อัจฉริยะ</footer>
			</main>
		</>
	)
}
