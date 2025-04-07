import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./common.css";
import "./section3.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Recommendations = ({ bestCrops, recommendations, trendsData }) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div className="rec-container">
      <h4 className="inputheading">🌱 Best Crop Recommendations</h4>
      <div className="remedy-container">
        <p><strong>Best Suited Crop:</strong> {bestCrops}</p>
      </div>
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)} className="Tabs">
        <TabList className="TabList">
          <Tab className="TabListitem">📊 Crop Suitability Trends</Tab>
        </TabList>
        <TabPanel>
          <h3 className="text-lg font-semibold">📊 Crop Suitability Trends</h3>
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
      </Tabs>
    </div>
  );
};

const CropRec = ({ recommendations }) => (
  <div className="flex w-full h-screen p-6 gap-6 flex-col">
    <Recommendations {...recommendations} />
  </div>
);

export default CropRec;
