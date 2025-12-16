// ============================================
// DOCSBOX WEB - Scanner Modal with OCR (Premium Feature)
// ============================================

'use client';

import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ScannerModal({ isOpen, onClose, onSuccess }: ScannerModalProps) {
    const [step, setStep] = useState<'capture' | 'processing' | 'review' | 'saving'>('capture');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        { id: 'cat_identity', name: 'Identité', emoji: '🪪' },
        { id: 'cat_housing', name: 'Logement', emoji: '🏠' },
        { id: 'cat_work', name: 'Travail', emoji: '💼' },
        { id: 'cat_vehicle', name: 'Véhicule', emoji: '🚗' },
        { id: 'cat_finance', name: 'Finance', emoji: '💰' },
        { id: 'cat_health', name: 'Santé', emoji: '🏥' },
        { id: 'cat_education', name: 'Éducation', emoji: '🎓' },
    ];

    const resetState = () => {
        setStep('capture');
        setCapturedImage(null);
        setCapturedFile(null);
        setExtractedText('');
        setProgress(0);
        setTitle('');
        setCategoryId('');
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

    const handleSave = async () => {
        if (!capturedFile || !title.trim()) return;

        setStep('saving');
        setError(null);

        try {
            // First upload the file
            const formData = new FormData();
            formData.append('file', capturedFile);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error('Erreur lors de l\'upload du fichier');
            }

            const uploadData = await uploadRes.json();

            // Then create the document with OCR text
            const docRes = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    categoryId: categoryId || null,
                    filePath: uploadData.filePath || uploadData.path,
                    fileSize: capturedFile.size,
                    mimeType: capturedFile.type,
                    ocrText: extractedText, // Save OCR text
                }),
            });

            if (!docRes.ok) {
                throw new Error('Erreur lors de la création du document');
            }

            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Save error:', err);
            setError(err.message || 'Erreur lors de la sauvegarde');
            setStep('review');
        }
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

                            {error && (
                                <div className="modal-error">{error}</div>
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
                                <label className="form-label">Catégorie</label>
                                <select
                                    className="form-input"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.emoji} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Texte extrait (OCR)</label>
                                <textarea
                                    className="form-input scanner-text-area"
                                    value={extractedText}
                                    onChange={(e) => setExtractedText(e.target.value)}
                                    rows={4}
                                    placeholder="Aucun texte détecté"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Saving */}
                    {step === 'saving' && (
                        <div className="scanner-processing">
                            <div className="dark-spinner"></div>
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
                                Sauvegarde en cours...
                            </p>
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
