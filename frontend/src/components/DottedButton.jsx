import React, { useState, useEffect, useCallback } from "react";
import { FiUpload } from "react-icons/fi";
import { useAuth0 } from "@auth0/auth0-react"; // Assuming you're using Auth0 for authentication

const DottedButton = () => {
  const { user } = useAuth0(); // Get the authenticated user info
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    folder: "",
    file: null,
  });
  const [folders, setFolders] = useState([]); // State to store the list of folders (classes)
  const [loading, setLoading] = useState(true); // Loading state while fetching folders
  const [error, setError] = useState(null); // Error state

  // Fetch the user's courses (folders) from the backend
  const fetchFolders = async () => {
    try {
      const response = await fetch(`https://lecturix.onrender.com/get_user_courses?email=${user.email}`);
      const data = await response.json();

      if (response.ok) {
        setFolders(data.courses || []); // Assuming "courses" is the field that contains the list of classes
      } else {
        console.error("Error fetching folders:", data);
      }
    } catch (err) {
      console.error("Error fetching folders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Use effect to fetch the folders when the component mounts
  useEffect(() => {
    if (user && user.email) {
      fetchFolders(); // Fetch folders when user is available
    }
  }, [user]);

  // Handle opening and closing the modal
  const toggleModal = () => setModalOpen((prev) => !prev);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, file: files[0] })); // Only take the first file
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle drag-and-drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        setFormData((prev) => ({ ...prev, file: droppedFiles[0] })); // Only take the first file
      }
    },
    []
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Create a FormData object to send file and other form data
    const formDataToSend = new FormData();
    formDataToSend.append("course_id", formData.folder); // Assuming "folder" is the course_id
    formDataToSend.append("name", formData.title); // Video name
    formDataToSend.append("description", formData.description); // Video description
    if (formData.file) {
      formDataToSend.append("file", formData.file); // Add the uploaded file
    }
  
    // Make a POST request to your backend to generate the video
    fetch("https://lecturix.onrender.com/generate_lecture_video", {
      method: "POST",
      body: formDataToSend, // Send FormData as the request body
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to generate video");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Video generation started successfully:", data);
        // Handle success response, such as showing a message or redirecting the user
      })
      .catch((error) => {
        console.error("Error generating video:", error);
        // Handle error response
      });
  
    // Close modal after submitting
    toggleModal();
  };
  
  

  return (
    <div className="relative">
      {/* Upload Button */}
      <button
        onClick={toggleModal}
        className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
      >
        Upload File!
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>

            {loading ? (
              <p>Loading folders...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Video Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Video Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Video Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* Folder Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Select Class</label>
                  <select
                    name="folder"
                    value={formData.folder}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a class</option>
                    {/* Dynamically render folders (classes) */}
                    {folders.map((folder) => (
                      <option key={folder.course_id} value={folder.course_id}>
                        {folder.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload Section */}
                <div
                  className="mb-4 border-2 border-dashed border-gray-400 rounded-md p-4 text-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <p className="text-sm text-gray-500">Drag & drop a file here (PDF, TXT, JPG, PNG)</p>
                  <p className="text-sm text-gray-500">Or click to select a file</p>
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.txt,.jpg,.png"
                    onChange={handleChange}
                    className="mt-2"
                    style={{ display: "none" }} // Hide the input
                  />
                  <button
                    type="button"
                    onClick={() => document.querySelector('input[name="file"]').click()}
                    className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition duration-300"
                  >
                    Choose File
                  </button>
                </div>

                {/* Display Selected File Name */}
                {formData.file && (
                  <div className="mb-4 text-sm text-gray-700">
                    Selected file: {formData.file.name}
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition duration-300"
                  >
                    Upload
                  </button>
                </div>
              </form>
            )}

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

export default DottedButton;
