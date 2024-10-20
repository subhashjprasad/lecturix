import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react"; // Assuming you're using Auth0 for authentication

const DottedJoinButton = () => {
  const { user } = useAuth0(); // Get the authenticated user info
  const [isModalOpen, setModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState(""); // Store the join code entered by the user
  const [error, setError] = useState(null); // Store any errors
  const [successMessage, setSuccessMessage] = useState(null); // Store success messages

  // Handle opening and closing the modal
  const toggleModal = () => setModalOpen((prev) => !prev);

  // Handle form input changes
  const handleChange = (e) => {
    const { value } = e.target;
    setJoinCode(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      setError("You must be logged in to join a class.");
      return;
    }

    try {
      const response = await fetch("https://lecturix.onrender.com/join_course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email, // User email
          join_code: joinCode, // The join code entered by the user
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join the course");
      }

      const result = await response.json();
      setSuccessMessage(result.message || "Successfully joined the class!");
      setError(null); // Clear any errors
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null); // Clear any success messages
    }

    // Close modal after submitting
    toggleModal();
  };

  return (
    <div className="relative">
      {/* Join Class Button */}
      <button
        onClick={toggleModal}
        className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
      >
        Join Class
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">Enter Class Code</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Enter the 6-digit course code
                </label>
                <input
                  type="text"
                  name="join_code"
                  value={joinCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition duration-300"
                >
                  Join Class
                </button>
              </div>
            </form>

            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
    </div>
  );
};

export default DottedJoinButton;
