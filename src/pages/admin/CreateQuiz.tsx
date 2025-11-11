import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../config/api";
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  due_date: yup.string().required("Due date is required"),
  duration: yup.number().min(1, "Duration must be at least 1 minute").required("Duration is required"),
});

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<
    { text: string; type: string; options: string[]; correct_answers: string[] }[]
  >([
    { text: "", type: "mcq", options: ["", "", "", ""], correct_answers: [] },
  ]);

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "mcq", options: ["", "", "", ""], correct_answers: [] }]);
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };

  // Toggle correct answer selection for MCQs
  const handleCorrectMCQChange = (qIndex: number, optIndex: number) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const selectedOption = updatedQuestions[qIndex].options[optIndex];
      updatedQuestions[qIndex].correct_answers = [selectedOption];
      return updatedQuestions;
    });
  };

  // Handle fill-in-the-blank correct answer input
  const handleCorrectFillInChange = (qIndex: number, value: string) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[qIndex].correct_answers = [value.trim()];
      return updatedQuestions;
    });
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      await api.post(
        "/api/admin/create-quiz",
        {
          ...data,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error creating quiz.");
      console.error("Error:", error.response?.data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen  p-3 sm:p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Create New Quiz</h1>
          <p className="text-sm text-red-900">Design an engaging quiz for your students with custom questions and options</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-green-900">Quiz created successfully!</p>
              <p className="text-xs text-green-700">Redirecting to dashboard...</p>
            </div>
          </div>
        )}
        
        {message && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-900 text-sm font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Quiz Details Card */}
          <div className="bg-white rounded-lg shadow-sx border border-gray-200 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Details</h2>
            
            <div className="space-y-3">
              {/* Quiz Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title <span className="text-red-600">*</span>
                </label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        {...field}
                        type="text"
                        placeholder="Enter quiz title..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${
                          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date <span className="text-red-600">*</span>
                    </div>
                  </label>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <input
                          {...field}
                          type="datetime-local"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${
                            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                      </>
                    )}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration (minutes) <span className="text-red-600">*</span>
                    </div>
                  </label>
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <input
                          {...field}
                          type="number"
                          min="1"
                          placeholder="e.g., 30"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${
                            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <span className="text-sm text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Question Text
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) =>
                        setQuestions((prev) => {
                          const updated = [...prev];
                          updated[qIndex].text = e.target.value;
                          return updated;
                        })
                      }
                      placeholder="Enter your question here..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Question Type */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) =>
                        setQuestions((prev) => {
                          const updated = [...prev];
                          updated[qIndex].type = e.target.value;
                          updated[qIndex].correct_answers = [];
                          return updated;
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="fill_in">Fill in the Blank</option>
                    </select>
                  </div>

                  {/* MCQ Options */}
                  {question.type === "mcq" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Answer Options
                      </label>
                      {question.options.map((option, optIndex) => {
                        const isCorrect = question.correct_answers.includes(option);
                        return (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  setQuestions((prev) => {
                                    const updated = [...prev];
                                    updated[qIndex].options[optIndex] = e.target.value;
                                    return updated;
                                  })
                                }
                                placeholder={`Option ${optIndex + 1}`}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${
                                  isCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-white'
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCorrectMCQChange(qIndex, optIndex)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                                isCorrect
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {isCorrect && <CheckCircle className="w-3.5 h-3.5" />}
                              {isCorrect ? 'Correct' : 'Mark'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in the blank answer */}
                  {question.type === "fill_in" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Correct Answer
                      </label>
                      <input
                        type="text"
                        value={question.correct_answers[0] || ""}
                        onChange={(e) => handleCorrectFillInChange(qIndex, e.target.value)}
                        placeholder="Enter the correct answer..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Question Button */}
            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 w-full py-2.5 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Another Question
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
