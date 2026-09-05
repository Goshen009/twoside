import type { TextFieldProps } from "@/types/types";

const LABEL_CLASSES =
  "block text-[10px] font-semibold uppercase tracking-wider text-muted";

export function DescriptionField(props: TextFieldProps) {
  const { label, error, ref, ...input_props } = props;

  return (
    <div className="space-y-1 px-4 py-3">
      {label ? <label className={LABEL_CLASSES}>{label}</label> : null}
      <input
        {...input_props}
        ref={ref}
        className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-muted/40 focus:outline-none"
      />
      {error ? <p className="text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
