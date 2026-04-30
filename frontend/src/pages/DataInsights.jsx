import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { BarChart3, Users, TrendingUp, Share2 } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import Container from "../components/container.jsx";
import StatCard from "../components/StatCard.jsx";

export default function DataInsights() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    withUser: [],
    paginated: { total: 0, pages: 0, data: [] },
    loading: true,
    error: "",
  });

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: "" }));

      // Aggregation with $lookup (JOIN)
      const userRes = await api.get("/aggregation/prescriptions/with-user");
      
      // Aggregation with pagination ($facet)
      const pagRes = await api.get("/aggregation/prescriptions/paginated?page=1&limit=5");

      setData((prev) => ({
        ...prev,
        withUser: userRes.data?.data || [],
        paginated: pagRes.data?.data || { total: 0, pages: 0, data: [] },
        loading: false,
      }));
    } catch (err) {
      setData((prev) => ({
        ...prev,
        error: err.response?.data?.message || "Failed to load insights",
        loading: false,
      }));
    }
  };

  return (
    <PageWrapper>
      <Container>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Data Insights & Analysis
            </h1>
            <p className="text-gray-400">
              Advanced MongoDB aggregation features: $lookup (JOINs), $facet (parallel pipelines),
              and pagination
            </p>
          </div>

          {data.loading && (
            <div className="flex justify-center py-12">
              <div className="text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4 mx-auto"></div>
                Loading insights...
              </div>
            </div>
          )}

          {data.error && (
            <div className="bg-rose-900 border border-rose-700 rounded-lg p-4 text-rose-200">
              {data.error}
            </div>
          )}

          {!data.loading && !data.error && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={BarChart3}
                  label="Total Records with User Info"
                  value={data.withUser.length}
                  color="blue"
                />
                <StatCard
                  icon={Users}
                  label="Total Prescriptions"
                  value={data.paginated.total}
                  color="green"
                />
                <StatCard
                  icon={Share2}
                  label="Total Pages"
                  value={data.paginated.pages}
                  color="purple"
                />
              </div>

              {/* Prescriptions with User Data ($lookup example) */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center">
                  <Share2 className="w-6 h-6 mr-2 text-cyan-400" />
                  Prescriptions with User Information
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Using <code className="bg-gray-800 px-2 py-1 rounded">$lookup</code> to JOIN user
                  data with prescriptions
                </p>

                {data.withUser.length === 0 ? (
                  <p className="text-gray-400">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {data.withUser.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="bg-gray-800 rounded p-4 border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Prescription #</p>
                            <p className="text-gray-100 font-semibold">
                              {item.prescriptionNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Patient</p>
                            <p className="text-gray-100">
                              {item.patientName || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">User Username</p>
                            <p className="text-gray-100 font-mono text-sm">
                              {item.user?.[0]?.username || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                <div className="mt-4 p-4 bg-cyan-900 bg-opacity-30 border border-cyan-700 rounded">
                  <p className="text-cyan-200 text-sm">
                    <strong>How it works:</strong> The $lookup stage performs a LEFT OUTER JOIN with
                    the users collection, combining prescription data with user information in a
                    single query.
                  </p>
                </div>
              </div>

              {/* Paginated Results ($facet example) */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-purple-400" />
                  Paginated Results (Page 1)
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Using <code className="bg-gray-800 px-2 py-1 rounded">$facet</code> to run
                  multiple pipelines for data and metadata simultaneously
                </p>

                {data.paginated.data && data.paginated.data.length === 0 ? (
                  <p className="text-gray-400">No prescriptions available</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {(data.paginated.data || []).map((presc, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-800 rounded p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-100">
                                {presc.prescriptionNumber}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {presc.patientName}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                presc.status === "Active"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {presc.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Medications: {presc.medications?.length || 0}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Info */}
                    <div className="p-3 bg-purple-900 bg-opacity-30 border border-purple-700 rounded">
                      <p className="text-purple-200 text-sm">
                        Page 1 of {data.paginated.pages} • Total: {data.paginated.total}{" "}
                        prescriptions
                      </p>
                    </div>
                  </>
                )}

                {/* Explanation */}
                <div className="mt-4 p-4 bg-purple-900 bg-opacity-30 border border-purple-700 rounded">
                  <p className="text-purple-200 text-sm">
                    <strong>How it works:</strong> The $facet stage allows running multiple sub-pipelines
                    in parallel on the same input. One sub-pipeline gets metadata (total count, pages),
                    while another gets the paginated data.
                  </p>
                </div>
              </div>

              {/* Aggregation Features Legend */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-3">
                  Advanced Aggregation Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 font-semibold mb-2">$lookup (JOIN Operation)</p>
                    <p className="text-blue-100 text-sm">
                      Combines documents from prescriptions with user documents, similar to SQL JOINs
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 font-semibold mb-2">$facet (Parallel Pipelines)</p>
                    <p className="text-blue-100 text-sm">
                      Runs multiple sub-pipelines on same input for efficient multi-result queries
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 font-semibold mb-2">Pagination Pattern</p>
                    <p className="text-blue-100 text-sm">
                      Uses $skip and $limit for efficient data pagination in large datasets
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 font-semibold mb-2">Metadata Calculation</p>
                    <p className="text-blue-100 text-sm">
                      Calculates total count and page number in same operation for optimization
                    </p>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button
                  onClick={fetchInsights}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Refresh Insights
                </button>

              {/* Related Features Section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-gray-400 text-sm mt-1">View aggregation statistics with $group and $sum</p>
                  </a>
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
                    <p className="text-gray-400 text-sm mt-1">Execute complex queries with $regex and date ranges</p>
                  </a>
                </div>
              </div>
              </div>
            </>
          )}
        </div>
      </Container>
    </PageWrapper>
  );
}
