import React, { useEffect, useState } from 'react';
import { Award, Clock, CheckCircle } from 'lucide-react';
import api from '../../config/api';

interface QuizResult {
  id: number;
  title: string;
  score: number;
  submitted_at: string;
}

interface DashboardData {
  student: {
    name: string;
  };
  averageScore: number;
  upcomingQuizzes: number;
  completedQuizzes: number;
  recentResults: QuizResult[];
}

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get<DashboardData>(
          '/api/student/dashboard',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600"; 
    if (score >= 60) return "text-yellow-600"; 
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        Welcome back, {dashboardData?.student?.name}!
      </h1>
      <p className="text-gray-600 mb-8">Track your progress and stay up to date with your courses</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Quiz Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Award className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Quiz Performance</h3>
          <p className={`text-4xl font-bold mb-1 ${getScoreColor(dashboardData?.averageScore || 0)}`}>
            {dashboardData?.averageScore || 0}%
          </p>
          <p className="text-gray-500 text-sm">Average Score</p>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Upcoming Quizzes</h3>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {dashboardData?.upcomingQuizzes || 0}
          </p>
          <p className="text-gray-500 text-sm">To be completed</p>
        </div>

        {/* Completed Quizzes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Completed Quizzes</h3>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {dashboardData?.completedQuizzes || 0}
          </p>
          <p className="text-gray-500 text-sm">Total completed</p>
        </div>
      </div>

      {/* Recent Results Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Quiz Results</h2>
        {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.recentResults.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{result.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    result.score >= 80 ? 'bg-green-500' :
                    result.score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                    Score: {result.score}%
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Completed: {new Date(result.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg">
            <p className="font-medium">No recent quiz results available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;