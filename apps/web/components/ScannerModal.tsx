// ============================================
// DOCSBOX WEB - Scanner Modal with OCR (Hybrid: Basic + Enhanced)
// ============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { usePremium } from '@/lib/premium-context';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface EnhancedScanResult {
    detectedType: string;
    documentName: string;
    suggestedCategory: string | null;
    extractedFields: Record<string, any>;
    confidence: number;
}

interface ScanUsage {
    used: number;
    remaining: number;
    limit: number;
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

    // Enhanced detection state
    const { isPremium } = usePremium();
    const [enhancedResult, setEnhancedResult] = useState<EnhancedScanResult | null>(null);
    const [scanUsage, setScanUsage] = useState<ScanUsage | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);

    // AI classification state
    const [aiClassification, setAiClassification] = useState<{
        categoryId: string;
        confidence: number;
        suggestedTitle?: string;
        method: string;
    } | null>(null);
    const [isClassifying, setIsClassifying] = useState(false);

    const categories = [
        { id: 'cat_identity', name: 'Identité', emoji: '🪪' },
        { id: 'cat_housing', name: 'Logement', emoji: '🏠' },
        { id: 'cat_work', name: 'Travail', emoji: '💼' },
        { id: 'cat_vehicle', name: 'Véhicule', emoji: '🚗' },
        { id: 'cat_finance', name: 'Finance', emoji: '💰' },
        { id: 'cat_health', name: 'Santé', emoji: '🏥' },
        { id: 'cat_education', name: 'Éducation', emoji: '🎓' },
    ];

    // Fetch scan usage on mount
    useEffect(() => {
        if (isOpen && isPremium) {
            fetchScanUsage();
        }
    }, [isOpen, isPremium]);

    const fetchScanUsage = async () => {
        try {
            const res = await fetch('/api/enhanced-scans');
            if (res.ok) {
                const data = await res.json();
                setScanUsage(data);
            }
        } catch (err) {
            console.error('Error fetching scan usage:', err);
        }
    };

    const resetState = () => {
        setStep('capture');
        setCapturedImage(null);
        setCapturedFile(null);
        setExtractedText('');
        setProgress(0);
        setTitle('');
        setCategoryId('');
        setError(null);
        setEnhancedResult(null);
        setIsEnhancing(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setCapturedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        setCapturedFile(file);

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

            const text = result.data.text;
            setExtractedText(text);
            const firstLine = text.split('\n')[0]?.trim() || '';
            const suggestedTitle = firstLine.slice(0, 50) || 'Document scanné';
            setTitle(suggestedTitle);

            // AI Classification - call /api/classify with extracted text
            if (text.trim().length > 20) {
                setIsClassifying(true);
                try {
                    const classifyRes = await fetch('/api/classify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text }),
                    });

                    if (classifyRes.ok) {
                        const classifyData = await classifyRes.json();
                        setAiClassification(classifyData);

                        // Auto-fill category if confidence is high enough
                        if (classifyData.categoryId && classifyData.confidence >= 0.5) {
                            setCategoryId(classifyData.categoryId);
                        }

                        // Update title if AI suggests one
                        if (classifyData.suggestedTitle) {
                            setTitle(classifyData.suggestedTitle);
                        }
                    }
                } catch (classifyError) {
                    console.error('Classification error:', classifyError);
                    // Silent fail - classification is optional
                } finally {
                    setIsClassifying(false);
                }
            }

            setStep('review');
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Erreur lors de l\'analyse du document. Veuillez réessayer.');
            setStep('capture');
        }
    };


    const handleEnhanceDetection = async () => {
        if (!capturedFile || !isPremium) return;

        if (scanUsage && scanUsage.remaining <= 0) {
            setError('Vous avez atteint la limite de 5 scans améliorés ce mois-ci.');
            return;
        }

        setIsEnhancing(true);
        setError(null);

        try {
            const usageRes = await fetch('/api/enhanced-scans', { method: 'POST' });
            if (!usageRes.ok) {
                const usageData = await usageRes.json();
                setError(usageData.error || 'Limite de scans atteinte');
                setIsEnhancing(false);
                return;
            }

            const newUsage = await usageRes.json();
            setScanUsage(newUsage);

            const formData = new FormData();
            formData.append('file', capturedFile);

            const res = await fetch('/api/mindee', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erreur lors de l\'analyse avancée');
            }

            const result = await res.json();
            setEnhancedResult(result);

            if (result.suggestedCategory) {
                setCategoryId(result.suggestedCategory);
            }

            if (result.documentName && result.documentName !== 'Document') {
                setTitle(result.documentName);
            }

        } catch (err: any) {
            console.error('Enhanced detection error:', err);
            setError(err.message || 'Erreur lors de l\'analyse avancée');
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSave = async () => {
        if (!capturedFile || !title.trim()) return;

        setStep('saving');
        setError(null);

        try {
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

            const docRes = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    categoryId: categoryId || null,
                    filePath: uploadData.filePath || uploadData.path,
                    fileSize: capturedFile.size,
                    mimeType: capturedFile.type,
                    ocrText: extractedText,
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
                <div className="modal-header">
                    <h2>Scanner avec OCR</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal-body">
                    {step === 'capture' && (
                        <div className="scanner-capture-zone">
                            <div className="scanner-icon">📷</div>
                            <h3>Photographiez votre document</h3>
                            <p>L'OCR va extraire le texte automatiquement</p>

                            {error && <div className="modal-error">{error}</div>}

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

                    {step === 'processing' && (
                        <div className="scanner-processing">
                            {capturedImage && (
                                <img src={capturedImage} alt="Document" className="scanner-preview-img" />
                            )}
                            <div className="scanner-progress">
                                <div className="scanner-progress-bar">
                                    <div className="scanner-progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p>Analyse OCR en cours... {progress}%</p>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="scanner-review">
                            {capturedImage && (
                                <img src={capturedImage} alt="Document" className="scanner-preview-img small" />
                            )}

                            {error && <div className="modal-error">{error}</div>}

                            {enhancedResult && (
                                <div className="enhanced-result-card">
                                    <div className="enhanced-result-header">
                                        <span className="enhanced-badge">✨ Détection avancée</span>
                                        <span className="enhanced-confidence">
                                            {Math.round(enhancedResult.confidence * 100)}% confiance
                                        </span>
                                    </div>
                                    <div className="enhanced-result-type">
                                        <strong>Type détecté :</strong> {enhancedResult.documentName}
                                    </div>
                                    {Object.keys(enhancedResult.extractedFields).length > 0 && (
                                        <div className="enhanced-result-fields">
                                            <strong>Champs extraits :</strong>
                                            <ul>
                                                {Object.entries(enhancedResult.extractedFields).map(([key, value]) => (
                                                    <li key={key}>
                                                        <span className="field-key">{key}:</span>{' '}
                                                        <span className="field-value">{String(value)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isPremium && !enhancedResult && (
                                <div className="enhance-detection-section">
                                    <button
                                        className="enhance-btn"
                                        onClick={handleEnhanceDetection}
                                        disabled={isEnhancing || (scanUsage?.remaining === 0)}
                                    >
                                        {isEnhancing ? '⏳ Analyse en cours...' : '🚀 Améliorer la détection'}
                                    </button>
                                    {scanUsage && (
                                        <p className="scan-usage-info">
                                            {scanUsage.remaining > 0
                                                ? `📊 ${scanUsage.remaining}/${scanUsage.limit} scans restants ce mois`
                                                : '⚠️ Limite atteinte (renouvellement mensuel)'}
                                        </p>
                                    )}
                                </div>
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

                    {step === 'saving' && (
                        <div className="scanner-processing">
                            <div className="dark-spinner"></div>
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
                                Sauvegarde en cours...
                            </p>
                        </div>
                    )}
                </div>

                {step === 'review' && (
                    <div className="modal-footer">
                        <button className="scanner-retry-btn" onClick={resetState}>
                            ↩️ Reprendre
                        </button>
                        <button className="submit-btn" onClick={handleSave} disabled={!title.trim()}>
                            Enregistrer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
