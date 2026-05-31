import { useMemo, useState } from 'react'
import {
  calculateTax,
  computeDeductions,
  formatNPR,
  TAX_YEARS,
  DEFAULT_YEAR,
} from './taxLogic.js'
import Backdrop from './Backdrop.jsx'

const PERIODS = {
  yearly: { label: 'Yearly', factor: 1 },
  monthly: { label: 'Monthly', factor: 12 },
}

const DEDUCTION_FIELDS = [
  { key: 'epf', label: 'EPF / Provident Fund' },
  { key: 'cit', label: 'CIT (Citizen Investment Trust)' },
  { key: 'ssf', label: 'SSF (Social Security Fund)' },
  { key: 'lifeInsurance', label: 'Life insurance premium' },
  { key: 'healthInsurance', label: 'Health insurance premium' },
]

export default function App() {
  const [income, setIncome] = useState('')
  const [ded, setDed] = useState({
    epf: '',
    cit: '',
    ssf: '',
    lifeInsurance: '',
    healthInsurance: '',
  })
  const [period, setPeriod] = useState('yearly')
  const [status, setStatus] = useState('single')
  const [year, setYear] = useState(DEFAULT_YEAR)

  const factor = PERIODS[period].factor
  const annualIncome = (parseFloat(income) || 0) * factor

  // Annualise each itemised deduction, then apply statutory caps.
  const deductionResult = useMemo(() => {
    const annual = (v) => (parseFloat(v) || 0) * factor
    return computeDeductions({
      epf: annual(ded.epf),
      cit: annual(ded.cit),
      ssf: annual(ded.ssf),
      lifeInsurance: annual(ded.lifeInsurance),
      healthInsurance: annual(ded.healthInsurance),
      assessableIncome: annualIncome,
    })
  }, [ded, factor, annualIncome])

  // SSF contributors are exempt from the 1% Social Security Tax.
  const ssfExempt = deductionResult.contributesSSF

  const result = useMemo(
    () =>
      calculateTax({
        annualIncome,
        deductions: deductionResult.total,
        status,
        ssfExempt,
        year,
      }),
    [annualIncome, deductionResult.total, status, ssfExempt, year],
  )

  // Cash actually leaving each paycheck = tax + retirement contributions deducted at source.
  const annualContrib = deductionResult.retirementContrib
  const takeHomeAnnual = Math.max(0, annualIncome - result.totalTax - annualContrib)
  const takeHomeMonthly = takeHomeAnnual / 12
  const hasInput = annualIncome > 0
  const yearDef = TAX_YEARS[year]

  const setDedField = (key, value) => setDed((d) => ({ ...d, [key]: value }))

  return (
    <div className="page">
      <Backdrop />
      <header className="header">
        <div className="flag-dot" aria-hidden />
        <div>
          <h1>Nepal Income Tax Calculator</h1>
          <p className="subtitle">Estimate your annual income tax across fiscal years</p>
        </div>
      </header>

      <main className="layout">
        <section className="card form-card">
          <label className="field">
            <span>Fiscal year</span>
            <div className="segmented">
              {Object.entries(TAX_YEARS).map(([key, def]) => (
                <button
                  key={key}
                  className={year === key ? 'seg active' : 'seg'}
                  onClick={() => setYear(key)}
                >
                  {key}
                  {def.badge && <em className="badge">{def.badge}</em>}
                </button>
              ))}
            </div>
          </label>

          <div className="segmented" role="tablist" aria-label="Period">
            {Object.entries(PERIODS).map(([key, { label }]) => (
              <button
                key={key}
                role="tab"
                aria-selected={period === key}
                className={period === key ? 'seg active' : 'seg'}
                onClick={() => setPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="field">
            <span>{PERIODS[period].label} income (NPR)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </label>

          <div className="field">
            <span>
              {PERIODS[period].label} deductions (NPR)
              <small> — statutory caps applied automatically</small>
            </span>
            <div className="ded-group">
              {DEDUCTION_FIELDS.map((f) => (
                <label key={f.key} className="ded-row">
                  <span>{f.label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
                    value={ded[f.key]}
                    onChange={(e) => setDedField(f.key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Filing status</span>
            <div className="segmented">
              <button
                className={status === 'single' ? 'seg active' : 'seg'}
                onClick={() => setStatus('single')}
              >
                Single
              </button>
              <button
                className={status === 'married' ? 'seg active' : 'seg'}
                onClick={() => setStatus('married')}
              >
                Married (couple)
              </button>
            </div>
            {status === 'married' && !yearDef.marriedDiffers && (
              <small className="warn">
                Married threshold not yet published for {year} — using the single-filer bands.
              </small>
            )}
          </div>

          {ssfExempt && (
            <p className="info">
              SSF contributor detected — the 1% Social Security Tax on the first band is waived.
            </p>
          )}
        </section>

        <section className="card result-card">
          {hasInput ? (
            <>
              <div className="headline">
                <div className="headline-tax">
                  <span className="muted">Total annual tax · {yearDef.label}</span>
                  <strong>{formatNPR(result.totalTax)}</strong>
                  <span className="muted">{formatNPR(result.totalTax / 12)} / month</span>
                </div>
                <div className="effective">
                  <span className="muted">Effective rate</span>
                  <strong>{(result.effectiveRate * 100).toFixed(2)}%</strong>
                </div>
              </div>

              <div className="takehome">
                <span className="muted">Monthly take-home in bank</span>
                <strong>{formatNPR(takeHomeMonthly)}</strong>
                <span className="muted">
                  {formatNPR(takeHomeAnnual)} / year · after tax &amp; fund contributions
                </span>
              </div>

              <div className="summary-grid">
                <SummaryRow label="Gross income (yearly)" value={formatNPR(annualIncome)} />
                <SummaryRow
                  label="Deductions allowed"
                  value={`− ${formatNPR(deductionResult.total)}`}
                />
                <SummaryRow label="Taxable income" value={formatNPR(result.taxableIncome)} />
                <SummaryRow label="Income tax" value={`− ${formatNPR(result.totalTax)}`} />
                <SummaryRow
                  label="Fund contributions (EPF/CIT/SSF)"
                  value={`− ${formatNPR(annualContrib)}`}
                />
                <SummaryRow
                  label="Annual take-home"
                  value={formatNPR(takeHomeAnnual)}
                  highlight
                />
              </div>

              {deductionResult.total > 0 && (
                <>
                  <h2 className="breakdown-title">Deductions applied (yearly)</h2>
                  <ul className="breakdown">
                    <DeductionRow
                      label="Retirement (EPF + CIT + SSF)"
                      allowed={deductionResult.retirementAllowed}
                      capped={deductionResult.retirementCapped}
                      note={`capped at ${formatNPR(deductionResult.retirementCeiling)} / ⅓ of income`}
                    />
                    <DeductionRow
                      label="Life insurance"
                      allowed={deductionResult.lifeAllowed}
                      capped={deductionResult.lifeCapped}
                      note="capped at Rs 40,000"
                    />
                    <DeductionRow
                      label="Health insurance"
                      allowed={deductionResult.healthAllowed}
                      capped={deductionResult.healthCapped}
                      note="capped at Rs 20,000"
                    />
                  </ul>
                </>
              )}

              <h2 className="breakdown-title">Slab breakdown</h2>
              <ul className="breakdown">
                {result.breakdown.map((b, i) => (
                  <li key={i}>
                    <div className="b-left">
                      <span className="b-label">{b.label}</span>
                      <span className="b-meta">
                        {(b.rate * 100).toFixed(0)}% on {formatNPR(b.taxedAmount)}
                      </span>
                    </div>
                    <span className="b-tax">{formatNPR(b.tax)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="empty">
              <div className="empty-icon">रू</div>
              <p>Enter your income to see the tax breakdown.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>{yearDef.note}</p>
        <p>For guidance only — verify with a tax professional or the Inland Revenue Department.</p>
        <p className="credits">
          Backdrop imagery via Wikimedia Commons:{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Mount Everest
          </a>{' '}
          © shrimpo1967 (CC BY-SA 2.0) ·{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:Tian_Tan_Buddha_Front_View.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Tian Tan Buddha
          </a>{' '}
          © Tessa Bury (CC BY 4.0) ·{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:New_Map_of_Nepal_District_and_Province.svg"
            target="_blank"
            rel="noreferrer"
          >
            New Map of Nepal
          </a>{' '}
          (Dept. of Survey, 2020)
        </p>
      </footer>
    </div>
  )
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className={highlight ? 'srow highlight' : 'srow'}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function DeductionRow({ label, allowed, capped, note }) {
  if (allowed <= 0 && !capped) return null
  return (
    <li>
      <div className="b-left">
        <span className="b-label">{label}</span>
        {capped && <span className="b-meta warn">{note}</span>}
      </div>
      <span className="b-tax">− {formatNPR(allowed)}</span>
    </li>
  )
}
