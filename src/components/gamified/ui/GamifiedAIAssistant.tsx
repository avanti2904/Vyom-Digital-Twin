/**
 * VYOM — Gamified Floating AI Learning Assistant
 * Friendly, encouraging aerospace AI teacher explaining decisions,
 * offering adaptive hints, and providing real-world space engineering context.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';

export function GamifiedAIAssistant() {
  const aiMessage = useGamifiedStore((s) => s.aiMessage);
  const aiMood = useGamifiedStore((s) => s.aiMood);
  const isAiExpanded = useGamifiedStore((s) => s.isAiExpanded);
  const toggleAiExpanded = useGamifiedStore((s) => s.toggleAiExpanded);

  const moodColors = {
    happy: '#00ff88',
    warning: '#ff9f0a',
    thinking: '#00d4ff',
    neutral: '#38bdf8',
  };

  const activeColor = moodColors[aiMood] || '#00d4ff';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 500,
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {isAiExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(5, 12, 28, 0.94)',
              border: `1px solid ${activeColor}55`,
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 10,
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px ${activeColor}22`,
              backdropFilter: 'blur(16px)',
              position: 'relative',
            }}
          >
            {/* Header / Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: activeColor,
                    boxShadow: `0 0 8px ${activeColor}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 10,
                    fontWeight: 800,
                    color: activeColor,
                    letterSpacing: '0.1em',
                  }}
                >
                  VYOM AI MENTOR
                </span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    padding: '1px 6px',
                    borderRadius: 8,
                    fontSize: 8,
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {aiMood.toUpperCase()}
                </span>
              </div>

              <button
                onClick={toggleAiExpanded}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 2,
                }}
                title="Minimize assistant"
              >
                ✕
              </button>
            </div>

            {/* AI Speech Bubble */}
            <div
              style={{
                color: '#e2e8f0',
                fontSize: 12,
                lineHeight: 1.5,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {aiMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Avatar Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleAiExpanded}
        style={{
          pointerEvents: 'auto',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0b1a3a, #030816)',
          border: `2px solid ${activeColor}`,
          boxShadow: `0 0 20px ${activeColor}44, 0 4px 12px rgba(0,0,0,0.8)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#ffffff',
          fontSize: 20,
          position: 'relative',
        }}
        title="VYOM AI Teacher"
      >
        <span>🤖</span>

        {/* Pulsing Neural Wave Ring */}
        <span
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `1px solid ${activeColor}`,
            opacity: 0.6,
            animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      </motion.button>
    </div>
  );
}
