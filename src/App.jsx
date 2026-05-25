import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PartyDetail from './pages/PartyDetail';
import './App.css';

function App() {
  return (
    <Router basename="/nojo">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/party/:id" element={<PartyDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
