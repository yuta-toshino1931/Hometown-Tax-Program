import type { SimulatorInput } from '../../types';
import { handleNumericKeyDown, handleNumericPaste, parseNumericValue } from '../../utils/numericInput';

interface Props {
  input: SimulatorInput;
  onChange: (patch: Partial<SimulatorInput>) => void;
}

function AmountInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label}
        {hint && <span className="ml-2 text-xs text-slate-500">{hint}</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(parseNumericValue(e))}
          onKeyDown={handleNumericKeyDown}
          onPaste={handleNumericPaste}
          placeholder="0"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 pr-10 text-right focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">円</span>
      </div>
    </div>
  );
}

export default function DeductionSection({ input, onChange }: Props) {
  return (
    <div className="space-y-5">
      <AmountInput
        label="医療費控除額"
        hint="医療費 − 保険金補填額 − 10万円（または総所得の5%）"
        value={input.medicalExpenseDeduction}
        onChange={(v) => onChange({ medicalExpenseDeduction: v })}
      />

      <AmountInput
        label="小規模企業共済等掛金控除（iDeCo等）"
        hint="年間掛金の全額"
        value={input.smallBusinessMutualAid}
        onChange={(v) => onChange({ smallBusinessMutualAid: v })}
      />

      <div>
        <AmountInput
          label="住宅ローン控除額"
          hint="税額控除（源泉徴収票の「住宅借入金等特別控除の額」）"
          value={input.housingLoanDeduction}
          onChange={(v) => onChange({ housingLoanDeduction: v })}
        />
        {input.housingLoanDeduction > 0 && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              住宅ローン控除は税額控除のため、ふるさと納税の控除上限額の計算には直接影響しませんが、
              確定申告の場合は所得税から引ききれない分が住民税から控除されるため、
              ふるさと納税の控除枠と競合し自己負担が2,000円を超える可能性があります。
              ワンストップ特例制度の利用をお勧めします。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
