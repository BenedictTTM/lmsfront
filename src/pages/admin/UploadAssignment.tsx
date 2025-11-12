import { useState, useRef } from "react";
import api from "../../config/api";
import { AxiosError } from "axios"; 
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Calendar, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";

const UploadAssignment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", due_date: "", file: null as File | null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.name === "file" && target.files) {
      setFormData({ ...formData, file: target.files[0] });
    } else {
      setFormData({ ...formData, [target.name]: target.value });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.description || !formData.due_date) {
      setMessage("Please fill in all required fields.");
      setSuccess(false);
      return;
    }

    if (!formData.file) {
      setMessage("Please select a file to upload.");
      setSuccess(false);
      return;
    }
  
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("due_date", formData.due_date);
    form.append("file", formData.file);
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await api.post(
        "/api/admin/upload-assignment",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setSuccess(true);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Error:", axiosError.response?.data);
      
      setSuccess(false);
      setMessage(
        axiosError.response?.data?.message ?? "Error uploading assignment."
      );
    }
  
    setLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upload Assignment</h1>
        <p className="text-sm sm:text-base text-red-900">Create and distribute assignments to all students</p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {success ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${success ? 'text-green-900' : 'text-red-900'}`}>
              {success ? 'Success!' : 'Error'}
            </p>
            <p className={`text-sm mt-1 ${success ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <form className="space-y-4 sm:space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Data Structures Assignment 1"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide detailed instructions for the assignment..."
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Due Date Field */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment File <span className="text-red-500">*</span>
              </label>
              
              {/* Drag and Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-red-500 bg-red-50' 
                    : formData.file 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.zip"
                />

                {formData.file ? (
                  // File Selected State
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="bg-green-100 rounded-full p-3">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{formData.file.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {formatFileSize(formData.file.size)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleFileSelect}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload Prompt State
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="bg-gray-200 rounded-full p-4">
                        <Upload className="w-8 h-8 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleFileSelect}
                        className="text-red-600 font-medium hover:text-red-700 transition-colors"
                      >
                        Click to upload
                      </button>
                      <span className="text-gray-600"> or drag and drop</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      PDF, DOC, DOCX, TXT, ZIP up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
  <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-stretch sm:items-center">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="order-2 sm:order-1 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="order-1 sm:order-2 px-8 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Assignment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Assignment Upload Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>All students will be notified via email when you upload an assignment</li>
                <li>Make sure the due date gives students enough time to complete the work</li>
                <li>Include clear instructions in the description field</li>
                <li>Supported file formats: PDF, DOC, DOCX, TXT, ZIP</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAssignment;
