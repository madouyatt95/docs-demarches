// ============================================
// DOCSBOX WEB - Onboarding Modal Component
// Welcome screen for new users
// ============================================

'use client';

import { useState, useEffect } from 'react';

const slides = [
    {
        emoji: '📦',
        title: 'Bienvenue sur DocsBox',
        description: 'Gérez tous vos documents administratifs en un seul endroit',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    },
    {
        emoji: '📱',
        title: 'Scanner intelligent',
        description: 'Scannez et organisez vos documents avec l\'OCR automatique',
        gradient: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
    },
    {
        emoji: '📋',
        title: 'Démarches simplifiées',
        description: 'Suivez vos démarches administratives avec des checklists',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    },
    {
        emoji: '🔗',
        title: 'Partage sécurisé',
        description: 'Partagez vos documents en créant des liens temporaires',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    },
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        // Check if onboarding was already completed
        const hasSeenOnboarding = localStorage.getItem('docsbox_onboarding_completed');
        if (!hasSeenOnboarding) {
            // Small delay for smoother appearance
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('docsbox_onboarding_completed', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const slide = slides[currentSlide];
    const isLastSlide = currentSlide === slides.length - 1;

    return (
        <div className="onboarding-backdrop">
            <div className="onboarding-modal">
                {/* Progress dots */}
                <div className="onboarding-progress">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`onboarding-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>

                {/* Slide content */}
                <div className="onboarding-content">
                    <div
                        className="onboarding-icon"
                        style={{ background: slide.gradient }}
                    >
                        {slide.emoji}
                    </div>
                    <h2 className="onboarding-title">{slide.title}</h2>
                    <p className="onboarding-description">{slide.description}</p>
                </div>

                {/* Actions */}
                <div className="onboarding-actions">
                    <button className="onboarding-btn primary" onClick={handleNext}>
                        {isLastSlide ? 'Commencer' : 'Suivant'}
                    </button>
                    {!isLastSlide && (
                        <button className="onboarding-btn secondary" onClick={handleSkip}>
                            Passer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
