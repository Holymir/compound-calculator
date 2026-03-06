import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './EndGoalCalculator.css'

function EndGoalCalculator() {
  const [targetAmount, setTargetAmount] = useState(100000)
  const [initialAmount, setInitialAmount] = useState(5000)
  const [apy, setApy] = useState(8)
  const [timeframe, setTimeframe] = useState(10)
  const [calculationMode, setCalculationMode] = useState('contribution') // 'contribution', 'time', 'rate'
  const [result, setResult] = useState(null)
  const [breakdown, setBreakdown] = useState([])

  useEffect(() => {
    calculateGoal()
  }, [targetAmount, initialAmount, apy, timeframe, calculationMode])

  const calculateGoal = () => {
    const r = apy / 100
    const n = 12 // monthly compounding

    if (calculationMode === 'contribution') {
      // Calculate required monthly contribution
      const months = timeframe * 12
      const futureValueOfInitial = initialAmount * Math.pow(1 + r/n, months)
      const remainingAmount = targetAmount - futureValueOfInitial

      if (remainingAmount <= 0) {
        setResult({
          type: 'contribution',
          value: 0,
          message: 'Your initial investment will reach your goal!',
          details: `With compound interest, your ${formatCurrency(initialAmount)} will grow to ${formatCurrency(futureValueOfInitial)} in ${timeframe} years.`
        })
        generateBreakdown(0, months)
      } else {
        // PMT formula for annuity
        const monthlyRate = r / n
        const monthlyContribution = (remainingAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)

        setResult({
          type: 'contribution',
          value: monthlyContribution,
          message: `You need to contribute ${formatCurrency(monthlyContribution)} per month`,
          details: `Total contributions: ${formatCurrency(monthlyContribution * months + initialAmount)}`
        })
        generateBreakdown(monthlyContribution, months)
      }
    } else if (calculationMode === 'time') {
      // Calculate required time with current inputs
      // We'll use the targetAmount and see how long it takes with a fixed monthly contribution
      const monthlyContribution = 500 // default for time calculation

      let balance = initialAmount
      let month = 0
      const maxMonths = 50 * 12 // cap at 50 years

      while (balance < targetAmount && month < maxMonths) {
        month++
        balance = balance * (1 + r/n) + monthlyContribution
      }

      const yearsNeeded = month / 12

      setResult({
        type: 'time',
        value: yearsNeeded,
        message: `You'll reach your goal in ${yearsNeeded.toFixed(1)} years`,
        details: `Contributing ${formatCurrency(monthlyContribution)} per month at ${apy}% APY`
      })
      generateBreakdown(monthlyContribution, month)
    } else if (calculationMode === 'rate') {
      // Calculate required rate of return
      const months = timeframe * 12
      const monthlyContribution = 500 // default for rate calculation

      // Binary search for the required rate
      let low = 0
      let high = 50 // max 50% APY
      let requiredAPY = 0
      const tolerance = 0.01

      for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2
        const testRate = mid / 100 / 12

        let balance = initialAmount
        for (let m = 1; m <= months; m++) {
          balance = balance * (1 + testRate) + monthlyContribution
        }

        if (Math.abs(balance - targetAmount) < tolerance) {
          requiredAPY = mid
          break
        }

        if (balance < targetAmount) {
          low = mid
        } else {
          high = mid
        }

        requiredAPY = mid
      }

      setResult({
        type: 'rate',
        value: requiredAPY,
        message: `You need a ${requiredAPY.toFixed(2)}% annual return`,
        details: `Contributing ${formatCurrency(500)} per month for ${timeframe} years`
      })
      generateBreakdown(500, months, requiredAPY)
    }
  }

  const generateBreakdown = (monthlyContribution, totalMonths, customAPY = null) => {
    const r = (customAPY || apy) / 100
    const n = 12
    const data = []

    let balance = initialAmount
    let totalContributions = initialAmount

    const years = Math.ceil(totalMonths / 12)

    for (let year = 0; year <= years; year++) {
      const monthsThisYear = Math.min((year + 1) * 12, totalMonths)

      for (let m = year * 12 + 1; m <= monthsThisYear; m++) {
        balance = balance * (1 + r/n) + monthlyContribution
        totalContributions += monthlyContribution
      }

      if (year === 0) {
        data.push({
          year: 0,
          balance: Math.round(initialAmount),
          contributions: Math.round(initialAmount),
          interest: 0
        })
      } else {
        data.push({
          year: year,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          interest: Math.round(balance - totalContributions)
        })
      }
    }

    setBreakdown(data)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">Year {payload[0].payload.year}</p>
          <p className="balance">Balance: {formatCurrency(payload[0].payload.balance)}</p>
          <p className="contributions">Contributions: {formatCurrency(payload[0].payload.contributions)}</p>
          <p className="interest">Interest: {formatCurrency(payload[0].payload.interest)}</p>
        </div>
      )
    }
    return null
  }

  const pieData = breakdown.length > 0 ? [
    { name: 'Contributions', value: breakdown[breakdown.length - 1].contributions },
    { name: 'Interest', value: breakdown[breakdown.length - 1].interest }
  ] : []

  const COLORS = ['#8b5cf6', '#10b981']

  return (
    <div className="calculator-container">
      <div className="calculator-grid">
        <div className="inputs-section">
          <h2>Goal Planning</h2>

          <div className="input-group">
            <label>
              <span>What do you want to calculate?</span>
            </label>
            <select
              value={calculationMode}
              onChange={(e) => setCalculationMode(e.target.value)}
              className="select-input mode-select"
            >
              <option value="contribution">Required Monthly Contribution</option>
              <option value="time">Time to Reach Goal</option>
              <option value="rate">Required Rate of Return</option>
            </select>
          </div>

          <div className="input-group">
            <label>
              <span>Target Amount</span>
              <span className="value">{formatCurrency(targetAmount)}</span>
            </label>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="number-input"
            />
          </div>

          <div className="input-group">
            <label>
              <span>Initial Investment</span>
              <span className="value">{formatCurrency(initialAmount)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
            />
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="number-input"
            />
          </div>

          {calculationMode !== 'rate' && (
            <div className="input-group">
              <label>
                <span>Expected APY</span>
                <span className="value">{apy}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="300"
                step="0.1"
                value={apy}
                onChange={(e) => setApy(Number(e.target.value))}
              />
              <input
                type="number"
                step="0.1"
                value={apy}
                onChange={(e) => setApy(Number(e.target.value))}
                className="number-input"
              />
            </div>
          )}

          {calculationMode !== 'time' && (
            <div className="input-group">
              <label>
                <span>Timeframe</span>
                <span className="value">{timeframe} {timeframe === 1 ? 'year' : 'years'}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
              />
              <input
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
                className="number-input"
              />
            </div>
          )}

          <div className="info-box">
            <h3>Planning Tips</h3>
            <ul>
              <li>Set realistic target amounts based on your needs</li>
              <li>Conservative APY: 5-7% (bonds, safe investments)</li>
              <li>Moderate APY: 8-10% (stock market average)</li>
              <li>Aggressive APY: 11%+ (high-risk investments)</li>
              <li>Starting early amplifies the power of compound interest</li>
            </ul>
          </div>
        </div>

        <div className="results-section">
          <h2>Results</h2>

          {result && (
            <div className="result-card">
              <div className="result-main">
                <h3>{result.message}</h3>
                {result.type === 'contribution' && result.value > 0 && (
                  <p className="result-value">{formatCurrency(result.value)}/month</p>
                )}
                {result.type === 'time' && (
                  <p className="result-value">{result.value.toFixed(1)} years</p>
                )}
                {result.type === 'rate' && (
                  <p className="result-value">{result.value.toFixed(2)}% APY</p>
                )}
                <p className="result-details">{result.details}</p>
              </div>
            </div>
          )}

          {breakdown.length > 0 && (
            <>
              <div className="summary-grid">
                <div className="summary-card">
                  <h4>Final Balance</h4>
                  <p className="amount">{formatCurrency(breakdown[breakdown.length - 1].balance)}</p>
                </div>
                <div className="summary-card">
                  <h4>Total Contributions</h4>
                  <p className="amount">{formatCurrency(breakdown[breakdown.length - 1].contributions)}</p>
                </div>
                <div className="summary-card success">
                  <h4>Interest Earned</h4>
                  <p className="amount">{formatCurrency(breakdown[breakdown.length - 1].interest)}</p>
                </div>
              </div>

              <div className="chart-container">
                <h3>Growth Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="year"
                      stroke="#9ca3af"
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Total Balance"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="contributions"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Contributions"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="charts-row">
                <div className="chart-container half">
                  <h3>Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container half">
                  <h3>Year-by-Year Growth</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={formatYAxis} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="interest" fill="#10b981" name="Interest" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EndGoalCalculator
