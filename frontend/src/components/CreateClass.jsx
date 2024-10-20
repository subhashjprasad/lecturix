import React, { useState, useCallback } from "react";
import { FiUpload } from "react-icons/fi";
import { useAuth0 } from "@auth0/auth0-react"; // Assuming you use Auth0 for user data

const CreateClass = () => {
  const { user } = useAuth0(); // Get the authenticated user info (e.g., professor email)
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    join_code: "",
    professor: user?.name || "", // Assuming the user is a professor, set the email
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle opening and closing the modal
  const toggleModal = () => setModalOpen((prev) => !prev);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send formData to the backend API to create the class
      fetch("https://lecturix.onrender.com/create_course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_name: formData.title,
          join_code: formData.join_code,
          professor: formData.professor,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to create class");
          }
          // Return the response to allow chaining to the next .then()
          return response.json();
        })
        .then((data) => {
          console.log("Course created:", data);
          // Second fetch: Join the user to the course
          return fetch("https://lecturix.onrender.com/join_course", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email, // Assuming user.email is available from Auth0 or other auth logic
              join_code: formData.join_code,
            }),
          });
        })
        .then((res2) => {
          if (!res2.ok) {
            throw new Error("Failed to join the course");
          }
          return res2.json();
        })
        .then((res2Data) => {
          console.log("Successfully joined course:", res2Data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });

      const data = await response.json();
      console.log("Class created successfully:", data);
      toggleModal(); // Close modal after success
    } catch (error) {
      setError("Error creating class. Please try again.");
      console.error("Error creating class:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Create Class Button */}
      <button
        onClick={toggleModal}
        className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
      >
        Create Class
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">Create Class</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
              {/* Class Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Enter class name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Join Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Enter a 6-digit join code</label>
                <input
                  type="text"
                  name="join_code"
                  value={formData.join_code}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  maxLength="6"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition duration-300"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Class"}
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
    </div>
  );
};

export default CreateClass;
