import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { BarChart3, TrendingUp, Pill, Clock } from "lucide-react";
import StatCard from "./StatCard.jsx";
import PageWrapper from "./PageWrapper.jsx";
import Container from "./container.jsx";

export default function PrescriptionStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Aggregation 1: Medication Statistics
      const statsRes = await api.get("/aggregation/medications/stats");
      setStats(statsRes.data.data || []);

      // Aggregation 2: Dashboard Data
      const dashRes = await api.get("/aggregation/prescriptions/dashboard");
      setDashboard(dashRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTopMedications = () => {
    if (!stats || stats.length === 0) return [];
    return stats.slice(0, 5);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-100 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-400">
          Real-time insights powered by MongoDB aggregation pipelines
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4 mx-auto"></div>
            Loading analytics...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-900 border border-rose-700 rounded-lg p-4 text-rose-200">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      {!loading && !error && dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BarChart3}
              label="Total Prescriptions"
              value={dashboard.totalPrescriptions || 0}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Active Prescriptions"
              value={dashboard.activePrescriptions || 0}
              color="green"
            />
            <StatCard
              icon={Pill}
              label="Completed Prescriptions"
              value={dashboard.completedPrescriptions || 0}
              color="purple"
            />
            <StatCard
              icon={Clock}
              label="Unique Medications"
              value={stats?.length || 0}
              color="amber"
            />
          </div>

          {/* Medication Statistics */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center">
              <Pill className="w-6 h-6 mr-2 text-purple-400" />
              Top Prescribed Medications
            </h2>

            {getTopMedications().length === 0 ? (
              <p className="text-gray-400">No medication data available</p>
            ) : (
              <div className="space-y-3">
                {getTopMedications().map((med, idx) => (
                  <div key={idx} className="bg-gray-800 rounded p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {med._id || "Unknown"}
                      </h3>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                        {med.totalCount} prescriptions
                      </span>
                    </div>

                    {med.frequencies && med.frequencies.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-400">
                          Frequencies:{" "}
                          <span className="text-gray-300">
                            {[...new Set(med.frequencies)].join(", ")}
                          </span>
                        </p>
                      </div>
                    )}

                    {med.maxDosage && (
                      <p className="text-sm text-gray-400">
                        Max Dosage:{" "}
                        <span className="text-gray-300">{med.maxDosage}</span>
                      </p>
                    )}

                    {/* Visual Progress Bar */}
                    <div className="mt-3 bg-gray-700 rounded h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full"
                        style={{
                          width: `${Math.min(
                            (med.totalCount / (getTopMedications()[0]?.totalCount || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aggregation Feature Highlight */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-2">
              MongoDB Aggregation Pipeline in Action
            </h3>
            <p className="text-blue-100 text-sm mb-3">
              This dashboard uses MongoDB's aggregation framework with:
            </p>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$match</code> - Filter by user</li>
              <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$unwind</code> - Expand medications array</li>
              <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$group</code> - Group by medication name</li>
              <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$sum</code> - Count occurrences</li>
              <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$sort</code> - Order by count</li>
            </ul>
          </div>
        </>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStats}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh Analytics
        </button>

      {/* Related Features Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Explore other MongoDB features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/advanced-search"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 border border-gray-600 hover:border-purple-500 hover:bg-gray-800 rounded-lg p-4 text-left transition-all duration-200 group"
          >
            <p className="text-purple-400 font-semibold group-hover:text-purple-300 flex items-center">
              Advanced Search
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">Execute complex queries with operators like $in, $regex, $gte</p>
          </a>
          <a
            href="/data-insights"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 border border-gray-600 hover:border-green-500 hover:bg-gray-800 rounded-lg p-4 text-left transition-all duration-200 group"
          >
            <p className="text-green-400 font-semibold group-hover:text-green-300 flex items-center">
              Data Insights
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">View detailed data with $lookup JOINs and $facet pipelines</p>
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
