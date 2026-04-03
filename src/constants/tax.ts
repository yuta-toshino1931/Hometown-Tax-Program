// ===== 所得税率テーブル（7段階） =====
export const INCOME_TAX_BRACKETS = [
  { min: 0,         max: 1_950_000,   rate: 0.05, deduction: 0 },
  { min: 1_950_000, max: 3_300_000,   rate: 0.10, deduction: 97_500 },
  { min: 3_300_000, max: 6_950_000,   rate: 0.20, deduction: 427_500 },
  { min: 6_950_000, max: 9_000_000,   rate: 0.23, deduction: 636_000 },
  { min: 9_000_000, max: 18_000_000,  rate: 0.33, deduction: 1_536_000 },
  { min: 18_000_000, max: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { min: 40_000_000, max: Infinity,   rate: 0.45, deduction: 4_796_000 },
] as const;

// 復興特別所得税率
export const RECONSTRUCTION_TAX_RATE = 1.021;

// ===== 給与所得控除テーブル（令和7年分以降） =====
export const SALARY_DEDUCTION_TABLE = [
  { min: 0,         max: 1_900_000, rate: 0, fixed: 650_000 },
  { min: 1_900_000, max: 3_600_000, rate: 0.30, fixed: 80_000 },
  { min: 3_600_000, max: 6_600_000, rate: 0.20, fixed: 440_000 },
  { min: 6_600_000, max: 8_500_000, rate: 0.10, fixed: 1_100_000 },
  { min: 8_500_000, max: Infinity,  rate: 0, fixed: 1_950_000 },
] as const;

// ===== 所得税の基礎控除テーブル（令和7年度改正版） =====
// 令和7年分・令和8年分（時限措置含む）
export const INCOME_TAX_BASIC_DEDUCTION = [
  { min: 0,          max: 1_320_000,   amount: 950_000 },   // 本則58万+特例37万
  { min: 1_320_000,  max: 3_360_000,   amount: 880_000 },   // 本則58万+特例30万（時限）
  { min: 3_360_000,  max: 4_890_000,   amount: 680_000 },   // 本則58万+特例10万（時限）
  { min: 4_890_000,  max: 6_550_000,   amount: 630_000 },   // 本則58万+特例5万（時限）
  { min: 6_550_000,  max: 23_500_000,  amount: 580_000 },   // 恒久措置
  { min: 23_500_000, max: 24_000_000,  amount: 480_000 },
  { min: 24_000_000, max: 24_500_000,  amount: 320_000 },
  { min: 24_500_000, max: 25_000_000,  amount: 160_000 },
  { min: 25_000_000, max: Infinity,    amount: 0 },
] as const;

// 住民税の基礎控除（据え置き）
export const RESIDENT_TAX_BASIC_DEDUCTION = 430_000;

// ===== 人的控除差調整額テーブル =====
export const HUMAN_CONTROL_DIFF = {
  basic: 50_000,                      // 基礎控除差（固定）
  spouseGeneral: 50_000,              // 配偶者控除（一般・所得900万以下）
  spouseElderly: 100_000,             // 配偶者控除（老人・所得900万以下）
  dependentGeneral: 50_000,           // 扶養控除（一般）
  dependentSpecific: 180_000,         // 扶養控除（特定：19〜22歳）
  dependentElderlyOther: 100_000,     // 扶養控除（老人・非同居）
  dependentElderlyCohabiting: 130_000, // 扶養控除（同居老親等）
  disabilityNormal: 10_000,           // 障害者控除（普通）
  disabilitySpecial: 100_000,         // 障害者控除（特別）
  disabilityCohabiting: 220_000,      // 同居特別障害者
  widow: 10_000,                      // 寡婦控除
  singleMother: 50_000,              // ひとり親控除（母）
  singleFather: 10_000,              // ひとり親控除（父）
  workingStudent: 10_000,             // 勤労学生控除
} as const;

// ===== 配偶者控除額 =====
// 納税者本人の合計所得金額900万円以下の場合
export const SPOUSE_DEDUCTION = {
  general: { incomeTax: 380_000, residentTax: 330_000 },
  elderly: { incomeTax: 480_000, residentTax: 380_000 },
} as const;

// ===== 扶養控除額 =====
export const DEPENDENT_DEDUCTION = {
  general:           { incomeTax: 380_000, residentTax: 330_000 },
  specific:          { incomeTax: 630_000, residentTax: 450_000 },
  elderlyOther:      { incomeTax: 480_000, residentTax: 380_000 },
  elderlyCohabiting: { incomeTax: 580_000, residentTax: 450_000 },
} as const;

// ===== 障害者控除額 =====
export const DISABILITY_DEDUCTION = {
  normal:      { incomeTax: 270_000, residentTax: 260_000 },
  special:     { incomeTax: 400_000, residentTax: 300_000 },
  cohabiting:  { incomeTax: 750_000, residentTax: 530_000 },
} as const;

// ===== ひとり親・寡婦控除額 =====
export const SINGLE_PARENT_DEDUCTION = {
  widow:        { incomeTax: 270_000, residentTax: 260_000 },
  singleMother: { incomeTax: 350_000, residentTax: 300_000 },
  singleFather: { incomeTax: 350_000, residentTax: 300_000 },
} as const;

// ===== 勤労学生控除額 =====
export const WORKING_STUDENT_DEDUCTION = {
  incomeTax: 270_000,
  residentTax: 260_000,
} as const;

// ===== 生命保険料控除の計算テーブル =====
// 新制度（所得税用）
export const LIFE_INSURANCE_NEW_INCOME_TAX = [
  { min: 0,      max: 20_000,  rate: 1.0,  fixed: 0 },
  { min: 20_000, max: 40_000,  rate: 0.5,  fixed: 10_000 },
  { min: 40_000, max: 80_000,  rate: 0.25, fixed: 20_000 },
  { min: 80_000, max: Infinity, rate: 0, fixed: 40_000 },
] as const;

// 新制度（住民税用）
export const LIFE_INSURANCE_NEW_RESIDENT_TAX = [
  { min: 0,      max: 12_000,  rate: 1.0,  fixed: 0 },
  { min: 12_000, max: 32_000,  rate: 0.5,  fixed: 6_000 },
  { min: 32_000, max: 56_000,  rate: 0.25, fixed: 14_000 },
  { min: 56_000, max: Infinity, rate: 0, fixed: 28_000 },
] as const;

// 旧制度（所得税用）
export const LIFE_INSURANCE_OLD_INCOME_TAX = [
  { min: 0,       max: 25_000,  rate: 1.0,  fixed: 0 },
  { min: 25_000,  max: 50_000,  rate: 0.5,  fixed: 12_500 },
  { min: 50_000,  max: 100_000, rate: 0.25, fixed: 25_000 },
  { min: 100_000, max: Infinity, rate: 0, fixed: 50_000 },
] as const;

// 旧制度（住民税用）
export const LIFE_INSURANCE_OLD_RESIDENT_TAX = [
  { min: 0,       max: 15_000,  rate: 1.0,  fixed: 0 },
  { min: 15_000,  max: 40_000,  rate: 0.5,  fixed: 7_500 },
  { min: 40_000,  max: 70_000,  rate: 0.25, fixed: 17_500 },
  { min: 70_000,  max: Infinity, rate: 0, fixed: 35_000 },
] as const;

// ===== 地震保険料控除 =====
export const EARTHQUAKE_INSURANCE_MAX = {
  incomeTax: 50_000,
  residentTax: 25_000,
} as const;

// ===== 住民税の税率 =====
export const RESIDENT_TAX_RATE = 0.10;

// ===== 速算係数テーブル =====
export const QUICK_CALC_COEFFICIENTS = [
  { taxRate: 0.05, coefficient: 0.23558 },
  { taxRate: 0.10, coefficient: 0.25066 },
  { taxRate: 0.20, coefficient: 0.28744 },
  { taxRate: 0.23, coefficient: 0.30068 },
  { taxRate: 0.33, coefficient: 0.35520 },
  { taxRate: 0.40, coefficient: 0.40684 },
  { taxRate: 0.45, coefficient: 0.45397 },
] as const;

// 配偶者の所得判定用：給与収入→給与所得の変換で、配偶者控除の適用判定に使う
// 配偶者の合計所得金額が48万円以下で配偶者控除適用
export const SPOUSE_INCOME_LIMIT = 480_000;
// 配偶者の給与収入が103万円以下なら合計所得48万以下
export const SPOUSE_SALARY_LIMIT = 1_030_000;
