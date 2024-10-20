import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router components
import './App.css';
import HomePage from './HomePage';
import Teacher from './components/Teacher';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes for different pages/components */}
        <Route path="/" element={<HomePage />} /> {/* Home Page route */}
        <Route path="/teacher" element={<Teacher />} /> {/* Teacher Page route */}
      </Routes>
    </Router>

  );
}

export default App;
