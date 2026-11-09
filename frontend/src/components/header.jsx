import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import { Container } from "./index";
import { Menu, X, Upload, LogOut, Sparkles, Activity } from "lucide-react";
import gsap from "gsap";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const authStatus = !!user;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const headerRef = useRef(null);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  // Subtle header entrance animation
  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !headerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.45,
        ease: "power2.out",
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const navItems = [
    { name: "Scan Prescription", path: "/upload", auth: true },
    { name: "My Prescriptions", path: "/prescriptions", auth: true },
    { name: "Medication Schedule", path: "/schedule", auth: true },
    { name: "Create Reminder", path: "/set-reminder", auth: true },
    { name: "Check Symptoms", path: "/prediction" },
  ];

  const visibleItems = navItems.filter((item) =>
    authStatus ? item.auth !== false : item.auth !== true
  );

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-[#f7f7f1]/90 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)]"
      >
        <Container>
          <div className="h-[68px] sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Logo Mark + Wordmark */}
            <div
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0"
              onClick={() => navigate(authStatus ? "/upload" : "/login")}
            >
              {/* Minimalist Geometric Beacon Icon */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1d1f21] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#244cff]" />
              </div>

              <span className="font-['Inter'] text-[16px] sm:text-[19px] font-bold tracking-tight text-[#000000] whitespace-nowrap">
                CareSentry
              </span>
            </div>

            {/* Center: Desktop Navigation Links in Mage Editorial Style */}
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6" aria-label="Desktop Navigation">
              {visibleItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/upload" && location.pathname === "/");
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`font-['Inter'] text-[13.5px] xl:text-[15px] font-medium transition-colors cursor-pointer relative py-1 whitespace-nowrap ${
                      isActive
                        ? "text-[#000000] font-semibold"
                        : "text-[#2b2b2b] hover:text-[#000000]"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#244cff] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {authStatus ? (
                <>
                  <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#ffffff] border border-[rgba(0,0,0,0.1)] rounded-full text-xs text-[#2b2b2b] font-medium shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#00c978]" />
                    <span>{user?.username || "Patient"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/upload")}
                    className="btn-cobalt text-xs sm:text-sm px-2.5 sm:px-3.5 shrink-0"
                    style={{ height: "36px" }}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    <span>Scan Rx</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                    className="hidden sm:inline-flex btn-obsidian text-xs sm:text-sm px-2.5 sm:px-3.5 shrink-0"
                    style={{ height: "36px" }}
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="hidden sm:inline-flex btn-ghost-link text-sm shrink-0"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="btn-cobalt text-xs sm:text-sm px-3 sm:px-4 shrink-0"
                    style={{ height: "36px" }}
                  >
                    Get Started
                  </button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden p-1.5 text-[#000000] cursor-pointer rounded hover:bg-black/5 shrink-0"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-[#000000]/40 backdrop-blur-xs transition-opacity"
          />

          <div className="relative ml-auto w-72 bg-[#f7f7f1] p-6 h-full flex flex-col justify-between z-10 border-l border-[rgba(0,0,0,0.1)] shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1d1f21] flex items-center justify-center text-white">
                    <span className="w-2 h-2 rounded-full bg-[#244cff]" />
                  </div>
                  <span className="font-bold text-[#000000]">CareSentry</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 cursor-pointer hover:bg-black/5 rounded"
                  aria-label="Close Navigation"
                >
                  <X className="w-5 h-5 text-[#2b2b2b]" />
                </button>
              </div>

              {authStatus && (
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[#ffffff] border border-[rgba(0,0,0,0.08)] rounded-full text-xs text-[#2b2b2b] font-medium w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#00c978]" />
                  <span>{user?.username || "Patient"}</span>
                </div>
              )}

              <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile Navigation">
                {visibleItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/upload" && location.pathname === "/");
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate(item.path);
                      }}
                      className={`text-left text-sm py-2 px-3 rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#ffffff] text-[#000000] font-semibold border border-[rgba(0,0,0,0.06)]"
                          : "text-[#2b2b2b] hover:bg-[#ffffff]/60"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] flex flex-col gap-2.5">
              {authStatus ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate("/upload");
                    }}
                    className="w-full btn-cobalt"
                    style={{ height: "40px" }}
                  >
                    Scan Rx
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDrawerOpen(false);
                      await logout();
                      navigate("/login");
                    }}
                    className="w-full btn-obsidian"
                    style={{ height: "40px" }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate("/login");
                    }}
                    className="w-full btn-outline-pill"
                    style={{ height: "40px" }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate("/register");
                    }}
                    className="w-full btn-cobalt"
                    style={{ height: "40px" }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
