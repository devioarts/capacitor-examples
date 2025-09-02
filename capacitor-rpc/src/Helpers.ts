export class Helpers {

	constructor() {
		// empty
	}

	safeStringify(v: unknown): string {
		try {
			return JSON.stringify(v, null, 2);
		} catch {
			return String(v);
		}
	}


	parseNumber  (v: string, fallback = 0):any {
		const n = Number(v);
		return Number.isFinite(n) ? n : fallback;
	};
	parseAllowed = (v: string): string[] =>
		v
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
	parsePerMethodLimits = (v: string): Record<string, number> => {
		// format: "sum:2,heavy:1"
		const out: Record<string, number> = {};
		v.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((pair) => {
				const [k, raw] = pair.split(":").map((x) => x.trim());
				if (!k) return;
				const val = Number(raw);
				if (Number.isFinite(val) && val > 0) out[k] = val;
			});
		return out;
	};

}