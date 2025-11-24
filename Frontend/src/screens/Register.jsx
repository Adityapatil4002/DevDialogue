import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../Config/axios.js";
import { UserContext } from "../Context/user.context.jsx";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Consume Context
  const { setUser, user } = useContext(UserContext);
  const navigate = useNavigate();

  // 1. Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  // 2. Submit Handler
  function submitHandler(e) {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post("/user/register", {
        email,
        password,
      })
      .then((res) => {
        // --- SUCCESS ---
        console.log("Registration Success:", res.data);

        // A. Store Token
        localStorage.setItem("token", res.data.token);

        // B. Set Global User Context
        setUser(res.data.user);

        // C. Navigate to Home and pass User Data specifically
        navigate("/home", { state: { user: res.data.user } });

        setIsLoading(false);
      })
      .catch((err) => {
        // --- FAILURE ---
        console.error("Registration Failed:", err);
        alert(
          "Registration Failed: " +
            (err.response?.data?.message || "Check console for details")
        );
        setIsLoading(false);
      });
  }

  // Chat animation data
  const chatMessages = [
    { type: "received", text: "New dev joining?" },
    { type: "sent", text: "Yes, sending invite code." },
    { type: "received", text: "Perfect. Access granted." },
    { type: "sent", text: "Setting up the environment." },
    { type: "received", text: "Welcome to the team! 🚀" },
    { type: "sent", text: "Thanks, ready to push code." },
    { type: "received", text: "Don't forget to clone repo." },
    { type: "sent", text: "Cloning now..." },
  ];

  const infiniteChat = [...chatMessages, ...chatMessages];

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0f131a] text-gray-100 font-sans overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

      {/* Main Card Container */}
      <div className="relative w-full max-w-5xl h-[650px] m-4 flex rounded-3xl shadow-2xl overflow-hidden border border-gray-800 animate-card-entry">
        {/* ================= LEFT SIDE (Brand & Dissolved Chat) ================= */}
        <div className="hidden md:flex relative w-[45%] bg-gradient-to-br from-[#0f131a] to-cyan-900 flex-col p-12 overflow-hidden border-r border-white/5">
          {/* Background Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Top: Project Name */}
          <div className="relative z-10 animate-slide-down flex-shrink-0">
            <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">
              DEV
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300">
                DIALOGUE
              </span>
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-purple-500 mt-2 rounded-full animate-width-expand"></div>
          </div>

          {/* Middle: Continuous Chat Animation (Dissolved Edges) */}
          <div className="relative flex-1 w-full flex flex-col justify-center my-6 overflow-hidden chat-fade-mask">
            <div className="w-full animate-scroll-vertical">
              <div className="flex flex-col space-y-4">
                {infiniteChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex w-full ${
                      msg.type === "sent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium backdrop-blur-sm border shadow-sm
                      ${
                        msg.type === "sent"
                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-100 rounded-tr-none"
                          : "bg-white/5 border-white/5 text-gray-400 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: Welcome Text */}
          <div className="relative z-10 animate-slide-up flex-shrink-0">
            <h2 className="text-3xl font-bold text-white leading-tight mb-2">
              Join the Community.
            </h2>
            <p className="text-cyan-100/60 font-medium text-sm leading-relaxed">
              Start your developer journey here. Connect, collaborate, and build
              something amazing.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE (Register Form) ================= */}
        <div className="w-full md:w-[55%] bg-[#141820] p-8 md:p-16 flex flex-col justify-center relative z-20">
          <div className="mb-10 animate-fade-in-right delay-100">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm">
              Sign up to get started with DevDialogue.
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-7 w-full max-w-sm">
            {/* Email Input */}
            <div className="group animate-fade-in-right delay-200">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors duration-300">
                Email Address
              </label>
              <div
                className={`relative flex items-center bg-[#0f131a] rounded-xl border-2 transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                  emailFocused
                    ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                <span className="pl-4 text-gray-500">
                  <svg
                    className="w-5 h-5"
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
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full bg-transparent text-gray-200 p-4 outline-none placeholder-gray-700 text-sm font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group animate-fade-in-right delay-300">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors duration-300">
                Password
              </label>
              <div
                className={`relative flex items-center bg-[#0f131a] rounded-xl border-2 transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                  passwordFocused
                    ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                <span className="pl-4 text-gray-500">
                  <svg
                    className="w-5 h-5"
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
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full bg-transparent text-gray-200 p-4 outline-none placeholder-gray-700 text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 animate-fade-in-up delay-400">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg 
                           transform transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/25 active:scale-[0.98]
                           group flex items-center justify-center
                           ${isLoading ? "opacity-80 cursor-wait" : ""}`}
              >
                <span
                  className={`flex items-center gap-2 ${
                    isLoading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  REGISTER{" "}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                {/* Button Shine Effect */}
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[20deg] animate-shine group-hover:animate-shine-fast"></div>
              </button>
            </div>

            {/* Footer Link */}
            <div className="text-center animate-fade-in-up delay-500">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-cyan-500 hover:text-cyan-400 transition-colors relative group"
                >
                  Login
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .chat-fade-mask {
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 20%,
            black 80%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 20%,
            black 80%,
            transparent 100%
          );
        }

        @keyframes card-entry {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(30px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes width-expand {
          from {
            width: 0;
          }
          to {
            width: 3rem;
          }
        }
        @keyframes scroll-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes shine {
          from {
            left: -100%;
          }
          to {
            left: 200%;
          }
        }

        .animate-card-entry {
          animation: card-entry 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-width-expand {
          animation: width-expand 1s ease-out 0.5s forwards;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-scroll-vertical {
          animation: scroll-vertical 20s linear infinite;
        }
        .animate-scroll-vertical:hover {
          animation-play-state: paused;
        }
        .animate-shine {
          animation: shine 3s infinite linear;
        }
        .animate-shine-fast {
          animation: shine 1s infinite linear;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }

        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-400 {
          animation-delay: 400ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
};

export default Register;
