import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiVideo } from "react-icons/fi";
import Sidebar from "./RetractingSideBar";

const LectureVideos = () => {
  const location = useLocation();
  const { title, code } = location.state; // code is the course_id

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`https://lecturix.onrender.com/get_course_videos?course_id=${code}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course videos");
        }
        const data = await response.json();

        if (data.videos) {
          setVideos(data.videos); // Set the list of videos (IDs, names, descriptions)
        } else {
          throw new Error(data.message || "No videos found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [code]);

  const fetchVideoBlob = async (video_id) => {
    try {
      const response = await fetch(`https://lecturix.onrender.com/get_video_data?video_id=${video_id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video data");
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching video blob:", error);
      return null;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-3xl font-extrabold text-indigo-600 mb-6">
          {title} Lectures
        </h2>

        {loading ? (
          <p className="text-lg text-gray-500">Loading videos...</p>
        ) : error ? (
          <p className="text-lg text-red-500">Error: {error}</p>
        ) : videos.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video.video_id}
                video={video}
                fetchVideoBlob={fetchVideoBlob}
              />
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-500">No videos available for this class.</p>
        )}
      </div>
    </div>
  );
};

const VideoCard = ({ video, fetchVideoBlob }) => {
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const { video_id, name, description } = video;

  useEffect(() => {
    const getVideoBlob = async () => {
      const blobUrl = await fetchVideoBlob(video_id);
      setVideoBlobUrl(blobUrl);
    };
    getVideoBlob();
  }, [video_id, fetchVideoBlob]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        {videoBlobUrl ? (
          <video
            controls
            className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity duration-300"
          >
            <source src={videoBlobUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Loading video...</p>
        )}
        <div className="absolute inset-0 flex justify-center items-center bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FiVideo className="text-white text-6xl" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default LectureVideos;
