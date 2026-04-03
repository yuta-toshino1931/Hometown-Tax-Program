import type { SimulatorInput } from '../../types';
import { handleNumericKeyDown, handleNumericPaste, parseNumericValue } from '../../utils/numericInput';

interface Props {
  input: SimulatorInput;
  onChange: (patch: Partial<SimulatorInput>) => void;
}

function NumberInput({
  label,
  value,
  onChange,
  suffix = '人',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition disabled:opacity-30"
          disabled={value <= 0}
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
        >
          +
        </button>
        <span className="text-sm text-slate-500 w-6">{suffix}</span>
      </div>
    </div>
  );
}

export default function FamilySection({ input, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* 配偶者情報 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">配偶者</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={input.hasSpouse}
              onChange={(e) => onChange({ hasSpouse: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700">配偶者控除の対象となる配偶者がいる</span>
          </label>

          {input.hasSpouse && (
            <div className="ml-7 space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">配偶者の年齢</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="spouseAge"
                      checked={input.spouseAge === 'under70'}
                      onChange={() => onChange({ spouseAge: 'under70' })}
                      className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">70歳未満</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="spouseAge"
                      checked={input.spouseAge === '70orOver'}
                      onChange={() => onChange({ spouseAge: '70orOver' })}
                      className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">70歳以上</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">配偶者の給与収入</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={input.spouseIncome || ''}
                    onChange={(e) => onChange({ spouseIncome: parseNumericValue(e) })}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 pr-10 text-right focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">円</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  給与収入103万円以下で配偶者控除が適用されます
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 扶養親族 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          扶養親族
          <span className="ml-2 text-xs font-normal text-slate-500">16歳未満の子供は控除に影響しません</span>
        </h4>
        <div className="space-y-3 bg-slate-50 rounded-lg p-4">
          <NumberInput
            label="一般扶養親族（16〜18歳）"
            value={input.dependentsGeneral}
            onChange={(v) => onChange({ dependentsGeneral: v })}
          />
          <NumberInput
            label="特定扶養親族（19〜22歳）"
            value={input.dependentsSpecific}
            onChange={(v) => onChange({ dependentsSpecific: v })}
          />
          <NumberInput
            label="老人扶養親族（非同居）"
            value={input.dependentsElderlyOther}
            onChange={(v) => onChange({ dependentsElderlyOther: v })}
          />
          <NumberInput
            label="同居老親等"
            value={input.dependentsElderlyCohabiting}
            onChange={(v) => onChange({ dependentsElderlyCohabiting: v })}
          />
        </div>
      </div>

      {/* 障害者控除 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">障害者控除</h4>
        <div className="space-y-3 bg-slate-50 rounded-lg p-4">
          <NumberInput
            label="普通障害者"
            value={input.disabilityNormal}
            onChange={(v) => onChange({ disabilityNormal: v })}
          />
          <NumberInput
            label="特別障害者"
            value={input.disabilitySpecial}
            onChange={(v) => onChange({ disabilitySpecial: v })}
          />
          <NumberInput
            label="同居特別障害者"
            value={input.disabilityCohabiting}
            onChange={(v) => onChange({ disabilityCohabiting: v })}
          />
        </div>
      </div>

      {/* ひとり親・寡婦控除 */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">ひとり親・寡婦控除</h4>
        <div className="space-y-2">
          {([
            ['none', 'なし'],
            ['widow', '寡婦控除'],
            ['singleMother', 'ひとり親控除（母）'],
            ['singleFather', 'ひとり親控除（父）'],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="singleParentType"
                checked={input.singleParentType === value}
                onChange={() => onChange({ singleParentType: value })}
                className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 勤労学生控除 */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={input.isWorkingStudent}
            onChange={(e) => onChange({ isWorkingStudent: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-semibold text-slate-700">勤労学生控除</span>
        </label>
      </div>
    </div>
  );
}
