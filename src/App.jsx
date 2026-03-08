import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import CompoundCalculator from './components/CompoundCalculator'
import EndGoalCalculator from './components/EndGoalCalculator'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="brand">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="3 18 9 12 13 16 21 8" stroke="#1e72ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="15 8 21 8 21 14" stroke="#1e72ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="brand-text">
              <span className="brand-name">COMPOUND</span>
              <span className="brand-sub">Investment Calculator</span>
            </div>
          </div>
          <nav className="nav-tabs">
            <NavLink to="/" end className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
              Investment Simulator
            </NavLink>
            <NavLink to="/end-goal" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
              End Goal Planner
            </NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<CompoundCalculator />} />
            <Route path="/end-goal" element={<EndGoalCalculator />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>COMPOUND INVESTMENT CALCULATOR</p>
          <p>All projections are for illustrative purposes only.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
