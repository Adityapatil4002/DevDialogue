import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const StaggeredMenu = ({
  items = [],
  socialItems = [],
  displaySocials = true,
  menuButtonColor = "#fff",
  accentColor = "#5227FF",
  onMenuOpen,
  onMenuClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);

  // Animation Timelines
  const timelineRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial Setups
      gsap.set(panelRef.current, { xPercent: -100 }); // Start hidden left
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });
      gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
        transformOrigin: "center center",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Build and Play Animation
  const toggleMenu = useCallback(() => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      onMenuOpen?.();
      openMenuAnim();
    } else {
      onMenuClose?.();
      closeMenuAnim();
    }
  }, [isOpen, onMenuOpen, onMenuClose]);

  const openMenuAnim = () => {
    const tl = gsap.timeline();

    // 1. Animate Button to X
    tl.to(line2Ref.current, { scaleX: 0, duration: 0.2 }, 0)
      .to(
        line1Ref.current,
        { y: 8, rotate: 45, duration: 0.3, ease: "back.out(1.7)" },
        0
      )
      .to(
        line3Ref.current,
        { y: -8, rotate: -45, duration: 0.3, ease: "back.out(1.7)" },
        0
      );

    // 2. Show Overlay
    tl.to(
      overlayRef.current,
      { opacity: 1, pointerEvents: "all", duration: 0.3 },
      0
    );

    // 3. Slide in Panel
    tl.to(
      panelRef.current,
      { xPercent: 0, duration: 0.5, ease: "power3.out" },
      0
    );

    // 4. Stagger Items
    const items = panelRef.current.querySelectorAll(".menu-item");
    if (items.length > 0) {
      tl.fromTo(
        items,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: "power2.out" },
        0.2
      );
    }
  };

  const closeMenuAnim = () => {
    const tl = gsap.timeline();

    // 1. Slide out Panel
    tl.to(
      panelRef.current,
      { xPercent: -100, duration: 0.4, ease: "power3.in" },
      0
    );

    // 2. Hide Overlay
    tl.to(
      overlayRef.current,
      { opacity: 0, pointerEvents: "none", duration: 0.3 },
      0.1
    );

    // 3. Revert Button
    tl.to(line1Ref.current, { y: 0, rotate: 0, duration: 0.3 }, 0)
      .to(line3Ref.current, { y: 0, rotate: 0, duration: 0.3 }, 0)
      .to(line2Ref.current, { scaleX: 1, duration: 0.2 }, 0.2);
  };

  return (
    <div ref={containerRef} className="relative z-50">
      {/* --- TOGGLE BUTTON --- */}
      <button
        onClick={toggleMenu}
        className="relative z-[100] w-10 h-10 flex flex-col justify-center items-center gap-[6px] bg-transparent border-none cursor-pointer focus:outline-none"
        aria-label="Toggle Menu"
      >
        <span
          ref={line1Ref}
          className="w-6 h-[2px] rounded-full"
          style={{ backgroundColor: menuButtonColor }}
        ></span>
        <span
          ref={line2Ref}
          className="w-6 h-[2px] rounded-full"
          style={{ backgroundColor: menuButtonColor }}
        ></span>
        <span
          ref={line3Ref}
          className="w-6 h-[2px] rounded-full"
          style={{ backgroundColor: menuButtonColor }}
        ></span>
      </button>

      {/* --- BACKDROP OVERLAY --- */}
      <div
        ref={overlayRef}
        onClick={toggleMenu}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
      />

      {/* --- MENU PANEL --- */}
      <aside
        ref={panelRef}
        className="fixed top-0 left-0 h-full w-[300px] md:w-[400px] bg-white z-[95] flex flex-col p-10 shadow-2xl"
      >
        <div className="mt-20 flex flex-col gap-6">
          {/* Menu Items */}
          <nav className="flex flex-col gap-4">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="menu-item text-4xl font-bold text-black hover:text-[var(--accent)] transition-colors no-underline uppercase tracking-tighter"
                  style={{ "--accent": accentColor }}
                >
                  {item.label}
                </a>
              ))
            ) : (
              <p className="text-gray-400">No Items</p>
            )}
          </nav>

          {/* Divider */}
          <div className="w-full h-[1px] bg-gray-200 my-4 menu-item"></div>

          {/* Social Items */}
          {displaySocials && (
            <div className="flex flex-col gap-3 menu-item">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Socials
              </h4>
              <div className="flex gap-4 flex-wrap">
                {socialItems.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-medium text-black hover:text-[var(--accent)] transition-colors no-underline"
                    style={{ "--accent": accentColor }}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
