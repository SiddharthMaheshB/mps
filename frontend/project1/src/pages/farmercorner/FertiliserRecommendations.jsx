import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./common.css"
import "./section3.css"



const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Recommendations = ({ fertilizer, dosage, bestPractices, warnings, trendsData, nutrientImbalance, seasonalRequirements, nutrientDistribution }) => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <div className="rec-container">
      <h4 className="inputheading">🛠️ Recommendations & Solutions</h4>
      <div className="remedy-container">
      <p><strong>Recommended Fertilizer:</strong> {fertilizer.name}</p>
      
      
      </div>
      {fertilizer.image && <img src={fertilizer.image} alt="Fertilizer"  style={{borderRadius:"5%",marginBottom:"3%",width:"52%"}}/>}
      <div className="remedy-container">
      <p><strong>Dosage & Application:</strong> {dosage}</p>
      </div>
      <div className="remedy-container">
      <p><strong>Best Practices:</strong> {bestPractices}</p>
      </div>
      {warnings && <p className="text-red-500"><strong>Warning:</strong> {warnings}</p>}
      
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)} className="Tabs">
        <TabList className="TabList">
          <Tab className="TabListitem">📊 Nutrient Trends</Tab>
          <Tab className="TabListitem">⚠️ Nutrient Imbalance</Tab>
          <Tab className="TabListitem">🌱 Seasonal Requirements</Tab>
          <Tab className="TabListitem">🧪 Nutrient Distribution</Tab>
        </TabList>

        {/* Nutrient Levels & Trends Graph */}
        <TabPanel>
          <h3 className="text-lg font-semibold">📊 Nutrient Levels & Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendsData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </TabPanel>

        {/* Soil Nutrient Imbalance */}
        <TabPanel>
          <h3 className="text-lg font-semibold">⚠️ Soil Nutrient Imbalance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={nutrientImbalance}>
              <XAxis dataKey="nutrient" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="value" fill="#FF5733" />
            </BarChart>
          </ResponsiveContainer>
        </TabPanel>

        {/* Seasonal Fertilizer Requirements */}
        <TabPanel>
          <h3 className="text-lg font-semibold">🌱 Seasonal Fertilizer Requirements</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seasonalRequirements}>
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="requirement" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </TabPanel>

        {/* Nutrient Distribution */}
        <TabPanel>
          <h3 className="text-lg font-semibold">🧪 Nutrient Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={nutrientDistribution} cx="50%" cy="50%" outerRadius={80} label>
                {nutrientDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </TabPanel>
      </Tabs>
    </div>
  );
};

const FertilizerRec = ({ recommendations }) => {
  return (
    <div className="flex w-full h-screen p-6 gap-6 flex-col">
      <Recommendations {...recommendations} />
    </div>
  );
};

export default FertilizerRec;
