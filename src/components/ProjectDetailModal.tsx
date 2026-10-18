import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { ShowcaseProject } from '../data/pipCanon';
import { soundEngine } from '../utils/soundEngine';

interface ProjectDetailModalProps {
  project: ShowcaseProject | null;
  onClose: () => void;
  onLaunchWorkshop: (tabId: ShowcaseProject['interactiveTabId']) => void;
  isNightMode: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onLaunchWorkshop,
  isNightMode,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-lightbox-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-2xl border p-6 sm:p-8 shadow-2xl transition-colors ${
          isNightMode
            ? 'bg-[#111524] border-[#2A3252] text-[#F8F5F0]'
            : 'bg-[#FFFDF9] border-[#E8C5D2] text-[#3A2721]'
        }`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-current/10">
          <div>
            <div className="text-xs opacity-75">
              <span>Invention {project.index}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{project.category}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{project.year}</span>
            </div>
            <h2 id="project-lightbox-title" className="text-2xl font-semibold mt-1 tracking-tight">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(0.9);
              onClose();
            }}
            aria-label="Close lightbox"
            className="p-2 rounded-lg border border-current/15 hover:border-current/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
          <div
            className={`md:col-span-6 rounded-xl border p-6 flex items-center justify-center min-h-[240px] ${
              isNightMode ? 'bg-[#0B0E18] border-[#222840]' : 'bg-[#FFF8F1] border-[#EED6DF]'
            }`}
          >
            {!imgError ? (
              <img
                src={project.image}
                alt={project.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="max-h-[220px] w-auto object-contain"
              />
            ) : (
              <div className="text-center p-6">
                <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#A34063]" />
                <span className="text-xs">{project.title}</span>
              </div>
            )}
          </div>

          <div className="md:col-span-6 space-y-4">
            <p className="text-sm leading-relaxed">{project.summary}</p>
            <p className="text-xs opacity-80 leading-relaxed">{project.craftDetail}</p>

            <div className="pt-3 border-t border-current/10 space-y-2">
              {project.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between text-xs">
                  <span className="opacity-70">{spec.label}</span>
                  <span className="font-mono-tabular font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-4">
          <span className="text-xs opacity-75">
            Client Credit: Midnight Nursery · Studio 04
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(1.2);
              onLaunchWorkshop(project.interactiveTabId);
              onClose();
            }}
            className="px-4 py-2.5 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Open Interactive Workshop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
