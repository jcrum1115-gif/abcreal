import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Headers/Header'
import Login from './pages/Login'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import './App.css'
import Transactions from './pages/Transactions'

function App() {
  const [user, setUser] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData.username)
        setCustomerId(userData.id)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setCustomerId(null)
  }

  const handleLoginSuccess = (username, id) => {
    setUser(username)
    setCustomerId(id)
  }

  if (loading) {
    return <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><p>Loading…</p></main>
  }

  return (
    <BrowserRouter>
      {user ? (
        <>
          <Header username={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home customerId={customerId} />} />
            <Route path="/transactions" element={<Transactions customerId={customerId} />} />

            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
