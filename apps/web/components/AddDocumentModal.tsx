// ============================================
// DOCSBOX WEB - Add Document Modal/Component
// ============================================

'use client';

import { useState, useRef } from 'react';

interface AddDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const categories = [
    { id: 'cat_identity', name: 'Identité', color: '#3B82F6' },
    { id: 'cat_housing', name: 'Logement', color: '#10B981' },
    { id: 'cat_work', name: 'Travail', color: '#8B5CF6' },
    { id: 'cat_vehicle', name: 'Véhicule', color: '#F59E0B' },
    { id: 'cat_finance', name: 'Finance', color: '#EF4444' },
    { id: 'cat_health', name: 'Santé', color: '#EC4899' },
    { id: 'cat_education', name: 'Éducation', color: '#06B6D4' },
    { id: 'cat_other', name: 'Autre', color: '#6B7280' },
];

export function AddDocumentModal({ isOpen, onClose, onSuccess }: AddDocumentModalProps) {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('cat_other');
    const [expirationDate, setExpirationDate] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                setError('Fichier trop volumineux (max 10MB)');
                return;
            }
            setFile(selectedFile);
            setError('');
            // Auto-fill title from filename
            if (!title) {
                setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        if (!title.trim()) {
            setError('Veuillez entrer un titre');
            return;
        }

        setIsUploading(true);
        setProgress(10);

        try {
            // 1. Upload file
            const formData = new FormData();
            formData.append('file', file);

            setProgress(30);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const data = await uploadRes.json();
                throw new Error(data.error || 'Erreur upload');
            }

            const uploadData = await uploadRes.json();
            setProgress(60);

            // 2. Create document
            const docRes = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    categoryId,
                    filePath: uploadData.filePath,
                    fileSize: uploadData.fileSize,
                    mimeType: uploadData.mimeType,
                    expirationDate: expirationDate || null,
                }),
            });

            if (!docRes.ok) {
                throw new Error('Erreur création document');
            }

            setProgress(100);

            // Success
            setTimeout(() => {
                window.dispatchEvent(new Event('documents-refresh'));
                onSuccess?.();
                onClose();
                // Reset form
                setTitle('');
                setCategoryId('cat_other');
                setExpirationDate('');
                setFile(null);
                setProgress(0);
            }, 500);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
            setProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header - Sticky on mobile */}
                <div className="modal-header">
                    <h2>Ajouter un document</h2>
                    <button onClick={onClose} className="modal-close-btn" aria-label="Fermer">
                        ×
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body">
                        {error && (
                            <div className="modal-error">
                                {error}
                            </div>
                        )}

                        {/* File upload */}
                        <div className="form-group">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                style={{ display: 'none' }}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`file-upload-zone ${file ? 'has-file' : ''}`}
                            >
                                {file ? (
                                    <>
                                        <div className="file-icon">✅</div>
                                        <div className="file-name">{file.name}</div>
                                        <div className="file-size">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="file-icon">📄</div>
                                        <div className="file-name">
                                            Cliquez pour sélectionner un fichier
                                        </div>
                                        <div className="file-size">
                                            PDF, JPEG, PNG (max 10MB)
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label className="form-label">Titre du document</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Carte d'identité"
                                className="form-input"
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label">Catégorie</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="form-input"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Expiration date */}
                        <div className="form-group">
                            <label className="form-label">Date d'expiration (optionnel)</label>
                            <input
                                type="date"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Footer - Sticky on mobile */}
                    <div className="modal-footer">
                        {/* Progress bar */}
                        {isUploading && (
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`submit-btn ${isUploading ? 'loading' : ''}`}
                        >
                            {isUploading ? `⏳ Upload... ${progress}%` : 'Ajouter le document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
