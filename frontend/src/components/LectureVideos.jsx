import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiVideo } from "react-icons/fi";
import Sidebar from "./RetractingSideBar";
const LectureVideos = () => {
  const location = useLocation();
  const { title, code } = location.state;

  const [videos, setVideos] = useState([
    { id: 1, title: "Test Video 1", blobUrl: "test1" },
    { id: 2, title: "Test Video 2", blobUrl: "test2" },
    { id: 3, title: "Test Video 1", blobUrl: "test1" },
    { id: 4, title: "Test Video 2", blobUrl: "test2" },
    { id: 5, title: "Test Video 1", blobUrl: "test1" },
    { id: 6, title: "Test Video 2", blobUrl: "test2" },
  ]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/videos/${code}`);
        const data = await response.json();

        const videoBlobs = data.map((video) => ({
          id: video.id,
          title: video.title,
          blobUrl: URL.createObjectURL(
            new Blob([video.blobData], { type: "video/mp4" })
          ),
        }));

        setVideos(videoBlobs);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [code]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-3xl font-extrabold text-indigo-600 mb-6">
          {title} Lectures
        </h2>

        {videos.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <video
                    controls
                    className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity duration-300"
                  >
                    <source src={video.blobUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 flex justify-center items-center bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiVideo className="text-white text-6xl" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500">Lecture Video</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-500">No videos available for this class.</p>
        )}
      </div>
    </div>
  );
};

export default LectureVideos;
