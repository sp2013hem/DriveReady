import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Topics from './pages/Topics'
import Session from './pages/Session'
import Exam from './pages/Exam'
import Stats from './pages/Stats'
import Browse from './pages/Browse'

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/topics', label: 'Practice', icon: '📚' },
  { to: '/exam', label: 'Exam', icon: '⏱️' },
  { to: '/browse', label: 'Search', icon: '🔍' },
  { to: '/stats', label: 'Stats', icon: '📊' },
]

export default function App() {
  return (
    <div className="app">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/practice/:mode/:id?" element={<Session />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
      <nav className="tabbar">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
