import { Link } from 'react-router-dom'
import { useData } from '../data'
import { useStore } from '../storage'

export default function Home() {
  const { all } = useData()
  const { stats, exams } = useStore()
  const seen = Object.keys(stats).length
  const mastered = Object.values(stats).filter((s) => s.lastCorrect && s.box >= 3).length
  const last5 = exams.slice(0, 5)
  const passes = last5.filter((e) => e.passed).length
  return (
    <div className="page">
      <h1>🚗 DriveReady</h1>
      <p className="sub">German driving theory · Class B</p>
      <div className="stat"><b>{seen}</b>/{all.length}<small>questions seen</small>
        <div className="bar"><div style={{ width: `${(seen / all.length) * 100}%` }} /></div></div>
      <div className="stat"><b>{mastered}</b>/{all.length}<small>mastered (answered right 3×)</small>
        <div className="bar green"><div style={{ width: `${(mastered / all.length) * 100}%` }} /></div></div>
      <div className="stat"><b>{last5.length ? `${passes}/${last5.length}` : '–'}</b><small>last mock exams passed</small></div>
      <div className="actions col">
        <Link className="btn primary big" to="/exam">Start mock exam</Link>
        <Link className="btn big" to="/practice/new">Practice new questions</Link>
        <Link className="btn big" to="/practice/weak">Review weak questions</Link>
      </div>
    </div>
  )
}
