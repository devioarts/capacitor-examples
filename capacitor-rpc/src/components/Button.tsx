import React from "react";

export const Button: React.FC<
	React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "green" | "red" | "neutral" }
> = ({ tone = "primary", className = "", ...props }) => {
	const toneClasses =
		{
			primary:
				"bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 focus:ring-indigo-400",
			green:
				"bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 focus:ring-emerald-400",
			red: "bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 focus:ring-rose-400",
			neutral:
				"bg-slate-600 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-400",
		}[tone] || "bg-indigo-600 text-white";

	return (
		<button
			{...props}
			className={[
				"px-3 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors",
				"focus:outline-none focus:ring-2 focus:ring-offset-2",
				toneClasses,
				className,
			].join(" ")}
		/>
	);
};