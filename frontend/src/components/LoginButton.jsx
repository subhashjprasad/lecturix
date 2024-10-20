import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import EncryptButton from "./EncryptButton";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  const [role, setRole] = useState("Student"); // Default role

  const handleClick = () => {
    // Set the redirectUri based on the selected role
    const redirectUri =
      role === "Teacher" ? `${window.location.origin}/teacher` : `${window.location.origin}/student`;

    loginWithRedirect({
      redirectUri,
      appState: { role }, // Pass the selected role if needed for future reference
    });
  };

  return (
    <div className="flex items-center space-x-2"> {/* Flex container for inline items */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="Student">Student</option>
        <option value="Teacher">Teacher</option>
      </select>
      <EncryptButton
        handleClick={handleClick}
        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 transition duration-200"
      />
    </div>
  );
};

export default LoginButton;



