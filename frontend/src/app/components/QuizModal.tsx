/**
 * STRUCTURE TRACE:
 * QuizModal is rendered by HomePage (pages/HomePage.tsx).
 * HomePage → QuizModal (this file). Receives video + onClose/onComplete.
 */
import { motion, AnimatePresence } from "motion/react";
import { X, Check, AlertCircle, Trophy, Zap } from "lucide-react";
import { useState } from "react";
import { VideoCard } from "../types";
import clsx from "clsx";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoCard | null;
  onComplete: (score: number) => void;
}

export function QuizModal({
  isOpen,
  onClose,
  video,
  onComplete,
}: QuizModalProps) {
  console.log("QuizModal component rendered", { isOpen, videoId: video?.id, hasQuiz: !!video?.quiz });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!video || !video.quiz) return null;

  const quiz = video.quiz;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === quiz[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalScore =
        score + (selectedAnswer === quiz[currentQuestion].correctAnswer ? 1 : 0);
      setScore(finalScore);
      setIsComplete(true);
      setTimeout(() => {
        onComplete(finalScore);
      }, 2000);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    onClose();
  };

  const currentQuiz = quiz[currentQuestion];
  const pointsEarned = score;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isComplete) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[rgb(var(--bg-secondary))] rounded-3xl border border-[rgb(var(--border-color))] max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
          >
            {!isComplete ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-[rgb(var(--gradient-from))]/10 to-[rgb(var(--gradient-to))]/10 border-b border-[rgb(var(--border-color))] p-6 flex-shrink-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] rounded-xl flex items-center justify-center text-2xl shadow-sm text-white">
                        {video.character.avatar}
                      </div>
                      <div>
                        <h2 className="text-[rgb(var(--text-primary))] font-bold text-lg">Quick Quiz!</h2>
                        <p className="text-[rgb(var(--text-tertiary))] text-sm">Test your knowledge</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-[rgb(var(--text-tertiary))]" />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[rgb(var(--bg-tertiary))] rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((currentQuestion + 1) / quiz.length) * 100}%`,
                        }}
                        className="bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] h-full rounded-full"
                      />
                    </div>
                    <span className="text-[rgb(var(--text-secondary))] text-xs font-semibold">
                      {currentQuestion + 1}/{quiz.length}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="p-6 overflow-y-auto flex-1">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-2"
                  >
                    <h3 className="text-[rgb(var(--text-primary))] text-xl font-bold mb-6 leading-tight">
                      {currentQuiz.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3">
                      {currentQuiz.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === currentQuiz.correctAnswer;
                        const showCorrect = showResult && isCorrect;
                        const showWrong = showResult && isSelected && !isCorrect;

                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            whileTap={{ scale: showResult ? 1 : 0.98 }}
                            className={clsx(
                              "w-full p-4 rounded-xl text-left transition-all border-2",
                              showCorrect
                                ? "bg-green-500/10 border-green-500 ring-1 ring-green-500/50"
                                : showWrong
                                ? "bg-red-500/10 border-red-500 ring-1 ring-red-500/50"
                                : isSelected
                                ? "bg-[rgb(var(--gradient-from))]/10 border-[rgb(var(--gradient-from))]"
                                : "bg-[rgb(var(--bg-tertiary))]/30 border-[rgb(var(--border-color))] hover:border-[rgb(var(--gradient-from))]/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className={clsx("font-medium", isSelected ? "text-[rgb(var(--text-primary))]" : "text-[rgb(var(--text-secondary))]")}>{option}</span>
                              {showCorrect && (
                                <Check className="w-5 h-5 text-green-500" />
                              )}
                              {showWrong && (
                                <X className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={clsx(
                            "mt-6 p-4 rounded-xl border",
                            selectedAnswer === currentQuiz.correctAnswer
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-red-500/10 border-red-500/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {selectedAnswer === currentQuiz.correctAnswer ? (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p
                                className={clsx(
                                  "font-bold mb-1",
                                  selectedAnswer === currentQuiz.correctAnswer
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                )}
                              >
                                {selectedAnswer === currentQuiz.correctAnswer
                                  ? "Correct! 🎉"
                                  : "Not quite!"}
                              </p>
                              <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                                {currentQuiz.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="border-t border-[rgb(var(--border-color))] p-6 bg-[rgb(var(--bg-secondary))] flex-shrink-0">
                  {!showResult ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedAnswer === null}
                      className={clsx(
                        "w-full py-3.5 rounded-xl font-bold transition-all shadow-lg",
                        selectedAnswer !== null
                          ? "bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-[rgb(var(--gradient-from))]/30"
                          : "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-tertiary))] cursor-not-allowed shadow-none"
                      )}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-lg shadow-[rgb(var(--gradient-from))]/30"
                    >
                      {currentQuestion < quiz.length - 1
                        ? "Next Question →"
                        : "See Results"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Results Screen */
              <div className="p-8 text-center flex flex-col h-full items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-yellow-500/50">
                    <Trophy className="w-12 h-12 text-white fill-white" />
                  </div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2"
                  >
                    Quiz Complete!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[rgb(var(--text-secondary))]"
                  >
                    Great job learning about
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[rgb(var(--accent-primary))] font-bold text-lg mt-1"
                  >
                    {video.title}
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-[rgb(var(--gradient-from))]/10 to-[rgb(var(--gradient-to))]/10 rounded-2xl p-6 border border-[rgb(var(--gradient-from))]/20 mb-8 w-full"
                >
                  <div className="text-5xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    {score}/{quiz.length}
                  </div>
                  <div className="text-[rgb(var(--text-tertiary))] mb-4 text-sm font-medium uppercase tracking-wide">Correct Answers</div>
                  <div className="flex items-center justify-center gap-2 text-yellow-500 bg-yellow-500/10 py-2 rounded-lg">
                    <Zap className="w-5 h-5 fill-yellow-500" />
                    <span className="text-xl font-bold">
                      {pointsEarned} point{pointsEarned !== 1 ? "s" : ""} earned
                    </span>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleClose}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-lg shadow-[rgb(var(--gradient-from))]/30 hover:scale-[1.02] transition-transform"
                >
                  Continue Watching
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
