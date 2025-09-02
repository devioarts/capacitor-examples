// ---------- Log panel ----------
import {useEffect, useRef} from "react";
import {Button} from "./Button.tsx";
import {Helpers} from "../Helpers.ts";



type LogLevel = "info" | "warn" | "error" | "silent";
export type LogEntry = {
	id: string;
	time: string;
	level: LogLevel;
	scope?: "server" | "client" | "system";
	msg: string;
	data?: unknown;
};
export const LogPanel: React.FC<{
	logs: LogEntry[];
	onClear: () => void;
	className?: string;
}> = ({ logs, onClear, className = "" }) => {
	const ref = useRef<HTMLDivElement>(null);
	const helper = new Helpers();
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight; // auto-scroll bottom on new logs
	}, [logs]);

	return (
		<div className={["flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm", className].join(" ")}>
			<div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
				<h3 className="text-sm font-semibold text-slate-700">Log</h3>
				<Button tone="neutral" onClick={onClear} className="px-2 py-1 text-xs">
					Clear
				</Button>
			</div>
			<div ref={ref} className="flex-1 overflow-auto p-3">
				{logs.length === 0 ? (
					<p className="text-xs text-slate-400">No logs yet. Actions will appear here.</p>
				) : (
					<ul className="space-y-2">
						{logs.map((l) => (
							<li key={l.id} className="rounded-lg border border-slate-100 p-2">
								<div className="flex items-center gap-2 text-[11px] text-slate-500">
									<span>{l.time}</span>
									{l.scope && <span className="rounded bg-slate-100 px-1 py-0.5">{l.scope}</span>}
									<span
										className={
											l.level === "error"
												? "text-rose-600"
												: l.level === "warn"
													? "text-amber-600"
													: "text-emerald-700"
										}
									>
                    {l.level.toUpperCase()}
                  </span>
								</div>
								<div className="mt-1 text-sm text-slate-800">{l.msg}</div>
								{typeof l.data !== "undefined" && (
									<pre className="mt-1 overflow-auto rounded-md bg-slate-50 p-2 text-[11px] leading-snug text-slate-700">
                    {helper.safeStringify(l.data)}
                  </pre>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};
