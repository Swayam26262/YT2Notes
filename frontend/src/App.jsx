import React from "react"
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Register from "./pages/Register"
import Login from "./pages/Login.jsx"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import GenerateNotesPage from "./pages/GenerateNotesPage"
import NotesListPage from "./pages/NotesListPage"
import NoteDetailPage from "./pages/NoteDetailPage"
import { ThemeProvider } from './context/ThemeContext'



function Logout(){
  localStorage.clear()
  return <Navigate to= "/login" />
}

function RegisterAndLogout(){
  localStorage.clear()
  return <Register />
}

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <ProtectedRoute> <Home/> </ProtectedRoute>} />
          <Route path="/login" element= { <Login /> }/>
          <Route path="/logout" element= { <Logout /> }/>
          <Route path="/register" element= { <RegisterAndLogout />}/>
          <Route path="/forgot-password" element={ <ForgotPassword /> }/>
          <Route path="/reset-password/:uid/:token" element={ <ResetPassword /> }/>
          <Route path="/generate" element={ <Navigate to="/" replace /> } />
          <Route path="/notes" element={ <ProtectedRoute> <NotesListPage /> </ProtectedRoute>} />
          <Route path="/notes/:id" element={ <ProtectedRoute> <NoteDetailPage /> </ProtectedRoute>} />
          <Route path="*" element={ <NotFound /> }/>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
