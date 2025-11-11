import { useEffect, useState } from "react";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, Award, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  due_date: string;
  duration_minutes: number;
  score?: number;
}

const StudentQuizzes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<{ available: Quiz[]; past: Quiz[] }>({
    available: [],
    past: [],
  });

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/student/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuizzes({
          available: response.data?.available ?? [],
          past: response.data?.past ?? [],
        });

      } catch (err: any) {
        setError("Failed to fetch quizzes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string | number | Date) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } as const;
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Calculate time remaining for available quizzes
  const getTimeRemaining = (dueDate: string | number | Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Due now";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours}h`;
    } else {
      return `${diffHours}h remaining`;
    }
  };

  // Determine badge style based on time remaining
  const getUrgencyStyle = (dueDate: string | number | Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 12) return "bg-red-100 text-red-700 border-red-200";
    if (diffHours < 24) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Quizzes</h3>
              <p className="text-red-700 text-sm">{error} Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quizzes</h1>
          <p className="text-gray-600">Track your upcoming and completed assessments</p>
        </div>
        
        {/* Available Quizzes Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {quizzes.available.length}
            </span>
          </div>
          
          {quizzes.available.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-900 text-center">
                You don't have any available quizzes at the moment. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.available.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => navigate(`/student/take-quiz/${quiz.id}`)}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-red-300 transition-all duration-200 cursor-pointer group"
                >
                  {/* Time remaining badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${getUrgencyStyle(quiz.due_date)}`}>
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining(quiz.due_date)}
                    </span>
                  </div>

                  {/* Quiz title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                  
                  {/* Quiz details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="truncate">Due: {formatDate(quiz.due_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Duration: {quiz.duration_minutes} minutes</span>
                    </div>
                  </div>

                  {/* Start button indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-red-600 font-semibold text-sm flex items-center justify-between">
                      <span>Start Quiz</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Past Quizzes Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Past Quizzes</h2>
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {quizzes.past.length}
            </span>
          </div>
          
          {quizzes.past.length === 0 ? (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 text-center">
                You haven't completed any quizzes yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.past.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Quiz title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">
                    {quiz.title}
                  </h3>
                  
                  {/* Quiz details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="truncate">Completed: {formatDate(quiz.due_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Duration: {quiz.duration_minutes} minutes</span>
                    </div>
                  </div>
                  
                  {/* Score display */}
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className={`w-5 h-5 ${quiz.score ? getScoreColor(quiz.score) : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-700">Score:</span>
                    </div>
                    <span className={`text-lg font-bold ${quiz.score ? getScoreColor(quiz.score) : 'text-gray-500'}`}>
                      {quiz.score ? `${quiz.score}/100` : "Not graded"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes;