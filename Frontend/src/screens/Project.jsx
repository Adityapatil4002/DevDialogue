import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);

  console.log(location.state);

  return (
    <main className="h-screen w-screen flex">
      {/* This parent <section> needs 'overflow-hidden' 
        to hide the panel when it moves outside. 
      */}
      <section className="left relative flex flex-col h-full min-w-80 bg-slate-300 overflow-hidden">
        <header className="flex justify-end p-2 px-4 w-full bg-slate-100">
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className="p-2 " //
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          <div className="message-box p-1 flex-grow flex flex-col gap-1">
            <div className="message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65 text-sm">example@gmail.com</small>
              <p className="test-sm">
                ipsum dolor sit amet.ipsum dolor sit amet.
              </p>
            </div>
            <div className="ml-auto max-w-56 message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65 text-sm">example@gmail.com</small>
              <p className="test-sm">ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="inputField w-full flex ">
            <input
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter message"
            />
            <button className=" px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-end px-3 p-2 bg-slate-200 ">
            <button onClick={() => setisSidePanelOpen(false)} className="p-2 ">
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
              <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                <i className="ri-user-fill absolute"></i>
              </div>

              <h1 className="font-semibold text-lg">username</h1>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Project;
