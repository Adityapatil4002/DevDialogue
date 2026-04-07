import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const StaggeredMenu = ({
  items = [],
  socialItems = [],
  displaySocials = true,
  menuButtonColor = "#fff",
  openMenuButtonColor = "#fff",
  accentColor = "#e5e7eb",
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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(panelRef.current, { xPercent: -100 });
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });
      gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
        transformOrigin: "center center",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

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

    tl.to(line2Ref.current, { scaleX: 0, duration: 0.2 }, 0)
      .to(
        line1Ref.current,
        { y: 8, rotate: 45, duration: 0.3, ease: "back.out(1.7)" },
        0,
      )
      .to(
        line3Ref.current,
        { y: -8, rotate: -45, duration: 0.3, ease: "back.out(1.7)" },
        0,
      );

    tl.to(
      overlayRef.current,
      { opacity: 1, pointerEvents: "all", duration: 0.3 },
      0,
    );
    tl.to(
      panelRef.current,
      { xPercent: 0, duration: 0.5, ease: "power3.out" },
      0,
    );

    const menuItems = panelRef.current.querySelectorAll(".menu-item");
    if (menuItems.length > 0) {
      tl.fromTo(
        menuItems,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: "power2.out" },
        0.2,
      );
    }
  };

  const closeMenuAnim = () => {
    const tl = gsap.timeline();

    tl.to(
      panelRef.current,
      { xPercent: -100, duration: 0.4, ease: "power3.in" },
      0,
    );
    tl.to(
      overlayRef.current,
      { opacity: 0, pointerEvents: "none", duration: 0.3 },
      0.1,
    );

    tl.to(line1Ref.current, { y: 0, rotate: 0, duration: 0.3 }, 0)
      .to(line3Ref.current, { y: 0, rotate: 0, duration: 0.3 }, 0)
      .to(line2Ref.current, { scaleX: 1, duration: 0.2 }, 0.2);
  };

  return (
    <>
      <style>{`
        .menu-link {
          position: relative;
          display: inline-block;
          color: #fff;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .menu-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 0%;
          height: 2px;
          background: #9ca3af;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .menu-link:hover {
          color: #d1d5db;
        }
        .menu-link:hover::after {
          width: 100%;
        }
        .social-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
          letter-spacing: 0.02em;
        }
        .social-link:hover {
          color: #e5e7eb;
        }
        .menu-btn-line {
          display: block;
          width: 22px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transition: background 0.2s;
        }
        .menu-toggle-btn:hover .menu-btn-line {
          background: #d1d5db;
        }
      `}</style>

      <div ref={containerRef} className="relative z-50">
        {/* ── Toggle Button ───────────────────────────────────── */}
        <button
          onClick={toggleMenu}
          className="menu-toggle-btn relative z-[100] w-10 h-10 flex flex-col justify-center items-center gap-[6px] bg-transparent border-none cursor-pointer focus:outline-none"
          aria-label="Toggle Menu"
          style={{ color: isOpen ? openMenuButtonColor : menuButtonColor }}
        >
          <span ref={line1Ref} className="menu-btn-line" />
          <span ref={line2Ref} className="menu-btn-line" />
          <span ref={line3Ref} className="menu-btn-line" />
        </button>

        {/* ── Backdrop Overlay ────────────────────────────────── */}
        <div
          ref={overlayRef}
          onClick={toggleMenu}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />

        {/* ── Menu Panel ──────────────────────────────────────── */}
        <aside
          ref={panelRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            width: "clamp(280px, 35vw, 420px)",
            zIndex: 95,
            display: "flex",
            flexDirection: "column",
            padding: "0",
            background: "#0f0f0f",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "8px 0 40px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Panel top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            }}
          />

          {/* Subtle dot grid background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.02,
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />

          {/* Soft glow */}
          <div
            style={{
              position: "absolute",
              bottom: "15%",
              left: "10%",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.015)",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "80px 44px 48px",
            }}
          >
            {/* Brand mark */}
            <div
              className="menu-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 48,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <span
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                DevDialogue
              </span>
            </div>

            {/* Nav Links */}
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
              }}
            >
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    onClick={(e) => {
                      if (item.link === "#") e.preventDefault();
                    }}
                    className="menu-item menu-link"
                    style={{
                      fontSize: "clamp(28px, 4vw, 40px)",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.15,
                      padding: "6px 0",
                    }}
                  >
                    {item.label}
                  </a>
                ))
              ) : (
                <p style={{ color: "#4b5563", fontSize: 14 }}>No items</p>
              )}
            </nav>

            {/* Divider */}
            <div
              className="menu-item"
              style={{
                width: "100%",
                height: 1,
                background: "rgba(255,255,255,0.07)",
                margin: "32px 0",
              }}
            />

            {/* Socials */}
            {displaySocials && (
              <div
                className="menu-item"
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <h4
                  style={{
                    color: "#4b5563",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Socials
                </h4>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {socialItems.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.link}
                      target="_blank"
                      rel="noreferrer"
                      className="social-link"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom status badge */}
            <div
              className="menu-item"
              style={{
                marginTop: 32,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#6b7280",
                  animation: "menuPulse 2s infinite",
                }}
              />
              <span style={{ color: "#374151", fontSize: 11 }}>
                Online • Dev community
              </span>
            </div>
          </div>
        </aside>

        <style>{`
          @keyframes menuPulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
        `}</style>
      </div>
    </>
  );
};

export default StaggeredMenu;
