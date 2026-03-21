import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

const Login = () => {
  const chatMessages = [
    { type: "received", text: "Is the API live?" },
    { type: "sent", text: "Deployed to prod 🚀" },
    { type: "received", text: "Great! Checking logs..." },
    { type: "sent", text: "Latency is under 20ms." },
    { type: "received", text: "Pushing the new PR." },
    { type: "sent", text: "Merging now." },
    { type: "received", text: "UI glitch fixed?" },
    { type: "sent", text: "Yes, border-radius updated." },
  ];

  const infiniteChat = [...chatMessages, ...chatMessages];

  return (
    <div className="relative flex items-center justify-center h-screen bg-[#0f131a] text-gray-100 font-sans overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

      {/* Main Card — locked to viewport */}
      <div className="relative w-full max-w-5xl mx-4 flex rounded-3xl shadow-2xl overflow-hidden border border-gray-800 animate-card-entry max-h-[calc(100vh-2rem)]">
        {/* ================= LEFT SIDE ================= */}
        <div className="hidden md:flex relative w-[45%] bg-gradient-to-br from-cyan-900 to-[#0f131a] flex-col p-8 overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Top: Project Name */}
          <div className="relative z-10 animate-slide-down flex-shrink-0">
            <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-lg">
              DEV
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
                DIALOGUE
              </span>
            </h1>
            <div className="h-1 w-12 bg-cyan-500 mt-2 rounded-full animate-width-expand"></div>
          </div>

          {/* Middle: Continuous Chat Animation */}
          <div className="relative flex-1 w-full flex flex-col justify-center my-4 overflow-hidden chat-fade-mask">
            <div className="w-full animate-scroll-vertical">
              <div className="flex flex-col space-y-3">
                {infiniteChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex w-full ${msg.type === "sent" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs font-medium backdrop-blur-sm border shadow-sm
                      ${msg.type === "sent" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-100 rounded-tr-none" : "bg-white/5 border-white/5 text-gray-400 rounded-tl-none"}`}
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
            <h2 className="text-2xl font-bold text-white leading-tight mb-1">
              Welcome Back.
            </h2>
            <p className="text-cyan-100/60 font-medium text-sm leading-relaxed">
              Join the conversation. Sync your code and collaborate in
              real-time.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE (Clerk Login Form) ================= */}
        <div className="w-full md:w-[55%] bg-[#141820] p-4 md:p-6 flex flex-col items-center justify-center relative z-20 overflow-y-auto scrollbar-hide">
          <div className="animate-fade-in-right delay-100 w-full max-w-sm">
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/register"
              fallbackRedirectUrl="/home"
              appearance={{
                baseTheme: dark,
                elements: {
                  rootBox: "w-full",
                  cardBox: "shadow-none w-full",
                  card: "bg-transparent shadow-none w-full p-0",
                  formButtonPrimary:
                    "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
                  headerTitle: "text-2xl font-bold text-white tracking-tight",
                  headerSubtitle: "text-gray-500 text-xs",
                  socialButtonsBlockButton:
                    "border-gray-800 hover:bg-gray-800/50 transition-all",
                  formFieldInput:
                    "bg-[#0f131a] border-gray-800 focus:border-cyan-500 rounded-xl",
                  footerActionLink: "text-cyan-500 hover:text-cyan-400",
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom Animations Styles */}
      <style jsx>{`
        .chat-fade-mask {
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 20%,
            black 80%,
            transparent 100%
          );
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
        .animate-scroll-vertical {
          animation: scroll-vertical 20s linear infinite;
        }
        .animate-scroll-vertical:hover {
          animation-play-state: paused;
        }
        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
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
      `}</style>
    </div>
  );
};

export default Login;
