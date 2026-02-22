import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Brain, User, Calendar, Mail, ArrowLeft, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface OnboardingData {
  name: string;
  email: string;
  age: string;
  interests: string[];
}

interface LoginPageProps {
  onComplete: (data: OnboardingData) => void;
}

export function LoginPage({ onComplete }: LoginPageProps) {
  const { login, signup } = useAuth();
  
  const [authMode, setAuthMode] = useState<"initial" | "login" | "signup">("initial");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  
  // Signup Form Data
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    email: "",
    age: "",
    interests: [],
  });
  const [password, setPassword] = useState("");

  // Login Form Data
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const subjects = [
    { name: "Science", icon: "🔬", color: "from-blue-500 to-cyan-500" },
    { name: "Technology", icon: "💻", color: "from-purple-500 to-pink-500" },
    { name: "Mathematics", icon: "🔢", color: "from-green-500 to-emerald-500" },
    { name: "Astronomy", icon: "🌌", color: "from-indigo-500 to-blue-500" },
    { name: "Psychology", icon: "🧠", color: "from-pink-500 to-rose-500" },
    { name: "History", icon: "📜", color: "from-yellow-500 to-orange-500" },
    { name: "Biology", icon: "🧬", color: "from-teal-500 to-cyan-500" },
    { name: "Physics", icon: "⚛️", color: "from-purple-500 to-indigo-500" },
    { name: "Chemistry", icon: "⚗️", color: "from-red-500 to-pink-500" },
    { name: "Finance", icon: "💰", color: "from-yellow-500 to-green-500" },
    { name: "Medicine", icon: "⚕️", color: "from-green-500 to-teal-500" },
    { name: "Art", icon: "🎨", color: "from-pink-500 to-purple-500" },
  ];

  const toggleInterest = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(subject)
        ? prev.interests.filter((s) => s !== subject)
        : [...prev.interests, subject],
    }));
  };

  const handleSignupNext = () => {
    if (step === 1) {
      if (formData.name && formData.email && formData.age && password) {
        setStep(2);
      }
    } else if (step === 2) {
      if (formData.interests.length >= 3) {
        signup(formData, password); // Use context signup
      }
    }
  };

  const handleLoginSubmit = () => {
    if (loginEmail && loginPassword) {
      const success = login(loginEmail, loginPassword);
      if (!success) {
        setError("Invalid email or password. Please try again or create an account.");
      } else {
        setError("");
      }
    }
  };

  const handleBack = () => {
    if (authMode === "signup" && step === 2) {
      setStep(1);
    } else {
      setAuthMode("initial");
      setStep(1);
      setError("");
    }
  };

  const canProceedSignupStep1 = formData.name && formData.email && formData.age && password;
  const canProceedSignupStep2 = formData.interests.length >= 3;
  const canProceedLogin = loginEmail && loginPassword;

  return (
    <div className="h-[100dvh] w-full bg-[rgb(var(--bg-primary))] overflow-hidden relative flex flex-col items-center justify-center">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[rgb(var(--gradient-from))] opacity-20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[rgb(var(--gradient-to))] opacity-20 rounded-full blur-[100px]"
        />
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-md h-full flex flex-col z-10">
        
        {/* Header Section */}
        <div className="pt-16 pb-6 px-8 text-center flex-shrink-0 relative">
          {authMode !== "initial" && (
             <button 
               onClick={handleBack}
               className="absolute top-16 left-8 p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
             >
               <ArrowLeft className="w-6 h-6 text-[rgb(var(--text-secondary))]" />
             </button>
          )}

          <motion.div
            layoutId="logo"
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] rounded-3xl mb-6 shadow-2xl shadow-[rgb(var(--gradient-from))]/40"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            layoutId="title"
            className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2 tracking-tight"
          >
            ExplainIt AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[rgb(var(--text-secondary))] text-lg font-medium"
          >
            Learn anything with your favorite characters
          </motion.p>
        </div>

        {/* Auth Mode Selection (Initial State) */}
        <AnimatePresence mode="wait">
          {authMode === "initial" && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-end px-8 pb-12 space-y-4"
            >
              <button
                onClick={() => setAuthMode("signup")}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-lg shadow-[rgb(var(--gradient-from))]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Account
              </button>
              <button
                onClick={() => setAuthMode("login")}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-color))] hover:bg-[rgb(var(--bg-tertiary))] active:scale-[0.98] transition-all"
              >
                Log In
              </button>
              <p className="text-center text-xs text-[rgb(var(--text-tertiary))] mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          )}

          {/* Login Mode */}
          {authMode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col px-8 pb-6 h-full min-h-0"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-[rgb(var(--text-tertiary))] text-sm">
                    Enter your credentials to continue
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500 font-medium leading-tight">{error}</p>
                  </div>
                )}

                <div className="group">
                  <label className="block text-[rgb(var(--text-secondary))] text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-xl px-4 py-3.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                <div className="group">
                  <label className="block text-[rgb(var(--text-secondary))] text-sm font-bold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-xl px-4 py-3.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="pb-4 pt-2 flex-shrink-0">
                <motion.button
                  onClick={handleLoginSubmit}
                  disabled={!canProceedLogin}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                    canProceedLogin
                      ? "bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-[rgb(var(--gradient-from))]/30"
                      : "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-tertiary))] cursor-not-allowed shadow-none"
                  }`}
                >
                  Log In
                  <LogIn className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Signup Mode (Existing Flow) */}
          {authMode === "signup" && (
            <motion.div
               key="signup"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="flex-1 flex flex-col h-full min-h-0"
            >
               {/* Progress Dots */}
               <div className="px-8 mb-6 flex-shrink-0">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                        step >= 1 ? "bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))]" : "bg-[rgb(var(--bg-tertiary))]"
                      }`}
                    />
                    <div
                      className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                        step >= 2 ? "bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))]" : "bg-[rgb(var(--bg-tertiary))]"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-6 no-scrollbar">
                    {step === 1 && (
                      <motion.div
                        key="signup-step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 pb-4"
                      >
                        <div>
                          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-1">
                            Create Account
                          </h2>
                          <p className="text-[rgb(var(--text-tertiary))] text-sm">
                            Let's personalize your learning experience
                          </p>
                        </div>

                        {/* Name Input */}
                        <div className="group">
                          <label className="block text-[rgb(var(--text-secondary))] text-sm font-bold mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-xl px-4 py-3.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-transparent transition-all shadow-sm"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="group">
                          <label className="block text-[rgb(var(--text-secondary))] text-sm font-bold mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-xl px-4 py-3.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-transparent transition-all shadow-sm"
                          />
                        </div>

                        {/* Password Input */}
                        <div className="group">
                          <label className="block text-[rgb(var(--text-secondary))] text-sm font-bold mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                            Password
                          </label>
                          <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-xl px-4 py-3.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-transparent transition-all shadow-sm"
                          />
                        </div>

                        {/* Age Input */}
                        <div className="group">
                          <label className="block text-[rgb(var(--text-secondary))] text-sm font-bold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                            Age
                          </label>
                          <input
                            type="number"
                            placeholder="Enter your age"
                            value={formData.age}
                            onChange={(e) =>
                              setFormData({ ...formData, age: e.target.value })
                            }
                            className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-xl px-4 py-3.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-transparent transition-all shadow-sm"
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="signup-step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-1 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-[rgb(var(--accent-secondary))]" />
                            What are you curious about?
                          </h2>
                          <div className="flex justify-between items-center mt-2">
                             <p className="text-[rgb(var(--text-tertiary))] text-sm">
                               Select at least 3 subjects
                             </p>
                             <span className={`text-xs font-bold px-2 py-1 rounded-full ${formData.interests.length >= 3 ? "bg-green-100 text-green-700" : "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-tertiary))]"}`}>
                               {formData.interests.length}/3 selected
                             </span>
                          </div>
                        </div>

                        {/* Subject Selection Grid */}
                        <div className="grid grid-cols-2 gap-3 pb-4">
                          {subjects.map((subject) => {
                            const isSelected = formData.interests.includes(subject.name);
                            return (
                              <motion.button
                                key={subject.name}
                                onClick={() => toggleInterest(subject.name)}
                                whileTap={{ scale: 0.95 }}
                                className={`relative p-4 rounded-2xl text-center transition-all border ${
                                  isSelected
                                    ? `bg-gradient-to-br ${subject.color} border-transparent shadow-md text-white`
                                    : "bg-[rgb(var(--bg-secondary))] border-[rgb(var(--border-color))] hover:bg-[rgb(var(--bg-tertiary))]"
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"
                                  >
                                    <span className="text-green-600 text-[10px] font-bold">✓</span>
                                  </motion.div>
                                )}
                                <div className="text-3xl mb-2 drop-shadow-sm">{subject.icon}</div>
                                <div
                                  className={`text-xs font-bold tracking-wide ${
                                    isSelected ? "text-white" : "text-[rgb(var(--text-secondary))]"
                                  }`}
                                >
                                  {subject.name}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                </div>

                {/* Footer Button */}
                <div className="px-8 pb-10 pt-2 flex-shrink-0 bg-gradient-to-t from-[rgb(var(--bg-primary))] to-transparent">
                  <motion.button
                    onClick={handleSignupNext}
                    disabled={step === 1 ? !canProceedSignupStep1 : !canProceedSignupStep2}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                      (step === 1 ? canProceedSignupStep1 : canProceedSignupStep2)
                        ? "bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-[rgb(var(--gradient-from))]/30 hover:shadow-[rgb(var(--gradient-from))]/40"
                        : "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-tertiary))] cursor-not-allowed shadow-none"
                    }`}
                  >
                    {step === 1 ? "Continue" : "Get Started"}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
