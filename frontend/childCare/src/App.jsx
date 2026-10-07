import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import Children from './pages/Children'
import Parents from './pages/Parents'
import Staff from './pages/Staff'
import Meals from './pages/Meals'
import ParentChildren from './pages/ParentChildren'
import AboutUs from './pages/AboutUs'


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
          <Route path="/parent-children" element={<ParentChildren />} />
          <Route path="/aboutus" element={<AboutUs/>}/>
        </Routes>
      </main>
      </BrowserRouter>
  )
}

export default App
