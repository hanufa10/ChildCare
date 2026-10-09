import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Dashboard from './pages/Dashboard'
import Children from './pages/Children'
import Parents from './pages/Parents'
import Staff from './pages/Staff'
import Meals from './pages/Meals'
import ParentChildren from './pages/ParentChildren'
import AboutUs from './pages/AboutUs'
import Registration from './pages/Registration'
import ChildDetails from './pages/ChildDetails'


function App() {
  return (
      <BrowserRouter>
        <Sidebar />

      <main>
        <Header />
        <div className='main-div'>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/children" element={<Children />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/parent-children" element={<ParentChildren />} />
          <Route path="/aboutus" element={<AboutUs/>}/>
          <Route path='/registration' element={<Registration/>}/>
          <Route path="/children/:id" element={<ChildDetails />} />
        </Routes>
        </div>
      </main>
      </BrowserRouter>
  )
}

export default App
