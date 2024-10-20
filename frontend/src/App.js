import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router components
import './App.css';
import HomePage from './HomePage';
import Teacher from './components/Teacher';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import LectureVideos from './components/LectureVideos.jsx';
import Student from './components/Student.jsx';
import AboutUs from './components/AboutUs.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes for different pages/components */}
        <Route path="/" element={<HomePage />} /> {/* Home Page route */}
        <Route path="/teacher" element={<ProtectedRoute element={<Teacher />} />} /> 
        <Route path="/lectures/:id" element={<ProtectedRoute element={<LectureVideos />} />} /> 
        <Route path="/student" element={<ProtectedRoute element={<Student />} />} /> 
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import './App.css';
// import HomePage from './HomePage';
// import Teacher from './components/Teacher'; // Check if Teacher.jsx has a default export
// import Student from './components/Student'; // Check if Student.jsx has a default export
// import ProtectedRoute from './components/ProtectedRoute'; // Check if ProtectedRoute.jsx has a default export
// import LectureVideos from './components/LectureVideos'; // Check if LectureVideos.jsx has a default export

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/teacher" element={<ProtectedRoute element={<Teacher />} />} />
//         <Route path="/student" element={<ProtectedRoute element={<Student />} />} />
//         <Route path="/lectures/:id" element={<ProtectedRoute element={<LectureVideos />} />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
