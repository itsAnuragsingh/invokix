"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { XIcon } from "@phosphor-icons/react"
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoSrc: string
}

export function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  // Handle open/close with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimatingOut(false)
      // Auto-play when opened
      setTimeout(() => {
        videoRef.current?.play().catch(() => {})
      }, 100)
    } else {
      setIsAnimatingOut(true)
      videoRef.current?.pause()
      setTimeout(() => {
        setIsVisible(false)
        setIsAnimatingOut(false)
      }, 300)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 transition-all duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-xl transition-all duration-300 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Modal container */}
      <div
        className={`relative w-full max-w-5xl mx-auto transition-all duration-300 ${
          isAnimatingOut
            ? "scale-95 opacity-0 translate-y-4"
            : "scale-100 opacity-100 translate-y-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect behind video */}
        <div className="absolute -inset-2 bg-indigo-600/20 rounded-3xl blur-2xl pointer-events-none" />

        {/* Video wrapper */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-black">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs text-white/50 font-medium">invokix — product demo</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                id="video-mute-btn"
                className="group flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-full px-3 py-1.5 transition-all duration-200"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <>
                    <SpeakerSlashIcon size={14} className="text-white/70 group-hover:text-white transition-colors" />
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">Unmute</span>
                  </>
                ) : (
                  <>
                    <SpeakerHighIcon size={14} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span className="text-xs text-indigo-400/80 group-hover:text-indigo-300 transition-colors">Mute</span>
                  </>
                )}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                id="video-close-btn"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-red-500/80 border border-white/10 hover:border-red-500/50 transition-all duration-200 group"
                aria-label="Close video"
              >
                <XIcon size={14} className="text-white/70 group-hover:text-white transition-colors" weight="bold" />
              </button>
            </div>
          </div>

          {/* Video element */}
          <video
            ref={videoRef}
            src={videoSrc}
            muted={isMuted}
            loop
            playsInline
            controls={false}
            className="w-full aspect-video object-cover"
          />

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-white/30 mt-3">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 text-xs font-mono">Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  )
}
