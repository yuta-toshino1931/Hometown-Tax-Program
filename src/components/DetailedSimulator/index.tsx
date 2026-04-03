import { useState } from 'react';
import type { SimulatorInput } from '../../types';
import IncomeSection from './IncomeSection';
import FamilySection from './FamilySection';
import InsuranceSection from './InsuranceSection';
import DeductionSection from './DeductionSection';

interface Props {
  input: SimulatorInput;
  onChange: (patch: Partial<SimulatorInput>) => void;
}

const SECTIONS = [
  { id: 'income', title: '収入情報', icon: '💰', description: '給与収入・その他所得・社会保険料' },
  { id: 'family', title: '家族情報', icon: '👨‍👩‍👧‍👦', description: '配偶者・扶養親族・障害者控除' },
  { id: 'insurance', title: '保険料控除', icon: '🛡️', description: '生命保険・地震保険' },
  { id: 'deduction', title: 'その他控除', icon: '📋', description: '医療費・iDeCo・住宅ローン' },
] as const;

export default function DetailedSimulator({ input, onChange }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['income']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderSection = (id: string) => {
    switch (id) {
      case 'income':
        return <IncomeSection input={input} onChange={onChange} />;
      case 'family':
        return <FamilySection input={input} onChange={onChange} />;
      case 'insurance':
        return <InsuranceSection input={input} onChange={onChange} />;
      case 'deduction':
        return <DeductionSection input={input} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const isOpen = openSections.has(section.id);
        return (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                {renderSection(section.id)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
