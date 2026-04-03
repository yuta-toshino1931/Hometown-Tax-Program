import type { SimulatorInput, CalculationResult, CalculationStep, DeductionDetail } from '../types';
import {
  INCOME_TAX_BRACKETS,
  RECONSTRUCTION_TAX_RATE,
  SALARY_DEDUCTION_TABLE,
  INCOME_TAX_BASIC_DEDUCTION,
  RESIDENT_TAX_BASIC_DEDUCTION,
  HUMAN_CONTROL_DIFF,
  SPOUSE_DEDUCTION,
  DEPENDENT_DEDUCTION,
  DISABILITY_DEDUCTION,
  SINGLE_PARENT_DEDUCTION,
  WORKING_STUDENT_DEDUCTION,
  LIFE_INSURANCE_NEW_INCOME_TAX,
  LIFE_INSURANCE_NEW_RESIDENT_TAX,
  LIFE_INSURANCE_OLD_INCOME_TAX,
  LIFE_INSURANCE_OLD_RESIDENT_TAX,
  EARTHQUAKE_INSURANCE_MAX,
  RESIDENT_TAX_RATE,
  SPOUSE_SALARY_LIMIT,
} from '../constants/tax';

const fmt = (n: number): string =>
  Math.floor(n).toLocaleString('ja-JP');

const pct = (r: number): string =>
  `${(r * 100).toFixed(3).replace(/\.?0+$/, '')}%`;

// 給与収入→給与所得控除額
function calcSalaryDeduction(salary: number): number {
  for (const bracket of SALARY_DEDUCTION_TABLE) {
    if (salary <= bracket.max) {
      return bracket.rate > 0
        ? salary * bracket.rate + bracket.fixed
        : bracket.fixed;
    }
  }
  return 1_950_000;
}

function getSalaryDeductionLabel(salary: number): string {
  if (salary <= 1_900_000) return '190万円以下 → 65万円';
  if (salary <= 3_600_000) return '190万超〜360万円 → 収入×30%+8万円';
  if (salary <= 6_600_000) return '360万超〜660万円 → 収入×20%+44万円';
  if (salary <= 8_500_000) return '660万超〜850万円 → 収入×10%+110万円';
  return '850万超 → 195万円（上限）';
}

// 生命保険料控除の個別計算
function calcInsuranceDeduction(
  premium: number,
  table: readonly { min: number; max: number; rate: number; fixed: number }[]
): number {
  if (premium <= 0) return 0;
  for (const bracket of table) {
    if (premium <= bracket.max) {
      return Math.floor(premium * bracket.rate + bracket.fixed);
    }
  }
  return table[table.length - 1].fixed;
}

// 合計所得金額から所得税の基礎控除を取得
function getIncomeTaxBasicDeduction(totalIncome: number): number {
  for (const bracket of INCOME_TAX_BASIC_DEDUCTION) {
    if (totalIncome <= bracket.max) {
      return bracket.amount;
    }
  }
  return 0;
}

// 所得税率を取得
function getIncomeTaxRate(taxableIncome: number): { rate: number; deduction: number } {
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= bracket.max) {
      return { rate: bracket.rate, deduction: bracket.deduction };
    }
  }
  return { rate: 0.45, deduction: 4_796_000 };
}

function getTaxRateLabel(taxableIncome: number): string {
  if (taxableIncome <= 1_950_000) return '195万円以下 → 5%';
  if (taxableIncome <= 3_300_000) return '195万超〜330万円 → 10%';
  if (taxableIncome <= 6_950_000) return '330万超〜695万円 → 20%';
  if (taxableIncome <= 9_000_000) return '695万超〜900万円 → 23%';
  if (taxableIncome <= 18_000_000) return '900万超〜1,800万円 → 33%';
  if (taxableIncome <= 40_000_000) return '1,800万超〜4,000万円 → 40%';
  return '4,000万超 → 45%';
}

