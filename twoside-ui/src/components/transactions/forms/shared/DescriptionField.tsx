import type { TextFieldProps } from "@/types/types";

const INPUT_CLASSES =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs " +
  "text-zinc-100 placeholder:text-muted/50 transition-colors focus:border-primary/50 focus:outline-none";

export function DescriptionField(props: TextFieldProps) {
  const { label, error, ref, ...input_props } = props;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="block text-[10px] font-mono uppercase tracking-wider text-muted">
          {label}
        </label>
      ) : null}
      <input {...input_props} ref={ref} className={INPUT_CLASSES} />
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}
    </div>
  );
}
