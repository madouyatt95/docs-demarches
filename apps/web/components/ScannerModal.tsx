// ============================================
// DOCSBOX WEB - Scanner Modal with OCR (Premium Feature)
// ============================================

'use client';

import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (documentData: {
        title: string;
        file: File;
        extractedText: string;
    }) => void;
}

export function ScannerModal({ isOpen, onClose, onSuccess }: ScannerModalProps) {
    const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setStep('capture');
        setCapturedImage(null);
        setCapturedFile(null);
        setExtractedText('');
        setProgress(0);
        setTitle('');
        setError(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setCapturedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        setCapturedFile(file);

        // Start OCR processing
        setStep('processing');
        setError(null);

        try {
            const result = await Tesseract.recognize(file, 'fra+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            setExtractedText(result.data.text);

            // Try to generate a title from the first line
            const firstLine = result.data.text.split('\n')[0]?.trim() || '';
            const suggestedTitle = firstLine.slice(0, 50) || 'Document scanné';
            setTitle(suggestedTitle);

            setStep('review');
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Erreur lors de l\'analyse du document. Veuillez réessayer.');
            setStep('capture');
        }
    };

    const handleSave = () => {
        if (!capturedFile || !title.trim()) return;

        onSuccess({
            title: title.trim(),
            file: capturedFile,
            extractedText,
        });
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>Scanner avec OCR</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Step 1: Capture */}
                    {step === 'capture' && (
                        <div className="scanner-capture-zone">
                            <div className="scanner-icon">📷</div>
                            <h3>Photographiez votre document</h3>
                            <p>L'OCR va extraire le texte automatiquement</p>

                            {error && (
                                <div className="modal-error">{error}</div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleCapture}
                                style={{ display: 'none' }}
                            />

                            <button
                                className="scanner-capture-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📸 Prendre une photo
                            </button>

                            <button
                                className="scanner-gallery-btn"
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.removeAttribute('capture');
                                        fileInputRef.current.click();
                                        fileInputRef.current.setAttribute('capture', 'environment');
                                    }
                                }}
                            >
                                🖼️ Choisir depuis la galerie
                            </button>
                        </div>
                    )}

                    {/* Step 2: Processing */}
                    {step === 'processing' && (
                        <div className="scanner-processing">
                            {capturedImage && (
                                <img
                                    src={capturedImage}
                                    alt="Document capturé"
                                    className="scanner-preview-img"
                                />
                            )}
                            <div className="scanner-progress">
                                <div className="scanner-progress-bar">
                                    <div
                                        className="scanner-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p>Analyse OCR en cours... {progress}%</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 'review' && (
                        <div className="scanner-review">
                            {capturedImage && (
                                <img
                                    src={capturedImage}
                                    alt="Document capturé"
                                    className="scanner-preview-img small"
                                />
                            )}

                            <div className="form-group">
                                <label className="form-label">Titre du document</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nom du document"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Texte extrait (OCR)</label>
                                <textarea
                                    className="form-input scanner-text-area"
                                    value={extractedText}
                                    onChange={(e) => setExtractedText(e.target.value)}
                                    rows={6}
                                    placeholder="Aucun texte détecté"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'review' && (
                    <div className="modal-footer">
                        <button className="scanner-retry-btn" onClick={resetState}>
                            ↩️ Reprendre
                        </button>
                        <button
                            className="submit-btn"
                            onClick={handleSave}
                            disabled={!title.trim()}
                        >
                            Enregistrer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
