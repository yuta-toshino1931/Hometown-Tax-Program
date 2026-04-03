import type { SimulatorInput } from '../../types';

interface Props {
  input: SimulatorInput;
  onChange: (patch: Partial<SimulatorInput>) => void;
}

export default function IncomeSection({ input, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* 給与収入 */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          給与収入（年収）
          <span className="ml-2 text-xs font-normal text-slate-500">源泉徴収票の「支払金額」</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={input.salaryIncome || ''}
            onChange={(e) => onChange({ salaryIncome: Number(e.target.value) || 0 })}
            placeholder="5,000,000"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-right text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">円</span>
        </div>
      </div>

      {/* 給与以外の所得 */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          給与以外の所得
          <span className="ml-2 text-xs font-normal text-slate-500">事業所得・不動産所得・雑所得等の合計</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={input.otherIncome || ''}
            onChange={(e) => onChange({ otherIncome: Number(e.target.value) || 0 })}
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-right text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">円</span>
        </div>
      </div>

      {/* 社会保険料 */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          社会保険料
          <span className="ml-2 text-xs font-normal text-slate-500">
            源泉徴収票の「社会保険料等の金額」（未入力時は給与収入の15%で推定）
          </span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={input.socialInsurance || ''}
            onChange={(e) => onChange({ socialInsurance: Number(e.target.value) || 0 })}
            placeholder={`${Math.floor(input.salaryIncome * 0.15).toLocaleString()}（自動推定）`}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-right text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">円</span>
        </div>
        {input.socialInsurance <= 0 && input.salaryIncome > 0 && (
          <p className="mt-1 text-xs text-amber-600">
            未入力のため、給与収入の15%（{Math.floor(input.salaryIncome * 0.15).toLocaleString()}円）で自動推定します
          </p>
        )}
      </div>
    </div>
  );
}
