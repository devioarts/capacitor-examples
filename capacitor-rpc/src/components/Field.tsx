import React from "react";

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<label className="flex flex-col gap-1">
		<span className="text-xs font-semibold text-slate-600">{label}</span>
		{children}
	</label>
);
