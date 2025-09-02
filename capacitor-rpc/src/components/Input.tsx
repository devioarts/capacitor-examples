import React from "react";

export const Input: React.FC<
	React.InputHTMLAttributes<HTMLInputElement> & { right?: React.ReactNode }
> = ({ className = "", right, ...props }) => (
	<div className="relative">
		<input
			{...props}
			className={[
				"w-full rounded-xl border border-slate-300 px-3 py-2 text-sm",
				"focus:outline-none focus:ring-2 focus:ring-indigo-400",
				className,
			].join(" ")}
		/>
		{right ? <div className="absolute inset-y-0 right-2 flex items-center text-xs">{right}</div> : null}
	</div>
);