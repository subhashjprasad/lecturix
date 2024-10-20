import React, { useState, useCallback } from "react";
import { FiUpload } from "react-icons/fi";

const CreateClass = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    folder: "",
    file: null, // Change to hold a single file
  });

  // Handle opening and closing the modal
  const toggleModal = () => setModalOpen((prev) => !prev);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      // Set the file to the state
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
    // Process formData here (e.g., send to API or update state)
    console.log(formData);
    toggleModal(); // Close modal after submitting
  };

  return (
    <div className="relative">
      {/* Upload Button */}
      <button onClick={toggleModal} className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
        Create Class
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">Create Class</h2>

            <form onSubmit={handleSubmit}>
              {/* Video Title */}
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

                {/* Video Title */}
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Enter a 6 digit number below to create class</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
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
                  Create Class
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
