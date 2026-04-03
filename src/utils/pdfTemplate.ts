import type { SimulatorInput, CalculationResult } from '../types';

const fmt = (n: number) => Math.floor(n).toLocaleString('ja-JP');

const singleParentLabel: Record<SimulatorInput['singleParentType'], string> = {
  none: 'なし',
  widow: '寡婦控除',
  singleMother: 'ひとり親控除（母）',
  singleFather: 'ひとり親控除（父）',
};

function buildInputRows(input: SimulatorInput): string {
  type Row = { label: string; value: string; dim?: boolean };
  const rows: Row[] = [];

  const push = (label: string, v: number, unit = '円') => {
    rows.push({ label, value: v ? `${fmt(v)}${unit}` : '−', dim: !v });
  };

  push('給与収入（年収）', input.salaryIncome);
  push('給与以外の所得', input.otherIncome);
  if (input.socialInsurance > 0) {
    push('社会保険料', input.socialInsurance);
  } else {
    rows.push({
      label: '社会保険料',
      value: `${fmt(Math.floor(input.salaryIncome * 0.15))}円（自動推定）`,
      dim: false,
    });
  }

  if (input.hasSpouse) {
    rows.push({
      label: '配偶者',
      value: `あり（${input.spouseAge === '70orOver' ? '70歳以上' : '70歳未満'}、給与収入 ${fmt(input.spouseIncome)}円）`,
    });
  } else {
    rows.push({ label: '配偶者', value: 'なし', dim: true });
  }

  const depItems: [string, number][] = [
    ['一般扶養親族（16〜18歳）', input.dependentsGeneral],
    ['特定扶養親族（19〜22歳）', input.dependentsSpecific],
    ['老人扶養親族（非同居）', input.dependentsElderlyOther],
    ['同居老親等', input.dependentsElderlyCohabiting],
  ];
  for (const [label, v] of depItems) {
    if (v > 0) rows.push({ label, value: `${v}人` });
  }

  const disItems: [string, number][] = [
    ['普通障害者', input.disabilityNormal],
    ['特別障害者', input.disabilitySpecial],
    ['同居特別障害者', input.disabilityCohabiting],
  ];
  for (const [label, v] of disItems) {
    if (v > 0) rows.push({ label, value: `${v}人` });
  }

  if (input.singleParentType !== 'none') {
    rows.push({ label: 'ひとり親・寡婦控除', value: singleParentLabel[input.singleParentType] });
  }
  if (input.isWorkingStudent) {
    rows.push({ label: '勤労学生控除', value: '適用あり' });
  }

  const insItems: [string, number][] = [
    ['一般生命保険料（新）', input.lifeInsuranceNew],
    ['介護医療保険料', input.medicalInsurance],
    ['個人年金保険料（新）', input.pensionInsuranceNew],
    ['一般生命保険料（旧）', input.lifeInsuranceOld],
    ['個人年金保険料（旧）', input.pensionInsuranceOld],
    ['地震保険料', input.earthquakeInsurance],
  ];
  for (const [label, v] of insItems) {
    if (v > 0) push(label, v);
  }

  push('医療費控除額', input.medicalExpenseDeduction);
  push('小規模企業共済等掛金控除', input.smallBusinessMutualAid);
  if (input.housingLoanDeduction > 0) {
    push('住宅ローン控除額', input.housingLoanDeduction);
  }

  return rows
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;">${r.label}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:right;font-family:'Courier New',monospace;color:${r.dim ? '#94a3b8' : '#1e293b'};">${r.value}</td>
      </tr>`,
    )
    .join('');
}

function buildStepsHtml(result: CalculationResult): string {
  return result.steps
    .map(
      (step, i) => `
      <div style="margin-bottom:14px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;break-inside:avoid;">
        <div style="background:#eff6ff;padding:8px 12px;border-bottom:1px solid #dbeafe;">
          <span style="font-size:11px;font-weight:700;color:#1e40af;">Step ${i + 1}: ${step.title}</span>
        </div>
        <div style="padding:10px 12px;">
          <div style="margin-bottom:6px;">
            <span style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">公式</span>
            <div style="margin-top:3px;padding:5px 8px;background:#f8fafc;border-radius:4px;font-family:'Courier New',monospace;font-size:10px;color:#334155;">${step.formula}</div>
          </div>
          <div style="margin-bottom:6px;">
            <span style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">値の代入</span>
            <div style="margin-top:3px;padding:5px 8px;background:#eff6ff;border-radius:4px;font-family:'Courier New',monospace;font-size:10px;color:#1e40af;">${step.substituted}</div>
          </div>
          ${
            step.details && step.details.length > 0
              ? `
          <div style="margin-bottom:6px;">
            <span style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">所得控除の内訳</span>
            <table style="width:100%;border-collapse:collapse;margin-top:3px;font-size:10px;">
              <thead>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <th style="text-align:left;padding:4px 6px;color:#475569;font-weight:500;">控除項目</th>
                  <th style="text-align:right;padding:4px 6px;color:#475569;font-weight:500;">所得税</th>
                  <th style="text-align:right;padding:4px 6px;color:#475569;font-weight:500;">住民税</th>
                </tr>
              </thead>
              <tbody>
                ${result.deductionDetails
                  .map(
                    (d) => `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:3px 6px;color:#334155;">${d.label}</td>
                  <td style="padding:3px 6px;text-align:right;font-family:'Courier New',monospace;color:#334155;">${fmt(d.incomeTax)}円</td>
                  <td style="padding:3px 6px;text-align:right;font-family:'Courier New',monospace;color:#334155;">${fmt(d.residentTax)}円</td>
                </tr>`,
                  )
                  .join('')}
                <tr style="background:#f8fafc;font-weight:700;">
                  <td style="padding:3px 6px;color:#1e293b;">合計</td>
                  <td style="padding:3px 6px;text-align:right;font-family:'Courier New',monospace;color:#1e293b;">${fmt(result.incomeTaxDeductions)}円</td>
                  <td style="padding:3px 6px;text-align:right;font-family:'Courier New',monospace;color:#1e293b;">${fmt(result.residentTaxDeductions)}円</td>
                </tr>
              </tbody>
            </table>
          </div>`
              : ''
          }
          ${
            step.note
              ? `
          <div style="margin-bottom:6px;padding:5px 8px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;font-size:9px;color:#92400e;white-space:pre-line;">${step.note}</div>`
              : ''
          }
          <div style="padding:5px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;font-weight:600;font-size:10px;color:#166534;">${step.result}</div>
        </div>
      </div>`,
    )
    .join('');
}

export function buildPdfHtml(input: SimulatorInput, result: CalculationResult): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const controlTotal = result.incomeTaxRefund + result.residentTaxBasic + result.residentTaxSpecial;

  return `
<div style="width:720px;margin:0 auto;padding:32px 28px;font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Meiryo','Noto Sans JP',sans-serif;color:#1e293b;line-height:1.6;background:#fff;">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid #1e40af;">
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#1e293b;">ふるさと納税 控除上限額シミュレーション結果</h1>
    <p style="margin:6px 0 0;font-size:11px;color:#64748b;">令和8年度（令和7年分所得）対応 ｜ 生成日: ${dateStr}</p>
  </div>

  <!-- Main Result -->
  <div style="background:linear-gradient(135deg,#1e40af,#1e3a8a);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;color:#fff;">
    <p style="margin:0 0 4px;font-size:12px;color:#bfdbfe;">控除上限額の目安</p>
    <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:-0.02em;">${fmt(result.deductionLimit)}<span style="font-size:16px;font-weight:600;margin-left:4px;">円</span></p>
    <p style="margin:8px 0 0;font-size:10px;color:#bfdbfe;">この金額までのふるさと納税であれば、自己負担は2,000円で済みます</p>
  </div>

  <!-- 2-column: Input & Breakdown -->
  <div style="display:flex;gap:16px;margin-bottom:20px;">
    <!-- Input -->
    <div style="flex:1;min-width:0;">
      <h2 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e293b;padding-left:8px;border-left:4px solid #1e40af;">入力条件</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${buildInputRows(input)}
      </table>
    </div>
    <!-- Breakdown -->
    <div style="flex:1;min-width:0;">
      <h2 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e293b;padding-left:8px;border-left:4px solid #1e40af;">控除の内訳</h2>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">所得税からの控除（還付）</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;color:#1e293b;">${fmt(result.incomeTaxRefund)}円</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">住民税からの控除（基本分）</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;color:#1e293b;">${fmt(result.residentTaxBasic)}円</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">住民税からの控除（特例分）</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;color:#1e293b;">${fmt(result.residentTaxSpecial)}円</td>
        </tr>
        <tr style="background:#f0f9ff;">
          <td style="padding:6px 10px;font-weight:700;color:#1e293b;">控除合計</td>
          <td style="padding:6px 10px;text-align:right;font-family:'Courier New',monospace;font-weight:700;color:#1e40af;">${fmt(controlTotal)}円</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;font-weight:700;color:#1e293b;">自己負担額</td>
          <td style="padding:6px 10px;text-align:right;font-family:'Courier New',monospace;font-weight:700;color:#dc2626;">2,000円</td>
        </tr>
      </table>

      <h2 style="margin:16px 0 8px;font-size:13px;font-weight:700;color:#1e293b;padding-left:8px;border-left:4px solid #1e40af;">計算の主要値</h2>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">給与所得</td>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;">${fmt(result.salaryIncome)}円</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">総所得金額</td>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;">${fmt(result.totalIncome)}円</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">所得税の課税所得</td>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;">${fmt(result.incomeTaxTaxableIncome)}円</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">住民税の課税所得</td>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;">${fmt(result.residentTaxTaxableIncome)}円</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">住民税所得割額</td>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;">${fmt(result.residentTaxAmount)}円</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;color:#334155;">適用所得税率</td>
          <td style="padding:5px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:'Courier New',monospace;">${(result.appliedIncomeTaxRate * 100).toFixed(0)}%</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Calculation Steps -->
  <h2 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1e293b;padding-left:8px;border-left:4px solid #1e40af;">計算過程</h2>
  ${buildStepsHtml(result)}

  <!-- Footer -->
  <div style="margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;line-height:1.7;">
    <p style="margin:0;">※ 本シミュレーション結果は令和8年度（令和7年分所得）の税制に基づいた目安です。</p>
    <p style="margin:0;">※ 所得税の基礎控除引き上げ（最大95万円）、給与所得控除の最低保障額引き上げ（65万円）に対応しています。</p>
    <p style="margin:0;">※ 住民税の基礎控除は43万円据え置きです。</p>
    <p style="margin:0;">※ 実際の控除上限額は個人の状況により異なります。正確な金額はお住まいの市区町村にお問い合わせください。</p>
  </div>
</div>`;
}
