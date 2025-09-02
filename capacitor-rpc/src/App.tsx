import { useMemo, useRef, useState } from "react";
import { RPC } from "@devioarts/capacitor-rpc";
import {Button} from "./components/Button.tsx";
import type {LogLevel} from "vite";
import {type LogEntry, LogPanel} from "./components/LogPanel.tsx";
import {Helpers} from "./Helpers.ts";
import {Field} from "./components/Field.tsx";
import {Input} from "./components/Input.tsx";

type TabKey = "server" | "client";


// ---------- Main App ----------
export default function App() {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [active, setActive] = useState<TabKey>("server");

	// Log visibility & console mirroring
	const [logVisible, setLogVisible] = useState(true);
	const [mirrorConsole, setMirrorConsole] = useState(false);

	// Shared client configurables
	const [serverIP, setServerIP] = useState("192.168.222.106");
	const [serverPort, setServerPort] = useState(6002);
	const [serverToken, setServerToken] = useState("MyToken");
	const [useToken, setUseToken] = useState(true);

	// ---- All known server params (match native iOS/Android options) ----
	const [preferPrefix, setPreferPrefix] = useState("192.168.");
	const [mdnsName, setMdnsName] = useState("MyDemoApp");

	const [awaitTimeoutMs, setAwaitTimeoutMs] = useState(30000);
	const [resultTtlMs, setResultTtlMs] = useState(60000);
	const [requestTtlMs, setRequestTtlMs] = useState(120000);
	const [maxPending, setMaxPending] = useState(512);
	const [maxBodyBytes, setMaxBodyBytes] = useState(256 * 1024);
	const [rateLimitPerMin, setRateLimitPerMin] = useState(300);
	const [rateLimitBurst, setRateLimitBurst] = useState(30);
	const [maxPendingPerIp, setMaxPendingPerIp] = useState(16);
	const [trustProxyHeaders, setTrustProxyHeaders] = useState(false);
	const [allowedMethodsStr, setAllowedMethodsStr] = useState<string>("sum");
	const [perMethodLimitsStr, setPerMethodLimitsStr] = useState<string>("sum:8");
	const [maxResultTtlMs, setMaxResultTtlMs] = useState(300000);
	const [maxRequestTtlMs, setMaxRequestTtlMs] = useState(300000);

	const helper = new Helpers();

	// Internal: attach listeners only once
	const listenersMountedRef = useRef(false);

	// Centralized logging (panel + optional console)
	const log = (level: LogLevel, msg: string, data?: unknown, scope?: LogEntry["scope"]) => {
		const toConsole = !logVisible || mirrorConsole;
		if (logVisible) {
			setLogs((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					time: new Date().toLocaleTimeString(),
					level,
					scope,
					msg,
					data,
				},
			]);
		}
		if (toConsole) {
			const payload = data !== undefined ? { scope, msg, data } : { scope, msg };
			if (level === "error") console.error("[LOG]", payload);
			else if (level === "warn") console.warn("[LOG]", payload);
			else console.log("[LOG]", payload);
		}
	};
	const clear = () => setLogs([]);

	// --------------- Server actions (inline) ---------------
	const serverStartListener = async () => {
		if (listenersMountedRef.current) {
			log("warn", "Listeners already active", undefined, "server");
			return;
		}
		try {
			RPC.addListener("rpc", async (data: any) => {
				log("info", "rpcListener event", data, "server");
			});
			RPC.addListener("mdns", async (data: any) => {
				log("info", "mdnsListener event", data, "server");
			});
			listenersMountedRef.current = true;
			log("info", "Server listeners attached (rpc, mdns)", undefined, "server");
		} catch (err) {
			log("error", "Failed to attach listeners", err, "server");
		}
	};
	const serverStopListener = async () => {
		//
	};

	const serverStart = async () => {
		try {
			const res = await RPC.start({
				port: serverPort,
				preferSubnetPrefix: preferPrefix || undefined,
			});
			log("info", "RPC Server started", res, "server");
		} catch (e) {
			log("error", "RPC Server failed to start", e, "server");
		}
	};

	const serverStartToken = async () => {
		try {
			const res = await RPC.start({
				port: serverPort,
				preferSubnetPrefix: preferPrefix || undefined,
				token: serverToken,
			});
			log("info", "RPC Server started (token)", res, "server");
			setUseToken(true);
		} catch (e) {
			log("error", "RPC Server failed to start (token)", e, "server");
		}
	};

	const serverStartMdns = async () => {
		try {
			const res = await RPC.start({
				port: serverPort,
				preferSubnetPrefix: preferPrefix || undefined,
				mdns: mdnsName || undefined,
			});
			log("info", "RPC Server started (mDNS)", res, "server");
		} catch (e) {
			log("error", "RPC Server failed to start (mDNS)", e, "server");
		}
	};

	const serverStartWithParams = async () => {
		// Build full parameter object (only pass values; empty strings -> undefined).
		const params: any = {
			port: serverPort,
			preferSubnetPrefix: preferPrefix || undefined,
			token: serverToken || undefined,
			mdns: mdnsName || undefined,
			awaitTimeoutMs,
			resultTtlMs,
			requestTtlMs,
			maxPending,
			maxBodyBytes,
			rateLimitPerMin,
			rateLimitBurst,
			maxPendingPerIp,
			trustProxyHeaders,
			allowedMethods: helper.parseAllowed(allowedMethodsStr),
			perMethodLimits: helper.parsePerMethodLimits(perMethodLimitsStr),
			maxResultTtlMs,
			maxRequestTtlMs,
		};
		try {
			const res = await RPC.start(params);
			log("info", "RPC Server started (with params)", { params, res }, "server");
		} catch (e) {
			log("error", "RPC Server failed to start (with params)", { params, error: e }, "server");
		}
	};

	const serverStop = async () => {
		try {
			const res = await RPC.stop();
			log("info", "RPC Server stopped", res, "server");
		} catch (e) {
			log("error", "RPC Server failed to stop", e, "server");
		}
	};

	const serverInfo = async () => {
		try {
			const res = await RPC.info();
			log("info", "RPC Server info", res, "server");
		} catch (e) {
			log("error", "RPC Server failed to info", e, "server");
		}
	};

	// --------------- Client helpers ---------------
	async function awaitResult(id: string, deadlineMs = 60_000) {
		const start = Date.now();
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		while (Date.now() - start < deadlineMs) {
			const url = `http://${serverIP}:${serverPort}/rpc/await?id=${encodeURIComponent(id)}`;
			const r = await fetch(url, {
				method: "GET",
				headers: {
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
			});
			if (r.status === 200) return (await r.json()) as any; // { id, result | error }
			if (r.status !== 204) throw new Error(`AWAIT ${r.status}`);
			await sleep(300 + Math.random() * 300);
		}
		throw new Error("RPC timeout");
	}

	// --------------- Client actions (inline) ---------------
	const clientGetInfo = async () => {
		try {
			const res = await fetch(`http://${serverIP}:${serverPort}/info`, {
				headers: {
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
			});
			const json = await res.json();
			log("info", `GET /info (${res.status})`, json, "client");
		} catch (e) {
			log("error", "clientGetInfo error", e, "client");
		}
	};

	const clientGetHealth = async () => {
		try {
			const res = await fetch(`http://${serverIP}:${serverPort}/health`, {
				headers: {
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
			});
			const json = await res.json();
			log("info", `GET /health (${res.status})`, json, "client");
		} catch (e) {
			log("error", "clientGetHealth error", e, "client");
		}
	};

	const clientTestRPC = async () => {
		try {
			const id = crypto.randomUUID();
			const res = await fetch(`http://${serverIP}:${serverPort}/rpc`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
				body: JSON.stringify({ id, method: "sum", params: { a: 4, b: 7 } }),
			});
			const json = await res.json();
			log("info", `POST /rpc (${res.status})`, json, "client");

			const result = await awaitResult(id);
			log("info", "AWAIT result", result, "client");
		} catch (e) {
			log("error", "clientTestRPC error", e, "client");
		}
	};

	const clientTestRPCUnknown = async () => {
		try {
			const id = crypto.randomUUID();
			const res = await fetch(`http://${serverIP}:${serverPort}/rpc`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
				body: JSON.stringify({ id, method: "no_such_method", params: { x: 1 } }),
			});
			const json = await res.json();
			log("info", `POST /rpc (unknown) (${res.status})`, json, "client");

			const result = await awaitResult(id);
			log("info", "AWAIT (unknown) result", result, "client");
		} catch (e) {
			log("error", "clientTestRPCUnknown error", e, "client");
		}
	};

	const clientBatchRPC = async () => {
		try {
			const id1 = crypto.randomUUID();
			const id2 = crypto.randomUUID();
			const items = [
				{ id: id1, method: "sum", params: { a: 10, b: 5 } },
				{ id: id2, method: "sum", params: { a: -3, b: 9 } },
			];
			const res = await fetch(`http://${serverIP}:${serverPort}/rpc/batch`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
				body: JSON.stringify({ items }),
			});
			const json = await res.json();
			log("info", `POST /rpc/batch (${res.status})`, json, "client");

			const r1 = await awaitResult(id1);
			const r2 = await awaitResult(id2);
			log("info", "AWAIT batch results", { r1, r2 }, "client");
		} catch (e) {
			log("error", "clientBatchRPC error", e, "client");
		}
	};

	const clientCancel = async () => {
		try {
			const id = crypto.randomUUID();
			await fetch(`http://${serverIP}:${serverPort}/rpc`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
				body: JSON.stringify({ id, method: "sum", params: { a: 1, b: 2 } }),
			});
			const res = await fetch(`http://${serverIP}:${serverPort}/rpc/cancel`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
				},
				body: JSON.stringify({ id }),
			});
			const json = await res.json();
			log("warn", `POST /rpc/cancel (${res.status})`, json, "client");

			const result = await awaitResult(id);
			log("warn", "AWAIT (cancelled) result", result, "client");
		} catch (e) {
			log("error", "clientCancel error", e, "client");
		}
	};

	const clientStatus = async () => {
		try {
			const id = crypto.randomUUID();
			const r1 = await fetch(
				`http://${serverIP}:${serverPort}/rpc/status?id=${encodeURIComponent(id)}`,
				{
					headers: {
						...(useToken && serverToken ? { "X-Auth-Token": serverToken } : {}),
					},
				}
			);
			const j1 = await r1.json();
			log("info", `GET /rpc/status (${r1.status})`, j1, "client");
		} catch (e) {
			log("error", "clientStatus error", e, "client");
		}
	};

	// --------------- UI ---------------
	const tabBtn = (key: TabKey, label: string) => (
		<button
			onClick={() => setActive(key)}
			className={[
				"px-4 py-2 text-sm font-medium",
				"border-b-2 transition-colors",
				active === key ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700",
			].join(" ")}
		>
			{label}
		</button>
	);

	const serverUrl = useMemo(
		() => `http://${serverIP || "127.0.0.1"}:${serverPort || 0}`,
		[serverIP, serverPort]
	);

	// Derived preview of start params for quick verification
	const startParamsPreview = useMemo(
		() => ({
			port: serverPort,
			preferSubnetPrefix: preferPrefix || undefined,
			token: serverToken || undefined,
			mdns: mdnsName || undefined,
			awaitTimeoutMs,
			resultTtlMs,
			requestTtlMs,
			maxPending,
			maxBodyBytes,
			rateLimitPerMin,
			rateLimitBurst,
			maxPendingPerIp,
			trustProxyHeaders,
			allowedMethods: helper.parseAllowed(allowedMethodsStr),
			perMethodLimits: helper.parsePerMethodLimits(perMethodLimitsStr),
			maxResultTtlMs,
			maxRequestTtlMs,
		}),
		[
			serverPort,
			preferPrefix,
			serverToken,
			mdnsName,
			awaitTimeoutMs,
			resultTtlMs,
			requestTtlMs,
			maxPending,
			maxBodyBytes,
			rateLimitPerMin,
			rateLimitBurst,
			maxPendingPerIp,
			trustProxyHeaders,
			allowedMethodsStr,
			perMethodLimitsStr,
			maxResultTtlMs,
			maxRequestTtlMs,
		]
	);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex flex-col gap-1">
						<h1 className="text-center text-2xl font-bold text-slate-800 sm:text-left">= RPC Test Console =</h1>
						<p className="text-center text-sm text-slate-500 sm:text-left">Capacitor RPC • iOS/Android parity test</p>
						{/* Toolbar */}
						<div className="mt-2 flex flex-wrap items-center gap-3">
							<label className="inline-flex items-center gap-2 text-sm text-slate-700">
								<input
									type="checkbox"
									className="h-4 w-4 accent-indigo-600"
									checked={logVisible}
									onChange={(e) => setLogVisible(e.target.checked)}
								/>
								<span>Show log</span>
							</label>
							<label className="inline-flex items-center gap-2 text-sm text-slate-700">
								<input
									type="checkbox"
									className="h-4 w-4 accent-indigo-600"
									checked={mirrorConsole}
									onChange={(e) => setMirrorConsole(e.target.checked)}
								/>
								<span>Mirror to console</span>
							</label>
						</div>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-xs text-slate-500">Server URL</div>
						<div className="font-mono text-sm text-slate-800">{serverUrl}</div>
					</div>
				</header>

				{/* Tabs */}
				<div className="mb-3 flex items-center gap-2 border-b border-slate-200">
					{tabBtn("server", "Server")}
					{tabBtn("client", "Client")}
				</div>

				{/* Layout: content + (optional) log panel */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{/* Content */}
					<section className="md:col-span-2">
						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							{active === "server" ? (
								<div className="flex flex-col gap-4">
									<h2 className="text-lg font-semibold text-slate-800">Server</h2>

									{/* Quick controls */}
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

									<div>
										<Field label="Port">
											<Input
												type="number"
												inputMode="numeric"
												value={serverPort}
												onChange={(e) => setServerPort(helper.parseNumber(e.target.value, 0))}
											/>
										</Field>
										<Field label="Prefer Subnet Prefix">
											<Input
												placeholder="e.g. 192.168."
												value={preferPrefix}
												onChange={(e) => setPreferPrefix(e.target.value)}
											/>
										</Field>
										<Field label="Token (optional)">
											<Input
												placeholder="Token used for X-Auth-Token"
												value={serverToken}
												onChange={(e) => setServerToken(e.target.value)}
											/>
										</Field>
										<Field label="mDNS Service Name">
											<Input placeholder="MyDemoApp" value={mdnsName} onChange={(e) => setMdnsName(e.target.value)} />
										</Field>
									</div>

									{/* Actions */}
									<div className="grid grid-cols-1 gap-1 md:grid-cols-2">
										<Button onClick={serverStartListener}>Start listeners</Button>
										<Button onClick={serverStopListener}>Stop listeners</Button>
										<Button tone="green" onClick={serverStart}>
											Start
										</Button>
										<Button tone="green" onClick={serverStartToken}>
											Start with Token
										</Button>
										<Button tone="green" onClick={serverStartMdns}>
											Start with mDNS
										</Button>
										<Button tone="green" onClick={serverStartWithParams}>
											Start with params
										</Button>
										<Button tone="neutral" onClick={serverInfo}>
											Get Info
										</Button>
										<Button tone="red" onClick={serverStop}>
											Stop
										</Button>
									</div>
									</div>
									{/* Advanced params */}
									<h3 className="mt-2 text-sm font-semibold text-slate-700"></h3>
									<details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
										<summary className="cursor-pointer select-none text-slate-600">Advanced parameters</summary>

									<div className="p-2 bg-white grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
										<Field label="awaitTimeoutMs">
											<Input
												type="number"
												value={awaitTimeoutMs}
												onChange={(e) => setAwaitTimeoutMs(helper.parseNumber(e.target.value, 30000))}
											/>
										</Field>
										<Field label="resultTtlMs (default)">
											<Input
												type="number"
												value={resultTtlMs}
												onChange={(e) => setResultTtlMs(helper.parseNumber(e.target.value, 60000))}
											/>
										</Field>
										<Field label="requestTtlMs (default)">
											<Input
												type="number"
												value={requestTtlMs}
												onChange={(e) => setRequestTtlMs(helper.parseNumber(e.target.value, 120000))}
											/>
										</Field>
										<Field label="maxResultTtlMs (cap)">
											<Input
												type="number"
												value={maxResultTtlMs}
												onChange={(e) => setMaxResultTtlMs(helper.parseNumber(e.target.value, 300000))}
											/>
										</Field>
										<Field label="maxRequestTtlMs (cap)">
											<Input
												type="number"
												value={maxRequestTtlMs}
												onChange={(e) => setMaxRequestTtlMs(helper.parseNumber(e.target.value, 300000))}
											/>
										</Field>
										<Field label="maxPending (global)">
											<Input
												type="number"
												value={maxPending}
												onChange={(e) => setMaxPending(helper.parseNumber(e.target.value, 512))}
											/>
										</Field>
										<Field label="maxPendingPerIp">
											<Input
												type="number"
												value={maxPendingPerIp}
												onChange={(e) => setMaxPendingPerIp(helper.parseNumber(e.target.value, 16))}
											/>
										</Field>
										<Field label="maxBodyBytes">
											<Input
												type="number"
												value={maxBodyBytes}
												onChange={(e) => setMaxBodyBytes(helper.parseNumber(e.target.value, 256 * 1024))}
											/>
										</Field>
										<Field label="rateLimitPerMin">
											<Input
												type="number"
												value={rateLimitPerMin}
												onChange={(e) => setRateLimitPerMin(helper.parseNumber(e.target.value, 300))}
											/>
										</Field>
										<Field label="rateLimitBurst">
											<Input
												type="number"
												value={rateLimitBurst}
												onChange={(e) => setRateLimitBurst(helper.parseNumber(e.target.value, 30))}
											/>
										</Field>
										<Field label="allowedMethods (comma-separated)">
											<Input
												placeholder="sum, heavy, other"
												value={allowedMethodsStr}
												onChange={(e) => setAllowedMethodsStr(e.target.value)}
											/>
										</Field>
										<Field label="perMethodLimits (method:n, comma-separated)">
											<Input
												placeholder="sum:8,heavy:2"
												value={perMethodLimitsStr}
												onChange={(e) => setPerMethodLimitsStr(e.target.value)}
											/>
										</Field>
										<Field label="trustProxyHeaders">
											<Input
												right={
													<input
														type="checkbox"
														className="h-4 w-4 accent-indigo-600"
														checked={trustProxyHeaders}
														onChange={(e) => setTrustProxyHeaders(e.target.checked)}
													/>
												}
												readOnly
											/>
										</Field>
									</div>

									</details>



									{/* Params preview */}
									<details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
										<summary className="cursor-pointer select-none text-slate-600">Current params preview</summary>
										<pre className="mt-2 overflow-auto rounded bg-white p-2 text-[11px] leading-snug">
                      {helper.safeStringify(startParamsPreview)}
                    </pre>
									</details>

									<p className="text-xs text-slate-500">
										Hint: Run <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">curl http://&lt;ip&gt;:&lt;port&gt;/info</code>{" "}
										from your LAN to verify reachability.
									</p>
								</div>
							) : (
								<div className="flex flex-col gap-4">
									<h2 className="text-lg font-semibold text-slate-800">Client</h2>

									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<Field label="Server IP">
											<Input placeholder="192.168.x.x" value={serverIP} onChange={(e) => setServerIP(e.target.value)} />
										</Field>
										<Field label="Server Port">
											<Input
												type="number"
												inputMode="numeric"
												value={serverPort}
												onChange={(e) => setServerPort(helper.parseNumber(e.target.value, 0))}
											/>
										</Field>

										<Field label="Auth Token">
											<Input
												placeholder="X-Auth-Token value"
												value={serverToken}
												onChange={(e) => setServerToken(e.target.value)}
												right={
													<label className="flex items-center gap-1">
														<input
															type="checkbox"
															className="h-4 w-4 accent-indigo-600"
															checked={useToken}
															onChange={(e) => setUseToken(e.target.checked)}
														/>
														<span className="text-slate-500">Use</span>
													</label>
												}
											/>
										</Field>
									</div>

									<div className="flex flex-wrap gap-2">
										<Button onClick={clientGetInfo}>GET /info</Button>
										<Button onClick={clientGetHealth}>GET /health</Button>
										<Button tone="green" onClick={clientTestRPC}>
											RPC sum
										</Button>
										<Button tone="neutral" onClick={clientTestRPCUnknown}>
											RPC unknown
										</Button>
										<Button tone="green" onClick={clientBatchRPC}>
											RPC batch
										</Button>
										<Button tone="red" onClick={clientCancel}>
											RPC cancel
										</Button>
										<Button onClick={clientStatus}>RPC status</Button>
									</div>

									<p className="text-xs text-slate-500">
										Flow: <span className="font-mono">POST /rpc</span> →{" "}
										<span className="font-mono">GET /rpc/await?id=…</span>. Client sends{" "}
										<span className="font-mono">X-Auth-Token</span> only if enabled.
									</p>
								</div>
							)}
						</div>
					</section>

					{/* Log panel */}
					{logVisible && (
						<aside
							className={[
								"md:col-span-1",
								"h-[400px]", // mobile: fixed height
								"md:sticky md:top-4 md:self-start md:h-[calc(100vh-15rem)]", // ≥ md: full-height sticky
							].join(" ")}
						>
							<LogPanel logs={logs} onClear={clear} className="h-full" />
						</aside>
					)}
				</div>
			</div>
		</div>
	);
}
