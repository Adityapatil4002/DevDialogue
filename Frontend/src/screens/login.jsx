import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../Config/axios.js";
import { UserContext } from "../Context/user.context.jsx";

// ----------------------------------------------------------------------
// ⚠️ IMPORTANT: Import your LaserFlow component.
// You must update this path to wherever you saved 'LaserFlow.jsx'.
// ----------------------------------------------------------------------
import LaserFlow from "../components/LaserFlow"; // <-- FIX THIS IMPORT PATH

const Login = () => {
  // Your existing state and logic (no changes)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gray-950">
      {/* Background (simple dark color since LaserFlow is moving) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900 animate-gradient-shift"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>

      {/* This is the new central box that contains both panels.
          Adjusted max-h- for shorter rectangle.
      */}
      <div className="relative z-10 w-full max-w-5xl md:max-h-[600px] lg:max-h-[650px] flex rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/*
          LaserFlow component now specifically for the top of this central box.
          It's absolutely positioned within this container.
          Added a dark overlay to make text more readable.
        */}
        <div className="absolute inset-0 z-0">
          <LaserFlow
            color="#3B82F6" // Blue theme
            horizontalBeamOffset={0.1}
            verticalBeamOffset={0.0}
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 to-transparent"></div>

        {/* ------------------------------------------------ */}
        {/* --------------- LEFT INFO PANEL (DARK) --------- */}
        {/* ------------------------------------------------ */}
        <div className="hidden md:flex w-1/2 p-12 flex-col justify-center bg-gray-900/90 text-white relative z-20">
          <div className="relative z-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg animate-pulse-slow">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-text-shimmer mb-4">
              Welcome to DevDialogue
            </h1>
            <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
              Your new hub for real-time collaboration, code sharing, and
              developer-focused discussion.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* --------------- RIGHT LOGIN PANEL (WHITE) ------ */}
        {/* ------------------------------------------------ */}
        <div className="w-full md:w-1/2 bg-white text-gray-800 p-12 relative z-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">User Login</h2>
          <p className="text-gray-600 mb-8">Login to access your dashboard.</p>

          {/* --- Form (Re-styled for white background) --- */}
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
                              transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
                              transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 mr-2" />
                Remember me
              </label>
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </a>
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
                                ${
                                  isLoading
                                    ? "opacity-75 cursor-not-allowed"
                                    : ""
                                }`}
            >
              <span
                className={`flex items-center justify-center ${
                  isLoading ? "invisible" : ""
                }`}
              >
                Login
                <svg
                  className="w-5 h-5 ml-2 transform"
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

            {/* Divider */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* This <style> block contains all the animations */}
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

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-text-shimmer {
          background-size: 200% 200%;
          animation: text-shimmer 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
