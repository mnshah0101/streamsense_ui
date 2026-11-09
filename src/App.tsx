import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import AlertsSidebar from './components/AlertsSidebar'
import Home from './pages/Home'
import MatchAnalysis from './pages/MatchAnalysis'
import TestStream from './pages/TestStream'
import ModelPerformance from './pages/ModelPerformance'
import { useStore } from './store'

export default function App() {
  const { sidebarOpen } = useStore()
  return (
    <div className="min-h-full">
      <Nav />
      <main className={`px-6 py-6 ${sidebarOpen ? 'pr-[444px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games/:id" element={<MatchAnalysis />} />
          <Route path="/test" element={<TestStream />} />
          <Route path="/performance" element={<ModelPerformance />} />
        </Routes>
      </main>
      <AlertsSidebar />
    </div>
  )
}
