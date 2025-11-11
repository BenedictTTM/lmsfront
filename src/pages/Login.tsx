import { FormEvent, useState } from "react";
import api from "../config/api";
import AuthFooter from "../components/AuthFooter";

type FormState = {
  username: string;
  pin: string;
};

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

const Login = () => {
  const [formData, setFormData] = useState<FormState>({ username: "", pin: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlert(null);

    const username = formData.username.trim();
    const pin = formData.pin.trim();

    if (!username || !pin) {
      setAlert({ type: "error", message: "Please enter both username and PIN." });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post("/api/auth/login", { username, pin });

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      setAlert({ type: "success", message: data?.message ?? "Login successful." });

      const redirectPath = data?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      window.location.replace(redirectPath);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Invalid credentials. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Sharks Logo */}
      <div 
        className="hidden lg:flex lg:w-3/5 relative overflow-hidden items-center justify-center "
        style={{
          backgroundImage: 'url(/sharkslogo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      </div>

      {/* Right Panel - Login Form */}
  <div className="w-full lg:w-2/5 flex items-center justify-center px-12 py-12">
        <div className="w-full max-w-screen-sm space-y-8">
          {/* Alert Messages */}
          {alert && (
            <div
              role="alert"
              className={`p-4 rounded-lg border ${
                alert.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    alert.type === "success" ? "bg-green-500" : "bg-red-500"
                  }`}>
                    {alert.type === "success" ? "✓" : "!"}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Header */}
          <div className="text-left mb-8 pt-8">
            <h1 className="lg:text-2xl sm:text:lg font-bold text-gray-900 mb-2">Log in to Your Account</h1>
            <p className="text-red-900 text-base">Enter your details below</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Username Field */}
              <div className="pt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="benedict@gmail.com"
                  className="appearance-none relative block w-full px-4 py-2.5  border-0 border-b-2  placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500  sm:text-base"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              {/* PIN Field */}
              <div>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••••••••••"
                  className="appearance-none relative block w-full px-4 py-2.5  border-0 border-b-2 border-gray-300 placeholder-gray-900 text-gray-900 focus:outline-none focus:border-red-500 sm:text-base"
                  value={formData.pin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2.5 px-2 border border-transparent text-base font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "LOGGING IN..." : "Log In"}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button 
                type="button"
                onClick={() => {/* TODO: Implement forgot password */}}
                className="text-sm text-red-600 hover:text-red-500 font-medium bg-transparent border-none cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Continue with Google */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="font-semibold text-red-600 hover:text-red-500">
                Sign up here
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
