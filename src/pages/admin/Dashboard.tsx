import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Users, FileText, Send, TrendingUp, Search, X } from "lucide-react";
import api from "../../config/api";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  quizzes_taken: number;
  average_score: number;
}

interface QuizResult {
  title: string;
  score: number;
  submitted_at: string;
}

interface StudentDetails {
  student: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  quizResults: QuizResult[];
}

interface SystemStats {
  overview: {
    total_students: number;
    total_quizzes: number;
    total_submissions: number;
    average_score: number;
  };
  monthlyStats: {
    month: string;
    submissions: number;
    average_score: number;
  }[];
}

const Dashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [studentsRes, statsRes] = await Promise.all([
        api.get<Student[]>("/api/admin/students", { headers }),
        api.get<SystemStats>("/api/admin/system-stats", { headers }),
      ]);

      setStudents(studentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleStudentClick = async (studentId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get<StudentDetails>(
        `/api/admin/students/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedStudent(response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor and manage your learning management system</p>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-red-50 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-xs font-medium mb-1">Total Students</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.total_students || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700" />
            </div>
          </div>
          <h3 className="text-gray-600 text-xs font-medium mb-1">Total Quizzes</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.total_quizzes || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-red-50 rounded-lg">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-xs font-medium mb-1">Total Submissions</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.total_submissions || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700" />
            </div>
          </div>
          <h3 className="text-gray-600 text-xs font-medium mb-1">Average Score</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.average_score || 0}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Monthly Submissions</h2>
          <div className="w-full h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyStats || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="submissions" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Average Scores Trend</h2>
          <div className="w-full h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyStats || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="average_score" stroke="#6b7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Students</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Quizzes</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm sm:text-base font-medium text-gray-900">{`${student.first_name} ${student.last_name}`}</div>
                      <div className="text-xs text-gray-500 md:hidden">{student.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-600 hidden md:table-cell">{student.email}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{student.username}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {student.quizzes_taken}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.average_score >= 80 ? 'bg-green-100 text-green-800' :
                        student.average_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.average_score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {selectedStudent && (
              <div className="p-6">
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{`${selectedStudent.student.first_name} ${selectedStudent.student.last_name}`}</h3>
                  <p className="text-gray-600"><span className="font-medium">Email:</span> {selectedStudent.student.email}</p>
                  <p className="text-gray-600"><span className="font-medium">Student ID:</span> {selectedStudent.student.username}</p>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Quiz Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quiz</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedStudent.quizResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{result.title}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.score >= 80 ? 'bg-green-100 text-green-800' :
                              result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.score}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(result.submitted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;