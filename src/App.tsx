import { useState, useMemo } from 'react';
import Header from './components/Header';
import DetailedSimulator from './components/DetailedSimulator';
import ResultDisplay from './components/ResultDisplay';
import { defaultInput } from './types';
import type { SimulatorInput } from './types';
import { calculate } from './utils/taxCalculator';

export default function App() {
  const [input, setInput] = useState<SimulatorInput>(defaultInput);

  const handleChange = (patch: Partial<SimulatorInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const result = useMemo(() => calculate(input), [input]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* 左側：入力フォーム */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              各項目を入力してください
            </h2>
            <DetailedSimulator input={input} onChange={handleChange} />

            <div className="mt-6 p-4 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1">
              <p>※ 本シミュレーターは令和8年度（令和7年分所得）の税制に基づいて計算しています。</p>
              <p>※ 所得税の基礎控除引き上げ（最大95万円）、給与所得控除の最低保障額引き上げ（65万円）に対応しています。</p>
              <p>※ 住民税の基礎控除は43万円据え置きです。</p>
              <p>※ 実際の控除上限額は個人の状況により異なります。正確な金額はお住まいの市区町村にお問い合わせください。</p>
            </div>
          </div>

          {/* 右側：結果表示（デスクトップではスティッキー） */}
          <div className="lg:col-span-2 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                シミュレーション結果
              </h2>
              <ResultDisplay input={input} result={result} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 text-center py-6 mt-12 text-xs">
        <p>ふるさと納税 控除上限額シミュレーター（令和8年度対応）</p>
        <p className="mt-1">令和7年度税制改正対応版 | 計算結果はあくまで目安です</p>
      </footer>
    </div>
  );
}
