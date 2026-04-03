import { useState } from 'react';
import type { SimulatorInput, CalculationResult } from '../types';
import { exportPdf } from '../utils/pdfExport';
import CalculationBreakdown from './CalculationBreakdown';

interface Props {
  input: SimulatorInput;
  result: CalculationResult;
}

export default function ResultDisplay({ input, result }: Props) {
  const [exporting, setExporting] = useState(false);
  const fmt = (n: number) => Math.floor(n).toLocaleString('ja-JP');

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportPdf(input, result);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* メイン結果 */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-primary-100 mb-1">控除上限額の目安</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight">
            {fmt(result.deductionLimit)}
          </span>
          <span className="text-lg font-semibold text-primary-200">円</span>
        </div>
        <p className="text-xs text-primary-200 mt-2">
          この金額までのふるさと納税であれば、自己負担は2,000円で済みます
        </p>
      </div>

      {/* PDF保存ボタン */}
      <button
        type="button"
        onClick={handleExportPdf}
        disabled={exporting}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <>
            <svg className="animate-spin w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>PDF生成中...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
            </svg>
            <span>PDFで保存</span>
          </>
        )}
      </button>

      {/* 控除の内訳 */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          控除の内訳
          <span className="ml-2 text-xs font-normal text-slate-500">
            （上限額{fmt(result.deductionLimit)}円で寄附した場合）
          </span>
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-700">所得税からの控除（還付）</p>
              <p className="text-xs text-slate-500">（寄附金額 − 2,000）× 所得税率 × 1.021</p>
            </div>
            <span className="font-mono font-semibold text-slate-800">{fmt(result.incomeTaxRefund)}円</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-700">住民税からの控除（基本分）</p>
              <p className="text-xs text-slate-500">（寄附金額 − 2,000）× 10%</p>
            </div>
            <span className="font-mono font-semibold text-slate-800">{fmt(result.residentTaxBasic)}円</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-700">住民税からの控除（特例分）</p>
              <p className="text-xs text-slate-500">（寄附金額 − 2,000）×（90% − 所得税率 × 1.021）</p>
            </div>
            <span className="font-mono font-semibold text-slate-800">{fmt(result.residentTaxSpecial)}円</span>
          </div>

          <div className="flex justify-between items-center py-2 bg-slate-50 rounded-lg px-3 -mx-3">
            <span className="text-sm font-bold text-slate-800">控除合計</span>
            <span className="font-mono font-bold text-primary-700">
              {fmt(result.incomeTaxRefund + result.residentTaxBasic + result.residentTaxSpecial)}円
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-bold text-slate-800">自己負担額</span>
            <span className="font-mono font-bold text-accent-600">2,000円</span>
          </div>
        </div>
      </div>

      {/* 主要な中間値 */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">計算の主要値</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">給与所得</p>
            <p className="font-mono font-semibold text-slate-800">{fmt(result.salaryIncome)}円</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">総所得金額</p>
            <p className="font-mono font-semibold text-slate-800">{fmt(result.totalIncome)}円</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">所得税の課税所得</p>
            <p className="font-mono font-semibold text-slate-800">{fmt(result.incomeTaxTaxableIncome)}円</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">住民税の課税所得</p>
            <p className="font-mono font-semibold text-slate-800">{fmt(result.residentTaxTaxableIncome)}円</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">住民税所得割額</p>
            <p className="font-mono font-semibold text-slate-800">{fmt(result.residentTaxAmount)}円</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">適用所得税率</p>
            <p className="font-mono font-semibold text-slate-800">
              {(result.appliedIncomeTaxRate * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* 計算過程 */}
      <CalculationBreakdown result={result} />
    </div>
  );
}
