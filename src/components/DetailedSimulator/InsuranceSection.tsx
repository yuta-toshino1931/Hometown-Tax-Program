import type { SimulatorInput } from '../../types';

interface Props {
  input: SimulatorInput;
  onChange: (patch: Partial<SimulatorInput>) => void;
}

function AmountInput({
  label,
  hint,
  value,
  onChange,
  placeholder = '0',
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label}
        {hint && <span className="ml-2 text-xs text-slate-500">{hint}</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 pr-10 text-right focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">円</span>
      </div>
    </div>
  );
}

export default function InsuranceSection({ input, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* 生命保険料控除 - 新制度 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          生命保険料控除（新制度）
          <span className="ml-2 text-xs font-normal text-slate-500">平成24年1月1日以降の契約</span>
        </h4>
        <div className="space-y-3 bg-slate-50 rounded-lg p-4">
          <AmountInput
            label="一般生命保険料（新）"
            hint="年間支払額"
            value={input.lifeInsuranceNew}
            onChange={(v) => onChange({ lifeInsuranceNew: v })}
          />
          <AmountInput
            label="介護医療保険料"
            hint="年間支払額"
            value={input.medicalInsurance}
            onChange={(v) => onChange({ medicalInsurance: v })}
          />
          <AmountInput
            label="個人年金保険料（新）"
            hint="年間支払額"
            value={input.pensionInsuranceNew}
            onChange={(v) => onChange({ pensionInsuranceNew: v })}
          />
        </div>
      </div>

      {/* 生命保険料控除 - 旧制度 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          生命保険料控除（旧制度）
          <span className="ml-2 text-xs font-normal text-slate-500">平成23年12月31日以前の契約</span>
        </h4>
        <div className="space-y-3 bg-slate-50 rounded-lg p-4">
          <AmountInput
            label="一般生命保険料（旧）"
            hint="年間支払額"
            value={input.lifeInsuranceOld}
            onChange={(v) => onChange({ lifeInsuranceOld: v })}
          />
          <AmountInput
            label="個人年金保険料（旧）"
            hint="年間支払額"
            value={input.pensionInsuranceOld}
            onChange={(v) => onChange({ pensionInsuranceOld: v })}
          />
        </div>
      </div>

      {/* 地震保険料 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">地震保険料控除</h4>
        <AmountInput
          label="地震保険料"
          hint="年間支払額（所得税: 最大5万円、住民税: 最大2.5万円）"
          value={input.earthquakeInsurance}
          onChange={(v) => onChange({ earthquakeInsurance: v })}
        />
      </div>
    </div>
  );
}
