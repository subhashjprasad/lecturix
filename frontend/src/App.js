import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router components
import './App.css';
import HomePage from './HomePage';
import Teacher from './components/Teacher';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import LecVids from './components/LecVids.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes for different pages/components */}
        <Route path="/" element={<HomePage />} /> {/* Home Page route */}
        <Route path="/teacher" element={<ProtectedRoute element={<Teacher />} />} /> {/* Protected Teacher Page route */}
        <Route path="/lecvids" element={<LecVids />} />
      </Routes>
    </Router>
    //<Videos />
  );
}

export default App;

// import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import './App.css';
// import HomePage from './HomePage';
// import Teacher from './components/Teacher';
// import ProtectedRoute from './components/ProtectedRoute';
// import LecVids from './components/LecVids.jsx';

// function App() {
//   const [folderClicked, setFolderClicked] = useState(false); // State to track folder click

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         {/* Passing setFolderClicked as prop to Teacher to handle folder clicks */}
//         <Route path="/teacher" 
//           element={
//             <ProtectedRoute 
//               element={<Teacher setFolderClicked={setFolderClicked} />} 
//             />
//           } 
//         />
//         {/* Protect LecVids route based on folder click and authentication */}
//         <Route path="/lecvids" 
//           element={
//             <ProtectedRoute 
//               element={<LecVids />} 
//               condition={folderClicked} // Pass folderClicked as a condition
//               redirectTo="/teacher" // Redirect to teacher page if folder not clicked
//             />
//           } 
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
