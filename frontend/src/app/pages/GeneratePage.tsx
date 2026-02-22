import { useState, useEffect } from "react";
import { Sparkles, Wand2, Loader2, Play, ChevronRight, Check, Film, User, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useVideos } from "../context/VideoContext";
import clsx from "clsx";

type CharactersApi = Record<string, { image?: string; reference_id?: string; color?: string }>;

export function GeneratePage() {
  const { addVideo, toggleSave, refreshVideos } = useVideos();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [videoLength, setVideoLength] = useState<number | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [apiCharacters, setApiCharacters] = useState<CharactersApi>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<any | null>(null);
  
  const [generationProgress, setGenerationProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("");

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then(setApiCharacters)
      .catch(() => {});
  }, []);

  const lengths = [
    { duration: 30, label: "Short (30s)" },
    { duration: 45, label: "Medium (45s)" },
    { duration: 60, label: "Long (60s)" },
  ];

  const handleNext = () => {
    if (step === 1 && topic.trim()) setStep(2);
    else if (step === 2 && videoLength) setStep(3);
    else if (step === 3 && selectedCharacters.length === 2) handleGenerate();
  };

  const handleGenerate = async () => {
    const character1 = selectedCharacters[0];
    const character2 = selectedCharacters[1];
    const duration = videoLength ?? 30;
    if (!character1 || !character2) return;
    setIsGenerating(true);
    setGeneratedVideo(null);
    setGenerationProgress(0);
    setLoadingStage("Generating video...");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character1, character2, topic: topic.trim() || "BrainRot Academy", duration }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setLoadingStage(err.error || "Generation failed");
        return;
      }
      await refreshVideos();
      setGenerationProgress(100);
      setGeneratedVideo({
        id: "generated",
        title: topic,
        explanation: `Your video about ${topic}.`,
        character: { name: character1, avatar: "🤖", color: apiCharacters[character1]?.color || "#000" },
        showTheme: { name: character1, avatar: "🤖", color: apiCharacters[character1]?.color || "#000", characters: [character1, character2] },
        category: "Education",
        duration: `0:${duration}`,
      });
      setStep(5);
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return topic.trim().length > 0;
    if (step === 2) return videoLength !== null;
    if (step === 3) return selectedCharacters.length === 2;
    return false;
  };

  const toggleCharacter = (name: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : prev.length < 2 ? [...prev, name] : prev
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[rgb(var(--bg-primary))] pb-24">
      <div className="pt-6 pb-6 px-6 max-w-2xl mx-auto flex flex-col h-full min-h-[500px]">
        
        {/* Header */}
        {!generatedVideo && !isGenerating && (
          <div className="flex items-center justify-between mb-8">
             <div>
               <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Create Video</h1>
               <p className="text-[rgb(var(--text-secondary))] text-sm">Step {step} of 3</p>
             </div>
             <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] rounded-xl flex items-center justify-center shadow-lg">
                <Wand2 className="w-5 h-5 text-white" />
             </div>
          </div>
        )}

        {/* Loading Screen */}
        {isGenerating && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
           >
              <div className="relative w-32 h-32">
                 <div className="absolute inset-0 rounded-full border-4 border-[rgb(var(--bg-tertiary))]" />
                 <motion.div 
                   className="absolute inset-0 rounded-full border-4 border-[rgb(var(--accent-primary))] border-t-transparent"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[rgb(var(--accent-primary))]" />
                 </div>
              </div>
              
              <div className="space-y-2 max-w-xs mx-auto w-full">
                 <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">{loadingStage}</h2>
                 <div className="h-2 w-full bg-[rgb(var(--bg-tertiary))] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[rgb(var(--accent-primary))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                    />
                 </div>
                 <p className="text-sm text-[rgb(var(--text-tertiary))]">Creating your video magic...</p>
              </div>
           </motion.div>
        )}

        {/* Form Steps */}
        <AnimatePresence mode="wait">
            {/* Step 1: Topic */}
            {step === 1 && !isGenerating && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <label className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center text-sm">1</span>
                  What do you want to learn?
                </label>
                <div className="relative flex-1">
                  <textarea
                    placeholder="e.g., Explain Quantum Physics to a 5 year old..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-40 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] rounded-2xl px-5 py-4 text-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 resize-none shadow-sm"
                    autoFocus
                  />
                  <Sparkles className="absolute right-4 top-4 w-5 h-5 text-[rgb(var(--accent-secondary))] opacity-50" />
                </div>
              </motion.div>
            )}

            {/* Step 2: Length */}
            {step === 2 && !isGenerating && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <label className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center text-sm">2</span>
                  Video Length
                </label>
                <div className="grid gap-3">
                  {lengths.map((len) => (
                    <button
                      key={len.duration}
                      onClick={() => setVideoLength(len.duration)}
                      className={clsx(
                        "p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                        videoLength === len.duration
                          ? "bg-[rgb(var(--bg-secondary))] border-[rgb(var(--accent-primary))] shadow-md"
                          : "bg-[rgb(var(--bg-tertiary))]/50 border-transparent hover:bg-[rgb(var(--bg-tertiary))]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          videoLength === len.duration ? "bg-[rgb(var(--accent-primary))] text-white" : "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-tertiary))]"
                        )}>
                          <Film className="w-5 h-5" />
                        </div>
                        <span className={clsx(
                          "font-bold text-lg",
                          videoLength === len.duration ? "text-[rgb(var(--text-primary))]" : "text-[rgb(var(--text-secondary))]"
                        )}>
                          {len.label}
                        </span>
                      </div>
                      {videoLength === len.duration && (
                        <div className="w-6 h-6 bg-[rgb(var(--accent-primary))] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Character */}
            {step === 3 && !isGenerating && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <label className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center text-sm">3</span>
                  Choose a Host
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(apiCharacters).map(([name, data]) => {
                    const color = data?.color || "#666";
                    const selected = selectedCharacters.includes(name);
                    const disabled = selectedCharacters.length >= 2 && !selected;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => !disabled && toggleCharacter(name)}
                        className={clsx(
                          "relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                          selected
                            ? "bg-[rgb(var(--bg-secondary))] border-[rgb(var(--accent-primary))] shadow-md"
                            : "bg-[rgb(var(--bg-tertiary))]/30 border-transparent hover:bg-[rgb(var(--bg-tertiary))]/50",
                          disabled && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm border-2"
                          style={{
                            backgroundColor: color + "40",
                            borderColor: selected ? color : "transparent",
                          }}
                        >
                          {name.charAt(0)}
                        </div>
                        <span className={clsx(
                          "font-bold text-sm text-center",
                          selected ? "text-[rgb(var(--text-primary))]" : "text-[rgb(var(--text-secondary))]"
                        )}>
                          {name}
                        </span>
                        {selected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[rgb(var(--accent-primary))] rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Result / Generating State */}
            {step === 5 && (
               <motion.div
               key="result"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center h-full"
             >
               <div className="w-full aspect-[9/16] max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
                 {/* Simulated Video Player */}
                 <img 
                   src={generatedVideo?.thumbnailUrl} 
                   alt="Generated Video"
                   className="w-full h-full object-cover opacity-80"
                 />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                     <Play className="w-8 h-8 fill-white text-white ml-1" />
                   </div>
                 </div>
 
                 {/* Overlays */}
                 <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-2xl">{generatedVideo?.showTheme?.avatar}</span>
                     <span className="text-white font-bold text-sm bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        AI Generated
                     </span>
                   </div>
                   <h3 className="text-white font-bold text-xl leading-tight mb-1">
                     {generatedVideo?.title}
                   </h3>
                   <div className="flex gap-2 text-white/70 text-xs">
                      <span>{generatedVideo?.duration}s</span>
                      <span>•</span>
                      <span>Generated just now</span>
                   </div>
                 </div>
               </div>
 
               <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 rounded-full text-sm font-bold mb-4">
                     <Check className="w-4 h-4" />
                     Saved to Library
                  </div>
                  
                  <div className="flex gap-3 w-full max-w-sm">
                    <button 
                      onClick={() => {
                        setGeneratedVideo(null);
                        setStep(1);
                        setTopic("");
                      }}
                      className="flex-1 py-3 rounded-xl bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] font-semibold hover:bg-[rgb(var(--bg-tertiary))]/80 transition-colors"
                    >
                      Create Another
                    </button>
                    <button className="flex-1 py-3 rounded-xl bg-[rgb(var(--accent-primary))] text-white font-bold shadow-lg shadow-[rgb(var(--accent-primary))]/30 hover:scale-105 transition-transform">
                      View in Feed
                    </button>
                  </div>
               </div>
             </motion.div>
            )}
        </AnimatePresence>

        {/* Footer Navigation (only for steps 1-3) */}
        {step < 5 && !isGenerating && (
           <div className="mt-8">
             <button
               onClick={handleNext}
               disabled={!canProceed() && !isGenerating}
               className={clsx(
                 "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
                 (canProceed() || isGenerating)
                   ? "bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white shadow-[rgb(var(--gradient-from))]/30"
                   : "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-tertiary))] cursor-not-allowed shadow-none"
               )}
             >
                 <>
                   {step === 3 ? "Generate Video" : "Continue"}
                   {step < 3 && <ChevronRight className="w-5 h-5" />}
                   {step === 3 && <Wand2 className="w-5 h-5" />}
                 </>
             </button>
             
             {step > 1 && !isGenerating && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="w-full py-3 mt-2 text-[rgb(var(--text-tertiary))] font-semibold text-sm hover:text-[rgb(var(--text-primary))]"
                >
                  Back
                </button>
             )}
           </div>
        )}
      </div>
    </div>
  );
}
