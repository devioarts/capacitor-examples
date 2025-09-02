import React, {useState} from "react";
import {mDNS} from "@devioarts/capacitor-mdns";
import { useLogger } from "./components/Logger.tsx";
import { Button } from "./components/Button.tsx";
import { Input, Label } from "./components/Input.tsx";
import {TabButton} from "./components/TabButton.tsx";

export const TcpPlayground: React.FC = () => {
	/*
	 * Base
	 */
	const log = useLogger();
	const [activeTab, setActiveTab] = useState<string>("server");

	/*
	 * Settings
	 */
	//Broadcast

	const [active, setActive] = useState<boolean>(false);
	const [port, setPort] = useState<number>(9100);
	const [type, setType] = useState<string>("_http._tcp.");
	const [domain, setDomain] = useState<string>("local.");
	const [serviceId, setServiceId] = useState<string>("MyApp-"+Math.random().toString().substring(2, 5));
	//discover
	const [discType, setDiscType] = useState<string>("_http._tcp.");
	const [discName, setDiscName] = useState<string>("");
	const [discTimeout, setDiscTimeout] = useState<number>(3000);
	const [discUseNW, setDiscUseNW] = useState<boolean>(true);


	// Connection
	//<editor-fold desc="Connection">


	//</editor-fold>

	/*
	 * Testing functions
	 */
	//<editor-fold desc="Main functions">
	const startBroadcast = async () => {
		log.info("server","Starting broadcast");
		try {
			const res = await mDNS.startBroadcast({
				domain: domain,
				type: type,
				name: serviceId,
				port: port,
			});
			log.info("server","Broadcast started",res);
			setActive(true);
		} catch (e) {
			log.error("server","Broadcast failed",e);
		}
	}

	const stopBroadcast = async () => {
		log.info("server","Stopping broadcast");
		try {
			const res = await mDNS.stopBroadcast();
			log.info("server","Broadcast stopped",res);
			setActive(false);
		} catch (e) {
			log.error("server","Broadcast failed",e);
		}
	}

	const discover = async () => {
		log.info("server","Discovering");
		try {
			const res = await mDNS.discover({
				type: discType,
				name: discName.length > 0 ? discName : undefined,
				timeout: discTimeout,
				useNW: discUseNW,

			});
			log.info("server","Discovering",res);
		}catch (e) {
			log.error("server","Discovering failed",e);
		}
	}


	//</editor-fold>/


	return (
		<div className="space-y-6">
			{/* Tabs */}
			<div className="mb-3 flex items-center gap-2 border-b border-slate-200">
				<TabButton tabId={"server"} active={activeTab} onClick={ () => setActiveTab("server")}>Broadcast</TabButton>
				<TabButton tabId={"client"} active={activeTab} onClick={ () => setActiveTab("client")}>Discovery</TabButton>
			</div>
			{/* Broadcast */}
			{activeTab === "server" && (
				<section className="border border-slate-200 rounded-lg p-4 space-y-3">
					<h3 className="font-semibold">Broadcasting
						<span className="ml-2 text-sm">
            <b className={active ? "text-emerald-700" : "text-rose-700"}>●</b>
          </span>
					</h3>
					<div className="grid sm:grid-cols-2 gap-3">

						<Label label="Name"><Input type="text" value={serviceId} onChange={e => setServiceId(e.target.value)} /></Label>
						<Label label="Domain"><Input type="text" value={domain} onChange={e => setDomain(e.target.value)} /></Label>
						<Label label="Type"><Input type="text" value={type} onChange={e => setType(e.target.value)} /></Label>
						<Label label="Port"><Input type="number" value={port} onChange={e => setPort(+e.target.value)} /></Label>

					</div>
					<hr />
					<div className="flex flex-wrap gap-2">
						<Button type={"green"} onClick={startBroadcast} disabled={active}>Start broadcasting</Button>
						<Button type={"red"} onClick={stopBroadcast} disabled={!active}>Stop broadcasting</Button>

					</div>
				</section>
			)}
			{/* Discovery */}
			{activeTab === "client" && (
				<section className="border border-slate-200 rounded-lg p-4 space-y-3">
					<h3 className="font-semibold">Discovery</h3>
					<div className="grid sm:grid-cols-3 gap-3">

						<Label label="Name"><Input type="text" value={discName} onChange={e => setDiscName(e.target.value)} /></Label>
						<Label label="Timeout"><Input type="text" value={discTimeout} onChange={e => setDiscTimeout(+e.target.value)} /></Label>
						<Label label="Type"><Input type="text" value={discType} onChange={e => setDiscType(e.target.value)} /></Label>
						<label className="text-sm flex items-center gap-2">
							<input type="checkbox" checked={discUseNW} onChange={e => setDiscUseNW(e.target.checked)} />
							Use NW (for iOS only)
						</label>
					</div>
					<hr />
					<div className="flex flex-wrap gap-2">
						<Button type={"neutral"} onClick={discover} >Discover</Button>

					</div>
				</section>
			)}
		</div>
	);
};
