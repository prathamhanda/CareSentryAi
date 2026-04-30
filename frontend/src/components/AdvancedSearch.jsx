import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import {
  Search,
  Filter,
  Calendar,
  Pill,
  CheckCircle,
  TrendingDown,
  Clock,
} from "lucide-react";
import Container from "./container.jsx";
import StatCard from "./StatCard.jsx";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    medicationName: "",
    searchType: "prescriptions",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statsData, setStatsData] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setError("");
      let res;

      // Different query types showcasing different operators
      if (filters.searchType === "prescriptions" && filters.status !== "all") {
        // Using $in operator for status filter
        res = await api.get(
          `/queries/prescriptions/by-status-multiple?statuses=${filters.status}`
        );
      } else if (filters.searchType === "medications" && filters.medicationName) {
        // Using regex and dot notation query
        res = await api.get(
          `/queries/prescriptions/find-medication-by-name?medName=${filters.medicationName}`
        );
      } else if (filters.searchType === "prescriptions" && filters.dateRange !== "all") {
        // Using $gte and $lte operators
        const today = new Date();
        let fromDate, toDate = today.toISOString().split("T")[0];

        if (filters.dateRange === "week") {
          fromDate = new Date(today.setDate(today.getDate() - 7))
            .toISOString()
            .split("T")[0];
        } else if (filters.dateRange === "month") {
          fromDate = new Date(today.setMonth(today.getMonth() - 1))
            .toISOString()
            .split("T")[0];
        }

        res = await api.get(
          `/queries/prescriptions/by-date?fromDate=${fromDate}&toDate=${toDate}`
        );
      } else {
        // Default: get all prescriptions
        res = await api.get("/prescriptions");
      }

      setResults(res.data.data || []);

      // Calculate stats
      if (res.data.data && Array.isArray(res.data.data)) {
        const stats = {
          total: res.data.data.length,
          active: res.data.data.filter((p) => p.status === "Active").length,
          completed: res.data.data.filter((p) => p.status === "Completed")
            .length,
          avgMeds:
            res.data.data.reduce(
              (sum, p) => sum + (p.medications?.length || 0),
              0
            ) / res.data.data.length,
        };
        setStatsData(stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-100 mb-2">
          Advanced Search & Filters
        </h1>
        <p className="text-gray-400">
          Explore MongoDB query operators in action: $in, $gt, $lt, $regex, $or,
          $and and more
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-400" />
          Search Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Type
            </label>
            <select
              value={filters.searchType}
              onChange={(e) => handleFilterChange("searchType", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100"
            >
              <option value="prescriptions">Prescriptions</option>
              <option value="medications">Medications</option>
              <option value="schedules">Schedules</option>
            </select>
          </div>

          {/* Status Filter ($in operator) */}
          {filters.searchType === "prescriptions" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status (using <code className="bg-gray-800 px-2 py-1 rounded text-xs">$in</code>)
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          )}

          {/* Date Range Filter ($gte, $lte operators) */}
          {filters.searchType === "prescriptions" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range (using <code className="bg-gray-800 px-2 py-1 rounded text-xs">$gte, $lte</code>)
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100"
              >
                <option value="all">All Dates</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          )}

          {/* Medication Name Filter (regex) */}
          {filters.searchType === "medications" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Medication Name (using regex)
              </label>
              <input
                type="text"
                value={filters.medicationName}
                onChange={(e) => handleFilterChange("medicationName", e.target.value)}
                placeholder="e.g., Aspirin, Ibuprofen..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100"
              />
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={performSearch}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Search className="w-5 h-5 mr-2" />
          {loading ? "Searching..." : "Execute Search"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-900 border border-rose-700 rounded-lg p-4 text-rose-200">
          {error}
        </div>
      )}

      {/* Results Stats */}
      {statsData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Pill}
            label="Total Results"
            value={statsData.total}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Active"
            value={statsData.active}
            color="green"
          />
          <StatCard
            icon={TrendingDown}
            label="Completed"
            value={statsData.completed}
            color="purple"
          />
          <StatCard
            icon={Clock}
            label="Avg Medications"
            value={statsData.avgMeds.toFixed(1)}
            color="amber"
          />
        </div>
      )}

      {/* Results List */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-100">
            Results ({results.length})
          </h2>

          {results.map((result, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    {result.prescriptionNumber || result.name || "Prescription"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {result.patientName || result.doctorName || "Healthcare Data"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === "Active"
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {result.status || "Pending"}
                </span>
              </div>

              {result.medications && result.medications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    Medications:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.medications.slice(0, 3).map((med, i) => (
                      <span key={i} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                        {med.name} ({med.frequency})
                      </span>
                    ))}
                    {result.medications.length > 3 && (
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                        +{result.medications.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            No results found. Try adjusting your filters.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Executing query...</p>
        </div>
      )}

      {/* Query Info */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2">
          Query Operators Demonstrated
        </h3>
        <ul className="text-blue-100 text-sm space-y-1">
          <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$in</code> - Match any value in an array</li>
          <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$gte, $lte</code> - Range queries for dates</li>
          <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">$regex</code> - Pattern matching on medication names</li>
          <li>• <code className="bg-black bg-opacity-30 px-2 py-1 rounded">Dot notation</code> - Query nested fields (medications.name)</li>
        </ul>

      {/* Related Features Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Explore other MongoDB features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 border border-gray-600 hover:border-blue-500 hover:bg-gray-800 rounded-lg p-4 text-left transition-all duration-200 group"
          >
            <p className="text-blue-400 font-semibold group-hover:text-blue-300 flex items-center">
              Analytics Dashboard
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">View aggregation pipelines with $group, $sum, $unwind</p>
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
            <p className="text-gray-400 text-sm mt-1">See $lookup JOINs and $facet parallel pipelines in action</p>
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
