import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import Children from './pages/Children'
import Parents from './pages/Parents'
import Staff from './pages/Staff'
import Meals from './pages/Meals'

function App() {
  return (
      <BrowserRouter>
        <Sidebar />

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/children" element={<Children />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/meals" element={<Meals />} />
        </Routes>
      </main>
      </BrowserRouter>
  )
}

export default App
