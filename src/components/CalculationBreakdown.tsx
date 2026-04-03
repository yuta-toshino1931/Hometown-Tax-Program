import { useState } from 'react';
import type { CalculationResult } from '../types';

interface Props {
  result: CalculationResult;
}

export default function CalculationBreakdown({ result }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const fmt = (n: number) => Math.floor(n).toLocaleString('ja-JP');

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm font-semibold text-slate-700"
      >
        <span>計算過程を表示</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6">
          {result.steps.map((step, i) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* ステップヘッダー */}
              <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
                <h4 className="text-sm font-bold text-primary-800">{step.title}</h4>
              </div>

              <div className="px-4 py-4 space-y-3">
                {/* 公式 */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">公式</span>
                  <div className="mt-1 px-3 py-2 bg-slate-50 rounded-lg font-mono text-sm text-slate-700">
                    {step.formula}
                  </div>
                </div>

                {/* 代入 */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">値の代入</span>
                  <div className="mt-1 px-3 py-2 bg-blue-50 rounded-lg font-mono text-sm text-blue-800">
                    {step.substituted}
                  </div>
                </div>

                {/* 所得控除の内訳テーブル（Step 2 & 3） */}
                {step.details && step.details.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      所得控除の内訳
                    </span>
                    <div className="mt-1 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-1.5 px-2 text-slate-600 font-medium">控除項目</th>
                            <th className="text-right py-1.5 px-2 text-slate-600 font-medium">所得税</th>
                            <th className="text-right py-1.5 px-2 text-slate-600 font-medium">住民税</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.deductionDetails.map((d, j) => (
                            <tr key={j} className="border-b border-slate-100">
                              <td className="py-1.5 px-2 text-slate-700">{d.label}</td>
                              <td className="text-right py-1.5 px-2 font-mono text-slate-700">{fmt(d.incomeTax)}円</td>
                              <td className="text-right py-1.5 px-2 font-mono text-slate-700">{fmt(d.residentTax)}円</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold">
                            <td className="py-1.5 px-2 text-slate-800">合計</td>
                            <td className="text-right py-1.5 px-2 font-mono text-slate-800">
                              {fmt(result.incomeTaxDeductions)}円
                            </td>
                            <td className="text-right py-1.5 px-2 font-mono text-slate-800">
                              {fmt(result.residentTaxDeductions)}円
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 補足 */}
                {step.note && (
                  <div className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 whitespace-pre-line">
                    {step.note}
                  </div>
                )}

                {/* 結果 */}
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg font-semibold text-sm text-green-800">
                  {step.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
