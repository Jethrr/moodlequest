"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface StreakDay {
  date: string;
  intensity: number;
  dayOfWeek: number;
}

interface StreakGraphProps {
  data: StreakDay[];
}

const StreakGraph: React.FC<StreakGraphProps> = ({ data }) => {
  // Process data to display in a grid (similar to GitHub contribution graph)
  // Each row represents a day of the week (0 = Sunday, 6 = Saturday)
  // Each column represents a week
  
  const weeks = Math.ceil(data.length / 7);
  const processedData: StreakDay[][] = Array(7).fill(null).map(() => Array(weeks).fill(null));
  
  // Fill in the grid with data
  data.forEach((day, index) => {
    const weekIndex = Math.floor(index / 7);
    const dayOfWeek = day.dayOfWeek;
    processedData[dayOfWeek][weekIndex] = day;
  });
  
  // Calculate current and longest streaks
  const calculateCurrentStreak = (data: StreakDay[]): number => {
    let currentStreak = 0;
    
    // Start from the most recent day
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].intensity > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };
  
  // Calculate longest streak
  const calculateLongestStreak = (data: StreakDay[]): number => {
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].intensity > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  };
  
  const currentStreak = calculateCurrentStreak(data);
  const longestStreak = calculateLongestStreak(data);
    // Get color based on intensity
  const getColor = (intensity: number): string => {
    switch (intensity) {
      case 0: return "#ebebf0"; // Light gray for no activity (slightly bluer)
      case 1: return "#f9e0f4"; // Lightest pink/lavender blend
      case 2: return "#f8c2d6"; // Light pink with lavender hint
      case 3: return "#F88389"; // Medium pink (slightly deeper)
      case 4: return "#E5637B"; // Dark pink (slightly warmer)
      default: return "#ebebf0";
    }
  };
  
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div className="streak-graph">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="border-none shadow-md transition-shadow duration-300" style={{ background: "linear-gradient(145deg, #ffffff, #f5f0ff)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#9370DB]">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#6A5ACD]">{currentStreak} days</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md transition-shadow duration-300" style={{ background: "linear-gradient(145deg, #ffffff, #fff0f0)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#F88379]">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#E56B75]">{longestStreak} days</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md transition-shadow duration-300" style={{ background: "linear-gradient(145deg, #ffffff, #f5f0ff)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#9370DB]">Total Active Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#6A5ACD]">
              {data.filter(day => day.intensity > 0).length} days
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 p-4" style={{ background: "linear-gradient(145deg, #ffffff, #f8f5ff)" }}>
        <div className="flex mb-2">          <div className="w-10"></div>
          <div className="flex-1 grid grid-cols-15 gap-1 text-xs text-gray-400" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
            {Array(15).fill(null).map((_, i) => (
              <div key={i} className="text-center">
                {i % 2 === 0 ? `W${15-i}` : ''}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex">
          <div className="w-10 flex flex-col justify-around">
            {dayLabels.map((day, i) => (
              <div key={i} className="h-4 text-xs text-gray-500 pr-2">{day}</div>
            ))}
          </div>
            <div className="flex-1">
            <div className="grid grid-rows-7 gap-1" style={{ gridTemplateRows: 'repeat(7, 1fr)' }}>
              {processedData.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
                  {row.map((day, colIndex) => (                    <motion.div
                      key={colIndex}
                      className="h-4 w-full rounded-sm"
                      style={{ 
                        backgroundColor: day ? getColor(day.intensity) : "#ebebf0",
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                      }}
                      whileHover={{ scale: 1.25, boxShadow: "0 3px 6px rgba(0,0,0,0.1)" }}
                      transition={{ type: "spring", stiffness: 450, damping: 12 }}
                      title={day ? `${day.date}: ${day.intensity > 0 ? `${day.intensity} activities` : 'No activity'}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-3 items-center text-xs text-gray-500">
          <div className="mr-2">Less</div>
          {[0, 1, 2, 3, 4].map(intensity => (
            <div 
              key={intensity} 
              className="h-3 w-3 rounded-sm mx-0.5" 
              style={{                backgroundColor: getColor(intensity),
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            />
          ))}
          <div className="ml-2">More</div>
        </div>
      </Card>
    </div>
  );
};

export default StreakGraph;
