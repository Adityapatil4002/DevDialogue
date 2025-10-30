import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../Config/axios.js";
import { UserContext } from "../Context/user.context.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post("/user/login", {
        email,
        password,
      })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response.data);
        setIsLoading(false);
      });
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 animate-gradient-shift"></div>

      {/* Floating orbs for background effect */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Main login card */}
      <div className="relative w-full max-w-md mx-4 transform transition-all duration-500 hover:scale-[1.02]">
        <div className="relative p-8 space-y-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-slide-up">
          {/* Glow effect on top */}
          <div className="absolute -top-1 -left-1 -right-1 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-75 animate-glow-pulse"></div>

          {/* Logo/Title Section */}
          <div className="text-center space-y-2 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg animate-pulse-slow">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-text-shimmer">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-400 animate-fade-in-delayed">
              Login to DevDialogue
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2 animate-slide-in-left">
              <label
                htmlFor="email"
                className={`text-sm font-medium transition-colors duration-300 ${
                  emailFocused ? "text-blue-400" : "text-gray-300"
                }`}
              >
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-300 ${
                      emailFocused ? "text-blue-400" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    ></path>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-gray-100 bg-gray-700/50 border border-gray-600 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-300 hover:bg-gray-700/70
                           placeholder-gray-500"
                  placeholder="you@example.com"
                />
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left transition-transform duration-300 ${
                    emailFocused ? "scale-x-100" : "scale-x-0"
                  }`}
                ></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 animate-slide-in-right">
              <label
                htmlFor="password"
                className={`text-sm font-medium transition-colors duration-300 ${
                  passwordFocused ? "text-blue-400" : "text-gray-300"
                }`}
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-300 ${
                      passwordFocused ? "text-blue-400" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-gray-100 bg-gray-700/50 border border-gray-600 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-300 hover:bg-gray-700/70
                           placeholder-gray-500"
                  placeholder="••••••••"
                />
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left transition-transform duration-300 ${
                    passwordFocused ? "scale-x-100" : "scale-x-0"
                  }`}
                ></div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative w-full px-4 py-3 font-bold text-white rounded-lg
                       bg-gradient-to-r from-blue-600 to-blue-700
                       hover:from-blue-700 hover:to-blue-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                       transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                       shadow-lg hover:shadow-xl
                       animate-slide-up-delayed
                       ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              <span
                className={`flex items-center justify-center ${
                  isLoading ? "invisible" : ""
                }`}
              >
                Login
                <svg
                  className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative animate-fade-in-delayed">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">or</span>
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-sm text-center text-gray-400 animate-fade-in-delayed">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 
                       hover:from-blue-300 hover:to-purple-300 transition-all duration-300
                       relative group"
            >
              Create one
              <span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 
                           transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              ></span>
            </Link>
          </p>
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(-20px) translateX(10px) scale(1.05);
          }
          66% {
            transform: translateY(20px) translateX(-10px) scale(0.95);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(20px) translateX(-10px) scale(1.05);
          }
          66% {
            transform: translateY(-20px) translateX(10px) scale(0.95);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes text-shimmer {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes glow-pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 10s ease infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.8s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out;
        }

        .animate-text-shimmer {
          background-size: 200% 200%;
          animation: text-shimmer 3s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
