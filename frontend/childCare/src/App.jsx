
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
import ChildrenAttendance from './pages/ChildrenAttendance'
import StaffAttendance from './pages/StaffAttendance'
import DietaryNeeds from './pages/DietaryNeeds'
import AuthPage from './pages/AuthPage'

function DashboardLayout() {
  return (
    <>
      <Sidebar />

      <main>
        <Header />
        <div className="main-div">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/children" element={<Children />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/parent-children" element={<ParentChildren />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/children/:id" element={<ChildDetails />} />
            <Route path="/childrenAttendance" element={<ChildrenAttendance />} />
            <Route path="/staffAttendance" element={<StaffAttendance />} />
            <Route path="/dietary-needs" element={<DietaryNeeds />} />
          </Routes>
        </div>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/*" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App