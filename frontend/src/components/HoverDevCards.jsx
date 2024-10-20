import React, { useEffect, useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react"; // Assuming you are using Auth0 for authentication

const HoverDevCards = () => {
  const { user, isAuthenticated } = useAuth0(); // Access Auth0 user and authentication state
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state

  // Fetch the user's current classes from the backend
  const fetchUserClasses = async () => {
    try {
      const response = await fetch(`https://lecturix.onrender.com/get_user_courses?email=${user.email}`);
      const data = await response.json();

      if (response.ok) {
        setCardData(data.courses || []); // Assuming "courses" is the field containing class data
      } else {
        console.error("Failed to fetch courses:", data);
      }
    } catch (error) {
      console.error("Error fetching user courses:", error);
    } finally {
      setLoading(false); // Stop loading after the fetch
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserClasses(); // Call the function once the user is authenticated
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return <div>Loading classes...</div>; // Show a loading indicator while fetching data
  }

  return (
    <div className="p-4">
      <p className="text-xl font-semibold mb-2">Classes</p>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Use .map() to dynamically generate cards */}
        {cardData.length > 0 ? (
          cardData.map((card, index) => (
            <Card
              key={index}
              title={card.course_name} // Use the course name
              Icon={FiCreditCard}
              code={card.join_code} // Assuming you have a course code or join code
              id={card.course_id} // Use course ID to navigate
            />
          ))
        ) : (
          <p>No classes found.</p>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, Icon, code, id }) => {
  let navigate = useNavigate();
  return (
    <button
      className="w-full p-4 rounded border-[1px] border-slate-300 relative overflow-hidden group bg-white"
      onClick={() => {
        navigate(`/lectures/${id}`, { state: { title, code } });
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />

      <Icon className="absolute z-10 -top-12 -right-12 text-9xl text-slate-100 group-hover:text-violet-400 group-hover:rotate-12 transition-transform duration-300" />
      <Icon className="mb-2 text-2xl text-violet-600 group-hover:text-white transition-colors relative z-10 duration-300" />
      <h3 className="font-medium text-lg text-slate-950 group-hover:text-white relative z-10 duration-300">
        {title}
      </h3>
      <p className="text-slate-400 group-hover:text-violet-200 relative z-10 duration-300">
        {code}
      </p>
    </button>
  );
};

export default HoverDevCards;
