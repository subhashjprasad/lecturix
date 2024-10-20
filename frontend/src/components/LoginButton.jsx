import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import EncryptButton from "./EncryptButton";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0(); // Access Auth0 user and authentication state
  const [role, setRole] = useState("Student"); // Default role

  // Function to check if the user exists in the database and add them if they do not
  const checkAndAddUser = async (email, name, role) => {
    try {
      // Check if the user already exists in the DB
      const response = await fetch(`https://lecturix.onrender.com/get_user_by_email?email=${email}`);
      const data = await response.json();

      if (response.ok && data.user_id) {
        console.log("User exists:", data);
      } else {
        // If the user does not exist, add them to the DB based on role
        const addUserEndpoint = role === "Student" ? "https://lecturix.onrender.com/add_student" : "https://lecturix.onrender.com/add_teacher";
        
        const addUserResponse = await fetch(addUserEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            courses: [], // You can adjust this based on your app logic
          }),
        });

        if (addUserResponse.ok) {
          console.log(`${role} added successfully!`);
        } else {
          console.error(`Failed to add ${role}:`, await addUserResponse.json());
        }
      }
    } catch (error) {
      console.error("Error checking/adding user:", error);
    }
  };

  // Automatically check and add user to DB if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const email = user.email;
      const name = user.name;

      // Call the backend to check and add the user if needed
      checkAndAddUser(email, name, role);
    }
  }, [isAuthenticated, user, role]);

  // Handle the button click for login with role
  const handleClick = () => {
    const redirectUri =
      role === "Teacher" ? `${window.location.origin}/teacher` : `${window.location.origin}/student`;

    loginWithRedirect({
      redirectUri,
      appState: { role }, // Pass role if needed
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
