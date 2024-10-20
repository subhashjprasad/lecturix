

import React, { useEffect, useState } from "react";
import { FiCreditCard, FiMail, FiUser, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const HoverDevCards = () => {
    const [cardData, setCardData] = useState([{'id': 1,'title': "ICS 33", 'code': "123456"}, {'id': 2,'title': "ICS 45C", 'code': "234233"}]);
    return (
        <div className="p-4">
          <p className="text-xl font-semibold mb-2">Classes</p>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Step 2: Use .map() to dynamically generate cards */}
            {cardData.map((card, index) => (
              <Card
                key={index}
                title={card.title}
                Icon={FiCreditCard}  
                code={card.code}
                id={card.id}
            />
            ))}
          </div>
        </div>
      );
};

const Card = ({ title, Icon, code, id}) => {
    let navigate = useNavigate()
  return (
    <button
      className="w-full p-4 rounded border-[1px] border-slate-300 relative overflow-hidden group bg-white"
      onClick={() => {navigate(`/lectures/${id}`, { state: { title, code } })}}
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