import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import AuthFooter from "../components/AuthFooter";

type FormState = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  pin: string;
  profilePicture: File | null;
};

type AlertState = {
  type: "success" | "error";
  message: string;
  username?: string;
} | null;

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    pin: "",
    profilePicture: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlert(null);

    // Validation
    if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName || !formData.pin) {
      setAlert({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    if (!formData.profilePicture) {
      setAlert({ type: "error", message: "Please upload a profile picture." });
      return;
    }

    if (formData.pin.length < 4) {
      setAlert({ type: "error", message: "PIN must be at least 4 characters." });
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("first_name", formData.firstName);
    formDataToSend.append("last_name", formData.lastName);
    formDataToSend.append("pin", formData.pin);
    if (formData.profilePicture) {
      formDataToSend.append("profile_picture", formData.profilePicture);
    }

    try {
      const response = await api.post("/api/auth/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAlert({ 
        type: "success", 
        message: response.data.message || "Account created successfully!",
        username: response.data.username 
      });
      
      // Redirect after 3 seconds to give user time to see username
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration failed. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Sharks Logo - Hidden on mobile, visible on large screens */}
      <div 
        className="hidden lg:flex lg:w-3/5 relative overflow-hidden items-center justify-center"
        style={{
          backgroundImage: 'url(/sharkslogo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      </div>

      {/* Mobile Logo - Only visible on small screens */}
      <div className="lg:hidden w-full py-4 px-4 ">
        <div className="max-w-md mx-auto text-center">
          <div className="md:hidden w-full ">
          <div className="flex justify-center">
            <img 
              src="/sharkslogo.png" 
              alt="Sharks Logo" 
              className="h-24 sm:h-32 w-auto object-contain"
            />
          </div>
        </div>

        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Alert Messages */}
          {alert && (
            <div
              role="alert"
              className={`p-3 sm:p-4 rounded-lg border ${
                alert.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    alert.type === "success" ? "bg-green-500" : "bg-red-500"
                  }`}>
                    {alert.type === "success" ? "✓" : "!"}
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium">
                    {alert.message}
                  </p>
                  {alert.username && (
                    <p className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2">
                      Your username: <span className="text-green-900 bg-green-100 px-2 py-1 rounded text-xs sm:text-sm">{alert.username}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Signup Header */}
          <div className="text-left mb-2 sm:mb-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Create Your Account</h1>
            <p className="text-gray-600 text-sm sm:text-base">Fill in your details to get started</p>
          </div>

          {/* Signup Form */}
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 pb-3 sm:pb-4 border-b border-gray-200">
              <div className="relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile Preview"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-4 border-red-100"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-3 sm:px-4 py-2 border border-red-600 rounded-lg text-xs sm:text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Profile Picture
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {formData.profilePicture && (
                <p className="text-xs text-gray-600 truncate max-w-full px-2">{formData.profilePicture.name}</p>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Name Fields - Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    className="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-2.5 border-0 border-b-2 border-gray-300 placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    className="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-2.5 border-0 border-b-2 border-gray-300 placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  className="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-2.5 border-0 border-b-2 border-gray-300 placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone Field */}
              <div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  className="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-2.5 border-0 border-b-2 border-gray-300 placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* PIN Field */}
              <div>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  placeholder="Create a PIN (minimum 4 characters)"
                  className="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-2.5 border-0 border-b-2 border-gray-300 placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                  value={formData.pin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Signup Button */}
            <div className="pt-2 sm:pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 border border-transparent text-sm sm:text-base font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "CREATING ACCOUNT..." : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Continue with Google */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium text-sm sm:text-base transition-all"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/" className="font-semibold text-red-600 hover:text-red-500">
                Log in here
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 text-center">
            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
