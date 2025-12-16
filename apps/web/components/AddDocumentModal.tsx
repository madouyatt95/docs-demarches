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
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    width: '100%',
                    maxWidth: '480px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Ajouter un document</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#6B7280',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* File upload */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            style={{ display: 'none' }}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed #E5E7EB',
                                borderRadius: '1rem',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: file ? '#F0FDF4' : '#F9FAFB',
                                transition: 'all 0.2s',
                            }}
                        >
                            {file ? (
                                <>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                    <div style={{ fontWeight: 500, color: '#059669' }}>{file.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                    <div style={{ fontWeight: 500, color: '#374151' }}>
                                        Cliquez pour sélectionner un fichier
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                        PDF, JPEG, PNG (max 10MB)
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Titre du document
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Carte d'identité"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Catégorie
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                                background: 'white',
                            }}
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Expiration date */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Date d'expiration (optionnel)
                        </label>
                        <input
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Progress bar */}
                    {isUploading && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                height: '4px',
                                background: '#E5E7EB',
                                borderRadius: '2px',
                                overflow: 'hidden',
                            }}>
                                <div
                                    style={{
                                        height: '100%',
                                        background: '#3B82F6',
                                        width: `${progress}%`,
                                        transition: 'width 0.3s',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isUploading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: isUploading ? '#9CA3AF' : '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isUploading ? `⏳ Upload... ${progress}%` : 'Ajouter le document'}
                    </button>
                </form>
            </div>
        </div>
    );
}