// 配偶者の給与収入から合計所得を算出
function calcSpouseIncome(spouseSalary: number): number {
  if (spouseSalary <= 0) return 0;
  const deduction = calcSalaryDeduction(spouseSalary);
  return Math.max(0, spouseSalary - deduction);
}

// 配偶者控除の適用判定
function isSpouseDeductionApplicable(spouseSalary: number): boolean {
  return spouseSalary <= SPOUSE_SALARY_LIMIT;
}

export function calculate(input: SimulatorInput): CalculationResult {
  const steps: CalculationStep[] = [];
  const deductionDetails: DeductionDetail[] = [];

  // === Step 1: 給与所得の算出 ===
  const salaryDeduction = calcSalaryDeduction(input.salaryIncome);
  const salaryIncome = Math.max(0, input.salaryIncome - salaryDeduction);
  const totalIncome = salaryIncome + input.otherIncome;

  steps.push({
    title: 'Step 1: 給与所得の算出',
    formula: '給与所得 = 給与収入 − 給与所得控除',
    substituted: `給与所得 = ${fmt(input.salaryIncome)} − ${fmt(salaryDeduction)} = ${fmt(salaryIncome)}円`,
    result: `給与所得: ${fmt(salaryIncome)}円`,
    note: `適用区分: ${getSalaryDeductionLabel(input.salaryIncome)}${input.otherIncome > 0 ? `\n総所得金額 = ${fmt(salaryIncome)} + ${fmt(input.otherIncome)} = ${fmt(totalIncome)}円` : ''}`,
  });

  // === Step 2 & 3: 所得控除の計算（所得税用・住民税用） ===
  const socialInsurance = input.socialInsurance > 0
    ? input.socialInsurance
    : Math.floor(input.salaryIncome * 0.15);
  const socialInsuranceEstimated = input.socialInsurance <= 0;

  // 基礎控除
  const incomeTaxBasicDeduction = getIncomeTaxBasicDeduction(totalIncome);
  deductionDetails.push({
    label: '基礎控除',
    incomeTax: incomeTaxBasicDeduction,
    residentTax: totalIncome <= 25_000_000 ? RESIDENT_TAX_BASIC_DEDUCTION : 0,
  });

  // 社会保険料控除
  deductionDetails.push({
    label: `社会保険料控除${socialInsuranceEstimated ? '（推定値: 給与収入×15%）' : ''}`,
    incomeTax: socialInsurance,
    residentTax: socialInsurance,
  });

  // 配偶者控除
  let spouseDeductionIT = 0;
  let spouseDeductionRT = 0;
  if (input.hasSpouse && isSpouseDeductionApplicable(input.spouseIncome)) {
    if (input.spouseAge === '70orOver') {
      spouseDeductionIT = SPOUSE_DEDUCTION.elderly.incomeTax;
      spouseDeductionRT = SPOUSE_DEDUCTION.elderly.residentTax;
    } else {
      spouseDeductionIT = SPOUSE_DEDUCTION.general.incomeTax;
      spouseDeductionRT = SPOUSE_DEDUCTION.general.residentTax;
    }
    deductionDetails.push({
      label: `配偶者控除${input.spouseAge === '70orOver' ? '（老人）' : '（一般）'}`,
      incomeTax: spouseDeductionIT,
      residentTax: spouseDeductionRT,
    });
  }

  // 扶養控除
  if (input.dependentsGeneral > 0) {
    deductionDetails.push({
      label: `扶養控除・一般（${input.dependentsGeneral}人）`,
      incomeTax: DEPENDENT_DEDUCTION.general.incomeTax * input.dependentsGeneral,
      residentTax: DEPENDENT_DEDUCTION.general.residentTax * input.dependentsGeneral,
    });
  }
  if (input.dependentsSpecific > 0) {
    deductionDetails.push({
      label: `扶養控除・特定（${input.dependentsSpecific}人）`,
      incomeTax: DEPENDENT_DEDUCTION.specific.incomeTax * input.dependentsSpecific,
      residentTax: DEPENDENT_DEDUCTION.specific.residentTax * input.dependentsSpecific,
    });
  }
  if (input.dependentsElderlyOther > 0) {
    deductionDetails.push({
      label: `扶養控除・老人非同居（${input.dependentsElderlyOther}人）`,
      incomeTax: DEPENDENT_DEDUCTION.elderlyOther.incomeTax * input.dependentsElderlyOther,
      residentTax: DEPENDENT_DEDUCTION.elderlyOther.residentTax * input.dependentsElderlyOther,
    });
  }
  if (input.dependentsElderlyCohabiting > 0) {
    deductionDetails.push({
      label: `扶養控除・同居老親等（${input.dependentsElderlyCohabiting}人）`,
      incomeTax: DEPENDENT_DEDUCTION.elderlyCohabiting.incomeTax * input.dependentsElderlyCohabiting,
      residentTax: DEPENDENT_DEDUCTION.elderlyCohabiting.residentTax * input.dependentsElderlyCohabiting,
    });
  }

  // 障害者控除
  if (input.disabilityNormal > 0) {
    deductionDetails.push({
      label: `障害者控除・普通（${input.disabilityNormal}人）`,
      incomeTax: DISABILITY_DEDUCTION.normal.incomeTax * input.disabilityNormal,
      residentTax: DISABILITY_DEDUCTION.normal.residentTax * input.disabilityNormal,
    });
  }
  if (input.disabilitySpecial > 0) {
    deductionDetails.push({
      label: `障害者控除・特別（${input.disabilitySpecial}人）`,
      incomeTax: DISABILITY_DEDUCTION.special.incomeTax * input.disabilitySpecial,
      residentTax: DISABILITY_DEDUCTION.special.residentTax * input.disabilitySpecial,
    });
  }
  if (input.disabilityCohabiting > 0) {
    deductionDetails.push({
      label: `同居特別障害者控除（${input.disabilityCohabiting}人）`,
      incomeTax: DISABILITY_DEDUCTION.cohabiting.incomeTax * input.disabilityCohabiting,
      residentTax: DISABILITY_DEDUCTION.cohabiting.residentTax * input.disabilityCohabiting,
    });
  }

  // ひとり親・寡婦控除
  if (input.singleParentType !== 'none') {
    const sp = SINGLE_PARENT_DEDUCTION[input.singleParentType];
    const label = input.singleParentType === 'widow' ? '寡婦控除'
      : input.singleParentType === 'singleMother' ? 'ひとり親控除（母）'
      : 'ひとり親控除（父）';
    deductionDetails.push({ label, incomeTax: sp.incomeTax, residentTax: sp.residentTax });
  }

  // 勤労学生控除
  if (input.isWorkingStudent) {
    deductionDetails.push({
      label: '勤労学生控除',
      incomeTax: WORKING_STUDENT_DEDUCTION.incomeTax,
      residentTax: WORKING_STUDENT_DEDUCTION.residentTax,
    });
  }

  // 生命保険料控除
  const lifeNewIT = calcInsuranceDeduction(input.lifeInsuranceNew, LIFE_INSURANCE_NEW_INCOME_TAX);
  const lifeNewRT = calcInsuranceDeduction(input.lifeInsuranceNew, LIFE_INSURANCE_NEW_RESIDENT_TAX);
  const lifeOldIT = calcInsuranceDeduction(input.lifeInsuranceOld, LIFE_INSURANCE_OLD_INCOME_TAX);
  const lifeOldRT = calcInsuranceDeduction(input.lifeInsuranceOld, LIFE_INSURANCE_OLD_RESIDENT_TAX);

  // 一般生命保険料控除は新旧両方ある場合、新制度の控除額・旧制度の控除額・合算の控除額（上限4万/2.8万）のうち最大を採用
  let generalLifeIT = 0;
  let generalLifeRT = 0;
  if (input.lifeInsuranceNew > 0 && input.lifeInsuranceOld > 0) {
    const combinedIT = Math.min(lifeNewIT + lifeOldIT, 40_000);
    const combinedRT = Math.min(lifeNewRT + lifeOldRT, 28_000);
    generalLifeIT = Math.max(lifeNewIT, lifeOldIT, combinedIT);
    generalLifeRT = Math.max(lifeNewRT, lifeOldRT, combinedRT);
  } else if (input.lifeInsuranceNew > 0) {
    generalLifeIT = lifeNewIT;
    generalLifeRT = lifeNewRT;
  } else if (input.lifeInsuranceOld > 0) {
    generalLifeIT = lifeOldIT;
    generalLifeRT = lifeOldRT;
  }

  // 介護医療保険料控除（新制度のみ）
  const medicalIT = calcInsuranceDeduction(input.medicalInsurance, LIFE_INSURANCE_NEW_INCOME_TAX);
  const medicalRT = calcInsuranceDeduction(input.medicalInsurance, LIFE_INSURANCE_NEW_RESIDENT_TAX);

  // 個人年金保険料控除
  const pensionNewIT = calcInsuranceDeduction(input.pensionInsuranceNew, LIFE_INSURANCE_NEW_INCOME_TAX);
  const pensionNewRT = calcInsuranceDeduction(input.pensionInsuranceNew, LIFE_INSURANCE_NEW_RESIDENT_TAX);
  const pensionOldIT = calcInsuranceDeduction(input.pensionInsuranceOld, LIFE_INSURANCE_OLD_INCOME_TAX);
  const pensionOldRT = calcInsuranceDeduction(input.pensionInsuranceOld, LIFE_INSURANCE_OLD_RESIDENT_TAX);

  let pensionIT = 0;
  let pensionRT = 0;
  if (input.pensionInsuranceNew > 0 && input.pensionInsuranceOld > 0) {
    const combinedIT = Math.min(pensionNewIT + pensionOldIT, 40_000);
    const combinedRT = Math.min(pensionNewRT + pensionOldRT, 28_000);
    pensionIT = Math.max(pensionNewIT, pensionOldIT, combinedIT);
    pensionRT = Math.max(pensionNewRT, pensionOldRT, combinedRT);
  } else if (input.pensionInsuranceNew > 0) {
    pensionIT = pensionNewIT;
    pensionRT = pensionNewRT;
  } else if (input.pensionInsuranceOld > 0) {
    pensionIT = pensionOldIT;
    pensionRT = pensionOldRT;
  }

  // 生命保険料控除合計（所得税: 最大12万、住民税: 最大7万）
  const totalLifeIT = Math.min(generalLifeIT + medicalIT + pensionIT, 120_000);
  const totalLifeRT = Math.min(generalLifeRT + medicalRT + pensionRT, 70_000);

  if (totalLifeIT > 0 || totalLifeRT > 0) {
    deductionDetails.push({
      label: '生命保険料控除',
      incomeTax: totalLifeIT,
      residentTax: totalLifeRT,
    });
  }

  // 地震保険料控除
  if (input.earthquakeInsurance > 0) {
    deductionDetails.push({
      label: '地震保険料控除',
      incomeTax: Math.min(input.earthquakeInsurance, EARTHQUAKE_INSURANCE_MAX.incomeTax),
      residentTax: Math.min(Math.floor(input.earthquakeInsurance / 2), EARTHQUAKE_INSURANCE_MAX.residentTax),
    });
  }

  // 医療費控除
  if (input.medicalExpenseDeduction > 0) {
    deductionDetails.push({
      label: '医療費控除',
      incomeTax: input.medicalExpenseDeduction,
      residentTax: input.medicalExpenseDeduction,
    });
  }

  // 小規模企業共済等掛金控除（iDeCo）
  if (input.smallBusinessMutualAid > 0) {
    deductionDetails.push({
      label: '小規模企業共済等掛金控除（iDeCo等）',
      incomeTax: input.smallBusinessMutualAid,
      residentTax: input.smallBusinessMutualAid,
    });
  }

  // 所得控除合計
  const incomeTaxDeductions = deductionDetails.reduce((sum, d) => sum + d.incomeTax, 0);
  const residentTaxDeductions = deductionDetails.reduce((sum, d) => sum + d.residentTax, 0);

  // Step 2: 所得税の課税所得
  const incomeTaxTaxableIncome = Math.max(0, Math.floor((totalIncome - incomeTaxDeductions) / 1000) * 1000);

  steps.push({
    title: 'Step 2: 所得税の課税所得',
    formula: '所得税の課税所得 = 総所得金額 − 所得税用の所得控除合計',
    substituted: `課税所得 = ${fmt(totalIncome)} − ${fmt(incomeTaxDeductions)} = ${fmt(incomeTaxTaxableIncome)}円`,
    result: `所得税の課税所得: ${fmt(incomeTaxTaxableIncome)}円`,
    details: deductionDetails.map(d => ({ ...d, label: d.label + '【所得税】' })),
    note: `所得控除合計（所得税用）: ${fmt(incomeTaxDeductions)}円`,
  });

  // Step 3: 住民税の課税所得
  const residentTaxTaxableIncome = Math.max(0, Math.floor((totalIncome - residentTaxDeductions) / 1000) * 1000);

  steps.push({
    title: 'Step 3: 住民税の課税所得',
    formula: '住民税の課税所得 = 総所得金額 − 住民税用の所得控除合計',
    substituted: `課税所得 = ${fmt(totalIncome)} − ${fmt(residentTaxDeductions)} = ${fmt(residentTaxTaxableIncome)}円`,
    result: `住民税の課税所得: ${fmt(residentTaxTaxableIncome)}円`,
    details: deductionDetails,
    note: `所得控除合計（住民税用）: ${fmt(residentTaxDeductions)}円`,
  });

  // === Step 4: 住民税所得割額 ===
  // 調整控除の計算
  let humanControlDiffTotal = HUMAN_CONTROL_DIFF.basic; // 基礎控除差は常に5万円
  if (input.hasSpouse && isSpouseDeductionApplicable(input.spouseIncome)) {
    humanControlDiffTotal += input.spouseAge === '70orOver'
      ? HUMAN_CONTROL_DIFF.spouseElderly
      : HUMAN_CONTROL_DIFF.spouseGeneral;
  }
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.dependentGeneral * input.dependentsGeneral;
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.dependentSpecific * input.dependentsSpecific;
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.dependentElderlyOther * input.dependentsElderlyOther;
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.dependentElderlyCohabiting * input.dependentsElderlyCohabiting;
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.disabilityNormal * input.disabilityNormal;
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.disabilitySpecial * input.disabilitySpecial;
  humanControlDiffTotal += HUMAN_CONTROL_DIFF.disabilityCohabiting * input.disabilityCohabiting;
  if (input.singleParentType === 'widow') humanControlDiffTotal += HUMAN_CONTROL_DIFF.widow;
  if (input.singleParentType === 'singleMother') humanControlDiffTotal += HUMAN_CONTROL_DIFF.singleMother;
  if (input.singleParentType === 'singleFather') humanControlDiffTotal += HUMAN_CONTROL_DIFF.singleFather;
  if (input.isWorkingStudent) humanControlDiffTotal += HUMAN_CONTROL_DIFF.workingStudent;

  let adjustmentDeduction = 0;
  if (totalIncome <= 25_000_000) {
    if (residentTaxTaxableIncome <= 2_000_000) {
      adjustmentDeduction = Math.min(humanControlDiffTotal, residentTaxTaxableIncome) * 0.05;
    } else {
      adjustmentDeduction = Math.max(
        (humanControlDiffTotal - (residentTaxTaxableIncome - 2_000_000)) * 0.05,
        2_500
      );
    }
  }
  adjustmentDeduction = Math.floor(adjustmentDeduction);

  const residentTaxBeforeAdj = Math.floor(residentTaxTaxableIncome * RESIDENT_TAX_RATE);
  const residentTaxAmount = Math.max(0, residentTaxBeforeAdj - adjustmentDeduction);

  const adjustmentNote = residentTaxTaxableIncome <= 2_000_000
    ? `調整控除 = min(人的控除差合計${fmt(humanControlDiffTotal)}, 課税所得${fmt(residentTaxTaxableIncome)}) × 5%`
    : `調整控除 = max((${fmt(humanControlDiffTotal)} − (${fmt(residentTaxTaxableIncome)} − 2,000,000)) × 5%, 2,500)`;

  steps.push({
    title: 'Step 4: 住民税所得割額',
    formula: '所得割額 = 住民税課税所得 × 10% − 調整控除額',
    substituted: `所得割額 = ${fmt(residentTaxTaxableIncome)} × 10% − ${fmt(adjustmentDeduction)} = ${fmt(residentTaxAmount)}円`,
    result: `住民税所得割額: ${fmt(residentTaxAmount)}円`,
    note: `${adjustmentNote}\n調整控除額: ${fmt(adjustmentDeduction)}円`,
  });

  // === Step 5: 特例控除用の所得税率の決定 ===
  const judgeIncome = Math.max(0, residentTaxTaxableIncome - humanControlDiffTotal);
  const { rate: appliedIncomeTaxRate } = getIncomeTaxRate(judgeIncome);

  steps.push({
    title: 'Step 5: 特例控除用の所得税率',
    formula: '判定用所得 = 住民税課税所得 − 人的控除差調整額合計',
    substituted: `判定用所得 = ${fmt(residentTaxTaxableIncome)} − ${fmt(humanControlDiffTotal)} = ${fmt(judgeIncome)}円`,
    result: `適用所得税率: ${pct(appliedIncomeTaxRate)}`,
    note: `税率区分: ${getTaxRateLabel(judgeIncome)}`,
  });

  // === Step 6: 控除上限額の算出 ===
  const denominator = 0.9 - appliedIncomeTaxRate * RECONSTRUCTION_TAX_RATE;
  const deductionLimit = denominator > 0
    ? Math.floor(residentTaxAmount * 0.2 / denominator) + 2_000
    : 0;

  const rateWithReconstruction = appliedIncomeTaxRate * RECONSTRUCTION_TAX_RATE;

  steps.push({
    title: 'Step 6: 控除上限額の算出',
    formula: '上限額 = 住民税所得割額 × 20% ÷ (90% − 所得税率 × 1.021) + 2,000',
    substituted: `上限額 = ${fmt(residentTaxAmount)} × 20% ÷ (90% − ${pct(appliedIncomeTaxRate)} × 1.021) + 2,000`,
    result: `控除上限額: ${fmt(deductionLimit)}円`,
    note: `復興税込み率: ${pct(rateWithReconstruction)}\n分母: 90% − ${pct(rateWithReconstruction)} = ${pct(denominator)}`,
  });

  // 控除内訳の計算（上限額でふるさと納税した場合）
  const donationMinusSelfPay = Math.max(0, deductionLimit - 2_000);
  const incomeTaxRefund = Math.floor(donationMinusSelfPay * appliedIncomeTaxRate * RECONSTRUCTION_TAX_RATE);
  const residentTaxBasic = Math.floor(donationMinusSelfPay * 0.1);
  const residentTaxSpecial = donationMinusSelfPay - incomeTaxRefund - residentTaxBasic;

  return {
    deductionLimit,
    salaryDeduction,
    salaryIncome,
    totalIncome,
    incomeTaxDeductions,
    residentTaxDeductions,
    incomeTaxTaxableIncome,
    residentTaxTaxableIncome,
    residentTaxAmount,
    adjustmentDeduction,
    appliedIncomeTaxRate,
    humanControlDiffTotal,
    judgeIncome,
    incomeTaxRefund,
    residentTaxBasic,
    residentTaxSpecial,
    steps,
    deductionDetails,
  };
}
