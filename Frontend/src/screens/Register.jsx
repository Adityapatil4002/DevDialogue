import React from "react";
import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

const Register = () => {
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
    <div className="relative flex items-center justify-center min-h-screen h-screen bg-neutral-950 text-gray-100 font-sans overflow-hidden selection:bg-gray-300 selection:text-black">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-gray-500/8 rounded-full blur-[150px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-white/4 rounded-full blur-[150px] animate-pulse-slow delay-1000 pointer-events-none"></div>

      {/* Main Card - ADDED min-h-[600px] */}
      <div className="relative w-full max-w-5xl mx-4 flex rounded-2xl shadow-2xl overflow-hidden border border-neutral-800/80 animate-card-entry min-h-[600px] max-h-[calc(100vh-2rem)]">
        {/* ================= LEFT SIDE ================= */}
        <div className="hidden md:flex relative w-[45%] flex-shrink-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900 flex-col p-8 overflow-hidden border-r border-neutral-800/60">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none"></div>

          {/* Top: Project Name */}
          <div className="relative z-10 animate-slide-down flex-shrink-0">
            <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-lg">
              DEV
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
                DIALOGUE
              </span>
            </h1>
            <div className="h-[3px] w-12 bg-gradient-to-r from-white to-gray-600 mt-2 rounded-full animate-width-expand"></div>
          </div>

          {/* Middle: Continuous Chat Animation */}
          <div className="relative flex-1 w-full flex flex-col justify-center my-4 overflow-hidden chat-fade-mask min-h-0">
            <div className="w-full animate-scroll-vertical">
              <div className="flex flex-col space-y-3">
                {infiniteChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex w-full ${msg.type === "sent" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs font-medium backdrop-blur-sm border shadow-sm
                      ${
                        msg.type === "sent"
                          ? "bg-white/10 border-white/15 text-gray-200 rounded-tr-none"
                          : "bg-neutral-800/50 border-neutral-700/40 text-gray-400 rounded-tl-none"
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
            <h2 className="text-2xl font-bold text-white leading-tight mb-1">
              Join the Community.
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Start your developer journey here. Connect, collaborate, and build
              something amazing.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE (Clerk Register Form) ================= */}
        {/* FIXED: Removed justify-center and items-center, changed to flex-col relative */}
        <div className="w-full md:w-[55%] bg-neutral-900 p-6 md:p-12 flex flex-col relative z-20 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {/* FIXED: Changed to m-auto and slightly wider max-w to prevent clipping */}
          <div className="animate-fade-in-right delay-100 w-full max-w-[400px] m-auto">
            <SignUp
              routing="path"
              path="/register"
              signInUrl="/login"
              fallbackRedirectUrl="/home"
              appearance={{
                baseTheme: dark,
                elements: {
                  rootBox: "w-full",
                  cardBox: "shadow-none w-full",
                  // FIXED: Removed p-0 so Clerk handles its own layout properly
                  card: "bg-transparent shadow-none w-full",
                  formButtonPrimary:
                    "bg-white text-black hover:bg-gray-200 transition-colors font-semibold",
                  headerTitle: "text-2xl font-bold text-white tracking-tight",
                  headerSubtitle: "text-gray-500 text-xs",
                  socialButtonsBlockButton:
                    "border-neutral-700 hover:bg-neutral-800/60 transition-all text-gray-300",
                  socialButtonsBlockButtonText: "text-gray-300",
                  formFieldLabel: "text-gray-400",
                  formFieldInput:
                    "bg-neutral-950 border-neutral-700 focus:border-gray-400 rounded-xl text-white placeholder:text-gray-600",
                  footerActionLink:
                    "text-gray-300 hover:text-white transition-colors",
                  footerActionText: "text-gray-500",
                  dividerLine: "bg-neutral-800",
                  dividerText: "text-gray-600",
                  identityPreviewEditButton: "text-gray-400 hover:text-white",
                  formFieldAction: "text-gray-400 hover:text-white",
                  otpCodeFieldInput:
                    "border-neutral-700 bg-neutral-950 text-white",
                  footer: "bg-transparent",
                },
                layout: {
                  socialButtonsPlacement: "top",
                },
              }}
            />
          </div>
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
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 24px 24px;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  );
};

export default Register;
