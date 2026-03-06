import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './CompoundCalculator.css'

function CompoundCalculator() {
  const [initialAmount, setInitialAmount] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [apy, setApy] = useState(8)
  const [years, setYears] = useState(10)
  const [compoundFrequency, setCompoundFrequency] = useState('monthly')
  const [chartData, setChartData] = useState([])
  const [summary, setSummary] = useState({
    finalAmount: 0,
    totalContributions: 0,
    totalInterest: 0,
    effectiveRate: 0
  })

  useEffect(() => {
    calculateCompound()
  }, [initialAmount, monthlyContribution, apy, years, compoundFrequency])

  const getCompoundingPeriodsPerYear = () => {
    const frequencies = {
      'daily': 365,
      'weekly': 52,
      'monthly': 12,
      'quarterly': 4,
      'annually': 1
    }
    return frequencies[compoundFrequency]
  }

  const calculateCompound = () => {
    const n = getCompoundingPeriodsPerYear()
    const r = apy / 100
    const totalPeriods = years * 12
    const data = []

    let balance = initialAmount
    let totalContributed = initialAmount

    for (let month = 0; month <= totalPeriods; month++) {
      if (month > 0) {
        balance += monthlyContribution
        totalContributed += monthlyContribution
      }

      if (month > 0) {
        const monthlyRate = r / n
        const periodsInMonth = n / 12
        balance = balance * Math.pow(1 + monthlyRate, periodsInMonth)
      }

      if (month === 0 || month === totalPeriods || month % 3 === 0) {
        data.push({
          year: (month / 12).toFixed(1),
          balance: Math.round(balance),
          contributions: Math.round(totalContributed),
          interest: Math.round(balance - totalContributed)
        })
      }
    }

    const totalInterest = balance - totalContributed
    const effectiveRate = ((Math.pow(1 + r / n, n) - 1) * 100).toFixed(2)

    setSummary({
      finalAmount: balance,
      totalContributions: totalContributed,
      totalInterest,
      effectiveRate
    })
    setChartData(data)
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)

  const formatYAxis = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value || 0))

  const sliderStyle = (value, min, max) => ({
    background: `linear-gradient(to right, var(--accent) ${((value - min) / (max - min)) * 100}%, var(--border) ${((value - min) / (max - min)) * 100}%)`
  })

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="custom-tooltip">
        <p className="label">Year {d.year}</p>
        <p className="balance">Balance: {formatCurrency(d.balance)}</p>
        <p className="contributions">Invested: {formatCurrency(d.contributions)}</p>
        <p className="interest">Interest: {formatCurrency(d.interest)}</p>
      </div>
    )
  }

  const returnPct = summary.totalContributions > 0
    ? ((summary.totalInterest / summary.totalContributions) * 100).toFixed(1)
    : '0.0'

  const axisProps = {
    tick: { fill: '#6888a8', fontSize: 11 },
    tickLine: false,
  }

  return (
    <div className="calculator-container">

      {/* ── Parameters ── */}
      <div className="inputs-section">
        <div className="panel-header">
          <span className="panel-title">Parameters</span>
          <select
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(e.target.value)}
            className="header-select"
          >
            <option value="daily">Daily compounding</option>
            <option value="weekly">Weekly compounding</option>
            <option value="monthly">Monthly compounding</option>
            <option value="quarterly">Quarterly compounding</option>
            <option value="annually">Annual compounding</option>
          </select>
        </div>
        <div className="inputs-grid">

          <div className="input-group">
            <div className="input-label-row">
              <span className="input-name">Initial Investment</span>
              <span className="input-value">{formatCurrency(initialAmount)}</span>
            </div>
            <input
              type="range" min="0" max="100000" step="1000"
              value={initialAmount}
              style={sliderStyle(initialAmount, 0, 100000)}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
            />
            <input
              type="number" value={initialAmount} min="0" max="10000000"
              onChange={(e) => setInitialAmount(clamp(Number(e.target.value), 0, 10_000_000))}
              className="number-input"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <span className="input-name">Monthly Contribution</span>
              <span className="input-value">{formatCurrency(monthlyContribution)}</span>
            </div>
            <input
              type="range" min="0" max="5000" step="100"
              value={monthlyContribution}
              style={sliderStyle(monthlyContribution, 0, 5000)}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            />
            <input
              type="number" value={monthlyContribution} min="0" max="1000000"
              onChange={(e) => setMonthlyContribution(clamp(Number(e.target.value), 0, 1_000_000))}
              className="number-input"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <span className="input-name">Annual Return (APY)</span>
              <span className="input-value">{apy}%</span>
            </div>
            <input
              type="range" min="0" max="300" step="0.1"
              value={apy}
              style={sliderStyle(apy, 0, 300)}
              onChange={(e) => setApy(Number(e.target.value))}
            />
            <input
              type="number" step="0.1" value={apy} min="0" max="300"
              onChange={(e) => setApy(clamp(Number(e.target.value), 0, 300))}
              className="number-input"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <span className="input-name">Investment Period</span>
              <span className="input-value">{years} {years === 1 ? 'yr' : 'yrs'}</span>
            </div>
            <input
              type="range" min="1" max="50" step="1"
              value={years}
              style={sliderStyle(years, 1, 50)}
              onChange={(e) => setYears(Number(e.target.value))}
            />
            <input
              type="number" value={years} min="1" max="100"
              onChange={(e) => setYears(clamp(Number(e.target.value), 1, 100))}
              className="number-input"
            />
          </div>

        </div>
      </div>

      {/* ── KPI Bar ── */}
      <div className="kpi-bar">
        <div className="kpi-item kpi-primary">
          <span className="kpi-label">Final Balance</span>
          <span className="kpi-value">{formatCurrency(summary.finalAmount)}</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Total Invested</span>
          <span className="kpi-value">{formatCurrency(summary.totalContributions)}</span>
        </div>
        <div className="kpi-item kpi-positive">
          <span className="kpi-label">Interest Earned</span>
          <span className="kpi-value">{formatCurrency(summary.totalInterest)}</span>
          <span className="kpi-sub">+{returnPct}% on invested</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Effective Annual Rate</span>
          <span className="kpi-value">{summary.effectiveRate}%</span>
          <span className="kpi-sub">{compoundFrequency} compounding</span>
        </div>
      </div>

      {/* ── Portfolio Growth ── */}
      <div className="chart-panel">
        <div className="chart-header">
          <span className="chart-title">Portfolio Growth</span>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e72ff" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#1e72ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="fillContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d5570" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#3d5570" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#112038" vertical={false} />
              <XAxis dataKey="year" {...axisProps} axisLine={{ stroke: '#18304f' }}
                label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#3d5570', fontSize: 10 }}
              />
              <YAxis {...axisProps} axisLine={false} tickFormatter={formatYAxis} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#6888a8' }} />
              <Area type="monotone" dataKey="contributions" stroke="#3d5570" strokeWidth={1.5}
                fill="url(#fillContributions)" name="Invested Capital" />
              <Area type="monotone" dataKey="balance" stroke="#1e72ff" strokeWidth={2}
                fill="url(#fillBalance)" name="Total Balance" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Interest Breakdown ── */}
      <div className="chart-panel">
        <div className="chart-header">
          <span className="chart-title">Interest vs. Invested Capital</span>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#112038" vertical={false} />
              <XAxis dataKey="year" {...axisProps} axisLine={{ stroke: '#18304f' }}
                label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#3d5570', fontSize: 10 }}
              />
              <YAxis {...axisProps} axisLine={false} tickFormatter={formatYAxis} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#6888a8' }} />
              <Line type="monotone" dataKey="contributions" stroke="#4d6480" strokeWidth={1.5}
                name="Invested Capital" dot={false} />
              <Line type="monotone" dataKey="interest" stroke="#00b87a" strokeWidth={2}
                name="Interest Earned" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}

export default CompoundCalculator
