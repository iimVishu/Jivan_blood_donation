"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";

type Donor = {
  _id: string;
  name: string;
  points: number;
  donationCount: number;
  bloodGroup: string;
};

export default function LeaderboardPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setDonors(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col">
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Donor Leaderboard</h1>
          <p className="text-lg text-gray-600">Celebrating our heroes who save lives</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-red-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8" />
              <span className="text-xl font-semibold">Top Donors</span>
            </div>
            <span className="text-sm opacity-90">Updated Today</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading champions...</div>
          ) : donors.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No donors yet. Be the first!</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {donors.map((donor, index) => (
                <div 
                  key={donor._id} 
                  className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    index < 3 ? "bg-yellow-50/30" : ""
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0 w-10 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{donor.name}</h3>
                      <p className="text-sm text-gray-500">{donor.bloodGroup} Donor</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-red-600 text-xl">{donor.points} pts</div>
                    <div className="text-xs text-gray-400">{donor.donationCount} donations</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
