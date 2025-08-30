import {TCPClient} from "@devioarts/capacitor-tcpclient";

function App() {

	const startListeners = () => {
		TCPClient.addListener("tcpData", (data) => {
			console.log(data);
		})
		TCPClient.addListener("tcpDisconnect", (e) => {
			console.log(e);
		})
	}

	const stopListeners = () => {
		TCPClient.removeAllListeners().then((res) => {
			console.log(res);
		})
	}

	const tcpConnect = () => {
		TCPClient.connect({
			host: "192.168.222.102",
			port: 9100,
			timeoutMs: 10000
		}).then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		});
	}

	const tcpDisconnect = () => {
		TCPClient.disconnect().then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const tcpIsConnected = () => {
		TCPClient.isConnected().then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const tcpStartRead = () => {
		TCPClient.startRead().then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const tcpStopRead = () => {
		TCPClient.stopRead().then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const tcpIsReading = () => {
		TCPClient.isReading().then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}


	const tcpWrite = () => {
		const encoder = new TextEncoder();
		const data = encoder.encode("Hello");
		TCPClient.write({data}).then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const tcpWriteAndRead = () => {
		const encoder = new TextEncoder();
		const data = encoder.encode("Hello WR");
		TCPClient.writeAndRead({data}).then((res) => {
			console.log(res);
		})
	}


  return (
	  <>
		  <main>
			  <h1 style={{textAlign:"center"}}>= TCPClient =</h1>


			  <label htmlFor="tcpIP">IP:</label>
			  <input className="input" type="text" placeholder="192.168.0.1" id="tcpIP" defaultValue="192.168.222.237"/>
			  <table style={{width: "100%"}}>
				  <tbody>
				  <tr>
					  <td>
						  <button className="button-green" onClick={startListeners}>Listener On</button>
					  </td>
					  <td>
						  <button className="button-green" onClick={stopListeners}>Listener Off</button>
					  </td>
				  </tr>
				  <tr>
					  <td>
						  <button className="button-green" onClick={tcpConnect}>Connect</button>
					  </td>
					  <td>
						  <button className="button-green" onClick={tcpDisconnect}>Disconnect</button>
					  </td>
				  </tr>
				  <tr>
					  <td colSpan={2}>
						  <button className="button-green" onClick={tcpIsConnected}>Is Connected?</button>
					  </td>
				  </tr>
				  <tr>
					  <td>
						  <button className="button-green" onClick={tcpStartRead} >Start reading</button>
					  </td>
					  <td>
						  <button className="button-green" onClick={tcpStopRead} >Stop reading</button>
					  </td>
				  </tr>
				  <tr>
					  <td colSpan={2}>
						  <button className="button-green" onClick={tcpIsReading}>Is Reading?</button>
					  </td>
				  </tr>
				  <tr>
					  <td>
						  <button className="button-green" onClick={tcpWrite}>WriteHex</button>
					  </td>
					  <td>
						  <button className="button-green" onClick={tcpWriteAndRead}>Write&Read
						  </button>
					  </td>
				  </tr>
				  </tbody>
			  </table>


		  </main>
	  </>
  )
}

export default App
