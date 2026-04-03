export interface SimulatorInput {
  // 収入情報
  salaryIncome: number;        // 給与収入
  otherIncome: number;         // 給与以外の所得

  // 社会保険料
  socialInsurance: number;     // 社会保険料（0の場合は給与収入の15%で推定）

  // 配偶者情報
  hasSpouse: boolean;
  spouseAge: 'under70' | '70orOver';
  spouseIncome: number;        // 配偶者の給与収入

  // 扶養親族（人数）
  dependentsGeneral: number;   // 一般扶養親族（16〜18歳）
  dependentsSpecific: number;  // 特定扶養親族（19〜22歳）
  dependentsElderlyOther: number;  // 老人扶養親族（非同居）
  dependentsElderlyCohabiting: number; // 同居老親等

  // 障害者控除
  disabilityNormal: number;     // 普通障害者（人数）
  disabilitySpecial: number;    // 特別障害者（人数）
  disabilityCohabiting: number; // 同居特別障害者（人数）

  // ひとり親・寡婦控除
  singleParentType: 'none' | 'widow' | 'singleMother' | 'singleFather';

  // 勤労学生控除
  isWorkingStudent: boolean;

  // 生命保険料控除（新制度）
  lifeInsuranceNew: number;    // 新・一般生命保険料
  medicalInsurance: number;    // 介護医療保険料
  pensionInsuranceNew: number; // 新・個人年金保険料

  // 生命保険料控除（旧制度）
  lifeInsuranceOld: number;    // 旧・一般生命保険料
  pensionInsuranceOld: number; // 旧・個人年金保険料

  // 地震保険料
  earthquakeInsurance: number;

  // 医療費控除
  medicalExpenseDeduction: number;

  // 小規模企業共済等掛金控除（iDeCo等）
  smallBusinessMutualAid: number;

  // 住宅ローン控除
  housingLoanDeduction: number;
}

export interface DeductionDetail {
  label: string;
  incomeTax: number;
  residentTax: number;
}

export interface CalculationStep {
  title: string;
  formula: string;
  substituted: string;
  result: string;
  details?: DeductionDetail[];
  note?: string;
}

export interface CalculationResult {
  deductionLimit: number;             // 控除上限額
  salaryDeduction: number;            // 給与所得控除額
  salaryIncome: number;               // 給与所得
  totalIncome: number;                // 総所得金額
  incomeTaxDeductions: number;        // 所得税用の所得控除合計
  residentTaxDeductions: number;      // 住民税用の所得控除合計
  incomeTaxTaxableIncome: number;     // 所得税の課税所得
  residentTaxTaxableIncome: number;   // 住民税の課税所得
  residentTaxAmount: number;          // 住民税所得割額（調整控除後）
  adjustmentDeduction: number;        // 調整控除額
  appliedIncomeTaxRate: number;       // 適用される所得税率
  humanControlDiffTotal: number;      // 人的控除差調整額合計
  judgeIncome: number;                // 特例控除判定用所得

  // 控除の内訳
  incomeTaxRefund: number;            // 所得税からの控除（還付）
  residentTaxBasic: number;           // 住民税からの控除（基本分）
  residentTaxSpecial: number;         // 住民税からの控除（特例分）

  // 計算過程
  steps: CalculationStep[];

  // 控除内訳
  deductionDetails: DeductionDetail[];
}

export const defaultInput: SimulatorInput = {
  salaryIncome: 5000000,
  otherIncome: 0,
  socialInsurance: 0,
  hasSpouse: false,
  spouseAge: 'under70',
  spouseIncome: 0,
  dependentsGeneral: 0,
  dependentsSpecific: 0,
  dependentsElderlyOther: 0,
  dependentsElderlyCohabiting: 0,
  disabilityNormal: 0,
  disabilitySpecial: 0,
  disabilityCohabiting: 0,
  singleParentType: 'none',
  isWorkingStudent: false,
  lifeInsuranceNew: 0,
  medicalInsurance: 0,
  pensionInsuranceNew: 0,
  lifeInsuranceOld: 0,
  pensionInsuranceOld: 0,
  earthquakeInsurance: 0,
  medicalExpenseDeduction: 0,
  smallBusinessMutualAid: 0,
  housingLoanDeduction: 0,
};
