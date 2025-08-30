import {mDNS} from "@devioarts/capacitor-mdns";


function App() {

	const startBroadcast = () => {
		mDNS.startBroadcast({
			domain: "local.",
			port: 9100,
			id: self.crypto.randomUUID(),
			type: "_http._tcp",
		}).then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const stopBroadcast = () => {
		mDNS.stopBroadcast().then((res) => {
			console.log(res);
		}).catch((err) => {
			console.log(err);
		})
	}

	const discover = () => {
		mDNS.discover().then((res) => {
			console.log(res);
		})
	}



  return (
	  <>
		  <main>
			  <h1 style={{textAlign:"center"}}>= mDNS =</h1>



			  <table style={{width: "100%"}}>
				  <tbody>
				  <tr>
					  <td>
						  <button className="button-green" onClick={startBroadcast}>Start Broadcast</button>
					  </td>
					  <td>
						  <button className="button-green" onClick={stopBroadcast}>Stop Broadcast</button>
					  </td>
				  </tr>

				  <tr>
					  <td colSpan={2}>
						  <button className="button-green" onClick={discover}>Discover</button>
					  </td>
				  </tr>
				  </tbody>
			  </table>


		  </main>
	  </>
  )
}

export default App
