// Nepal Income Tax — multi-year slab definitions.
//
// Each slab band has a `size` (width of the band in NPR) and a `rate`.
// The final band has `size: Infinity` (everything above the previous cap).
//
// The first band's 1% is the Social Security Tax (SST). It is waived for
// taxpayers who contribute to the SSF, are sole proprietors, or earn only
// pension income — in that case the first band is taxed at 0%.

export const TAX_YEARS = {
  '2083/84': {
    label: 'FY 2083/84 (2026/27)',
    badge: 'New budget',
    // Announced by FM Dr. Swarnim Wagle on 29 May 2026. Exemption doubled to
    // Rs 10 lakh, top rate cut 39% -> 29%. Budget coverage presents one unified
    // schedule; a separate married threshold has not been published yet, so we
    // apply the same bands to both filing statuses pending the Finance Bill.
    marriedDiffers: false,
    note:
      'New FY 2083/84 budget (announced 29 May 2026). Exemption raised to Rs 10 lakh, ' +
      'top rate cut to 29%. A separate married-couple threshold has not been published ' +
      'yet — single and married use the same bands here pending the Finance Bill.',
    slabs: {
      single: [
        { size: 1_000_000, rate: 0.01, label: 'First Rs 10,00,000' },
        { size: 500_000, rate: 0.10, label: 'Next Rs 5,00,000' },
        { size: 1_000_000, rate: 0.20, label: 'Next Rs 10,00,000' },
        { size: 1_500_000, rate: 0.27, label: 'Next Rs 15,00,000' },
        { size: Infinity, rate: 0.29, label: 'Above Rs 40,00,000' },
      ],
      married: [
        { size: 1_000_000, rate: 0.01, label: 'First Rs 10,00,000' },
        { size: 500_000, rate: 0.10, label: 'Next Rs 5,00,000' },
        { size: 1_000_000, rate: 0.20, label: 'Next Rs 10,00,000' },
        { size: 1_500_000, rate: 0.27, label: 'Next Rs 15,00,000' },
        { size: Infinity, rate: 0.29, label: 'Above Rs 40,00,000' },
      ],
    },
  },
  '2082/83': {
    label: 'FY 2082/83 (2025/26)',
    marriedDiffers: true,
    note: 'FY 2082/83 slabs (unchanged from FY 2081/82).',
    slabs: {
      single: [
        { size: 500_000, rate: 0.01, label: 'First Rs 5,00,000' },
        { size: 200_000, rate: 0.10, label: 'Next Rs 2,00,000' },
        { size: 300_000, rate: 0.20, label: 'Next Rs 3,00,000' },
        { size: 1_000_000, rate: 0.30, label: 'Next Rs 10,00,000' },
        { size: 3_000_000, rate: 0.36, label: 'Next Rs 30,00,000' },
        { size: Infinity, rate: 0.39, label: 'Above Rs 50,00,000' },
      ],
      married: [
        { size: 600_000, rate: 0.01, label: 'First Rs 6,00,000' },
        { size: 200_000, rate: 0.10, label: 'Next Rs 2,00,000' },
        { size: 300_000, rate: 0.20, label: 'Next Rs 3,00,000' },
        { size: 900_000, rate: 0.30, label: 'Next Rs 9,00,000' },
        { size: 3_000_000, rate: 0.36, label: 'Next Rs 30,00,000' },
        { size: Infinity, rate: 0.39, label: 'Above Rs 50,00,000' },
      ],
    },
  },
}

export const DEFAULT_YEAR = '2083/84'

// Statutory annual deduction ceilings (NPR).
export const DEDUCTION_LIMITS = {
  // EPF + CIT + SSF share one pool: lower of Rs 5,00,000 or 1/3 of assessable income.
  retirement: 500_000,
  lifeInsurance: 40_000,
  healthInsurance: 20_000,
}

const clamp = (n) => (Number.isFinite(n) && n > 0 ? n : 0)

/**
 * Apply Nepal's statutory caps to itemised deductions.
 *
 * Retirement contributions (EPF + CIT + SSF) share one pool, deductible up to
 * the lowest of: actual contribution, 1/3 of assessable income, and the ceiling
 * (Rs 5,00,000 for SSF contributors, else Rs 3,00,000). Life and health
 * insurance premiums have their own separate caps.
 *
 * @param {object} d  All amounts ANNUAL (NPR)
 * @param {number} d.epf
 * @param {number} d.cit
 * @param {number} d.ssf
 * @param {number} d.lifeInsurance
 * @param {number} d.healthInsurance
 * @param {number} d.assessableIncome  Gross annual income, for the 1/3 limit
 */
export function computeDeductions({
  epf = 0,
  cit = 0,
  ssf = 0,
  lifeInsurance = 0,
  healthInsurance = 0,
  assessableIncome = 0,
} = {}) {
  const contributesSSF = clamp(ssf) > 0
  const retirementContrib = clamp(epf) + clamp(cit) + clamp(ssf)
  const ceiling = DEDUCTION_LIMITS.retirement
  const oneThird = clamp(assessableIncome) / 3
  const retirementAllowed = Math.min(retirementContrib, ceiling, oneThird)

  const lifeAllowed = Math.min(clamp(lifeInsurance), DEDUCTION_LIMITS.lifeInsurance)
  const healthAllowed = Math.min(clamp(healthInsurance), DEDUCTION_LIMITS.healthInsurance)

  return {
    contributesSSF,
    retirementContrib,
    retirementAllowed,
    retirementCeiling: ceiling,
    retirementCapped: retirementAllowed < retirementContrib,
    lifeAllowed,
    lifeCapped: lifeAllowed < clamp(lifeInsurance),
    healthAllowed,
    healthCapped: healthAllowed < clamp(healthInsurance),
    total: retirementAllowed + lifeAllowed + healthAllowed,
  }
}

/**
 * Compute Nepal income tax.
 *
 * @param {object} opts
 * @param {number} opts.annualIncome   Gross annual income (NPR)
 * @param {number} opts.deductions     Total deductions (EPF/CIT/SSF, insurance, donations)
 * @param {'single'|'married'} opts.status   Filing status
 * @param {boolean} opts.ssfExempt     If true, the first band's 1% SST is waived
 * @param {string} opts.year           Key into TAX_YEARS
 * @returns {{
 *   taxableIncome: number,
 *   totalTax: number,
 *   effectiveRate: number,
 *   breakdown: Array<{label:string, rate:number, taxedAmount:number, tax:number}>
 * }}
 */
export function calculateTax({
  annualIncome,
  deductions = 0,
  status = 'single',
  ssfExempt = false,
  year = DEFAULT_YEAR,
}) {
  const gross = clamp(annualIncome)
  const ded = Math.min(clamp(deductions), gross)
  const taxableIncome = Math.max(0, gross - ded)

  const yearDef = TAX_YEARS[year] ?? TAX_YEARS[DEFAULT_YEAR]
  const slabs = yearDef.slabs[status] ?? yearDef.slabs.single

  let remaining = taxableIncome
  let totalTax = 0
  const breakdown = []

  slabs.forEach((slab, i) => {
    if (remaining <= 0) return
    const taxedAmount = Math.min(remaining, slab.size)
    // Waive the 1% Social Security Tax on the first band when exempt.
    const rate = i === 0 && ssfExempt ? 0 : slab.rate
    const tax = taxedAmount * rate
    breakdown.push({ label: slab.label, rate, taxedAmount, tax })
    totalTax += tax
    remaining -= taxedAmount
  })

  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0

  return { taxableIncome, totalTax, effectiveRate, breakdown }
}

export const formatNPR = (n) =>
  'Rs ' + Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
