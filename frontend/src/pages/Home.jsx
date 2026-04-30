import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageWrapper from "../components/PageWrapper";
import Container from "../components/container.jsx";
import {
  BarChart3,
  Search,
  TrendingUp,
  Pill,
  Calendar,
  Database,
  Zap,
} from "lucide-react";

export function Home() {
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth?.status);
  const user = useSelector((state) => state.auth?.userData);

  const features = [
    {
      id: 1,
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Explore prescription statistics using MongoDB aggregation pipelines with $group, $sum, $unwind operators",
      path: "/analytics",
      color: "bg-blue-600",
      mongodb: "$group, $sum, $unwind, $sort",
      auth: true,
    },
    {
      id: 2,
      icon: Search,
      title: "Advanced Search",
      description:
        "Execute complex queries with $in, $gte, $lte, $regex, and dot notation for nested document queries",
      path: "/advanced-search",
      color: "bg-purple-600",
      mongodb: "$in, $regex, $gte, $lte",
      auth: true,
    },
    {
      id: 3,
      icon: TrendingUp,
      title: "Data Insights",
      description:
        "Analyze prescriptions with $lookup (JOIN), $facet (parallel pipelines), and pagination patterns",
      path: "/data-insights",
      color: "bg-green-600",
      mongodb: "$lookup, $facet, $skip, $limit",
      auth: true,
    },
    {
      id: 4,
      icon: Pill,
      title: "Manage Prescriptions",
      description:
        "Create, update, and manage prescriptions with complete CRUD operations and real-time status tracking",
      path: "/prescriptions",
      color: "bg-amber-600",
      mongodb: "CRUD, Array operations",
      auth: true,
    },
    {
      id: 5,
      icon: Calendar,
      title: "Schedule your Medication",
      description:
        "Set up medication schedules with time-based notifications and automated reminders",
      path: "/schedule",
      color: "bg-cyan-600",
      mongodb: "Embedded documents, Indexes",
      auth: true,
    },
    {
      id: 6,
      icon: Zap,
      title: "Upload Prescriptions",
      description:
        "Add new prescriptions with validation and automatic indexing for optimized queries",
      path: "/upload",
      color: "bg-pink-600",
      mongodb: "Indexes, Validation",
      auth: true,
    },
  ];

  const visibleFeatures = features.filter((f) =>
    authStatus ? f.auth !== false : f.auth !== true
  );

  return (
    <PageWrapper>
      <Container>
        <div className="space-y-12">
          {/* Welcome Section */}
          {authStatus && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 border border-gray-700">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.name || "User"}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Your healthcare management system powered by MongoDB and real-time analytics
              </p>
            </div>
          )}

          {/* Main Heading */}
          <div>
            <h2 className="text-4xl font-bold text-gray-100 mb-2">
              MongoDB Features Showcase
            </h2>
            <p className="text-gray-400 text-lg">
              Explore comprehensive MongoDB implementation with CRUD operations, aggregation
              pipelines, indexing, and advanced query operators
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="group bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(feature.path)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${feature.color} p-3 rounded-lg text-white`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {feature.mongodb}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                    Explore
                    <span className="ml-2">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MongoDB Topics Covered */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
              <Database className="w-6 h-6 mr-2 text-cyan-400" />
              MongoDB Topics Covered
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="text-blue-400 font-semibold mb-2">
                    1. Introduction to MongoDB
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Database hierarchy, JSON/BSON, CAP theorem, connection pooling
                  </p>
                </div>

                <div className="bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="text-purple-400 font-semibold mb-2">
                    2. CRUD Operations
                  </h4>
                  <p className="text-gray-400 text-sm">
                    insertOne/insertMany, find, updateOne/updateMany, deleteOne/deleteMany
                  </p>
                </div>

                <div className="bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="text-green-400 font-semibold mb-2">
                    3. Nested Documents
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Embedded documents, dot notation, $elemMatch for nested queries
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="text-amber-400 font-semibold mb-2">
                    4. Array Operations
                  </h4>
                  <p className="text-gray-400 text-sm">
                    $push, $pop, $pull, $all, $elemMatch, $size, $addToSet
                  </p>
                </div>

                <div className="bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="text-cyan-400 font-semibold mb-2">
                    5. Indexing
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Single-field, compound, multikey, text, unique indexes, cardinality
                  </p>
                </div>

                <div className="bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="text-pink-400 font-semibold mb-2">
                    6. Aggregation Framework
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Pipeline stages: $match, $group, $unwind, $lookup, $facet, $bucket
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          {authStatus && (
            <div className="bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">
                🚀 What You Can Do Here
              </h3>
              <ul className="text-green-50 space-y-2">
                <li>✓ View prescription analytics with aggregation pipelines</li>
                <li>✓ Execute advanced queries with multiple filter operators</li>
                <li>✓ Analyze data with JOINs and parallel pipeline processing</li>
                <li>✓ Manage medications with embedded documents and arrays</li>
                <li>✓ Benefit from strategic indexing for optimal performance</li>
                <li>✓ Experience real-time data updates and notifications</li>
              </ul>
            </div>
          )}

          {/* CTA for Unauthenticated Users */}
          {!authStatus && (
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 border border-gray-700 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Get Started Today
              </h3>
              <p className="text-indigo-100 mb-6 text-lg">
                Sign up to access all MongoDB features and manage your healthcare data
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Create Account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-indigo-800 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center text-gray-400 text-sm py-8 border-t border-gray-700">
            <p>
              All features demonstrate real MongoDB implementation with production-ready code patterns
            </p>
            <p className="mt-2">
              Indexed queries • Aggregation pipelines • Array operations • Nested documents
            </p>
          </div>
        </div>
      </Container>
    </PageWrapper>
  );
}