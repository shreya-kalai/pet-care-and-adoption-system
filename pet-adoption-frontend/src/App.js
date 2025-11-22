import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Pets from './pages/Pets';
import Gallery from './pages/Gallery';
import Grooming from './pages/Grooming';
import Vet from './pages/Vet';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pawpeach">
        <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pawpink">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <div className="text-2xl">🐾</div>
            <NavLink to="/" className="px-3 py-1 rounded hover:bg-pawpeach">Home</NavLink>
            <NavLink to="/pets" className="px-3 py-1 rounded hover:bg-pawpeach">Pets</NavLink>
            <NavLink to="/gallery" className="px-3 py-1 rounded hover:bg-pawpeach">Gallery</NavLink>
            <NavLink to="/grooming" className="px-3 py-1 rounded hover:bg-pawpeach">Grooming</NavLink>
            <NavLink to="/vet" className="px-3 py-1 rounded hover:bg-pawpeach">Vet</NavLink>
            <NavLink to="/dashboard" className="ml-auto px-3 py-1 rounded bg-pawmint hover:opacity-90">Dashboard</NavLink>
            <NavLink to="/login" className="px-3 py-1 rounded bg-pawsky hover:opacity-90">Login</NavLink>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/grooming" element={<Grooming />} />
            <Route path="/vet" element={<Vet />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
