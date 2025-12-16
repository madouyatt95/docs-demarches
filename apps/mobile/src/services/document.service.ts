// ============================================
// DOCSBOX MOBILE - Document Service
// ============================================

import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Document, CreateDocumentRequest, PaginatedResponse } from '@docsbox/core';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const DOCUMENTS_DIR = FileSystem.documentDirectory + 'documents/';

class DocumentService {
    constructor() {
        this.ensureDirectoryExists();
    }

    private async ensureDirectoryExists() {
        const dirInfo = await FileSystem.getInfoAsync(DOCUMENTS_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(DOCUMENTS_DIR, { intermediates: true });
        }
    }

    private async getAccessToken(): Promise<string | null> {
        return SecureStore.getItemAsync('docsbox_access_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = await this.getAccessToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
            throw new Error(error.message);
        }

        return response.json();
    }

    /**
     * Récupère la liste des documents
     */
    async getDocuments(params?: {
        category?: string;
        tag?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Document>> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.set('category', params.category);
        if (params?.tag) queryParams.set('tag', params.tag);
        if (params?.search) queryParams.set('search', params.search);
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());

        const query = queryParams.toString();
        return this.request<PaginatedResponse<Document>>(
            `/documents${query ? `?${query}` : ''}`
        );
    }

    /**
     * Récupère un document par ID
     */
    async getDocument(id: string): Promise<Document> {
        return this.request<Document>(`/documents/${id}`);
    }

    /**
     * Crée un nouveau document avec upload de fichier
     */
    async createDocument(
        file: { uri: string; name: string; type: string },
        metadata: CreateDocumentRequest
    ): Promise<Document> {
        const token = await this.getAccessToken();

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);
        formData.append('title', metadata.title);
        formData.append('categoryId', metadata.categoryId);
        if (metadata.tags) {
            formData.append('tags', JSON.stringify(metadata.tags));
        }
        if (metadata.expirationDate) {
            formData.append('expirationDate', metadata.expirationDate);
        }

        const response = await fetch(`${API_BASE_URL}/documents`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message);
        }

        return response.json();
    }

    /**
     * Met à jour un document
     */
    async updateDocument(
        id: string,
        data: Partial<CreateDocumentRequest>
    ): Promise<Document> {
        return this.request<Document>(`/documents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Supprime un document
     */
    async deleteDocument(id: string): Promise<void> {
        await this.request(`/documents/${id}`, { method: 'DELETE' });
    }

    /**
     * Télécharge un document localement
     */
    async downloadDocument(id: string): Promise<string> {
        const token = await this.getAccessToken();
        const localPath = DOCUMENTS_DIR + `${id}.pdf`;

        const downloadResult = await FileSystem.downloadAsync(
            `${API_BASE_URL}/documents/${id}/download`,
            localPath,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (downloadResult.status !== 200) {
            throw new Error('Download failed');
        }

        return downloadResult.uri;
    }

    /**
     * Lance l'OCR sur un document (premium)
     */
    async runOcr(id: string): Promise<{ ocrText: string }> {
        return this.request<{ ocrText: string }>(`/documents/${id}/ocr`, {
            method: 'POST',
        });
    }

    /**
     * Sauvegarde un fichier localement (mode offline)
     */
    async saveFileLocally(uri: string, fileName: string): Promise<string> {
        const localPath = DOCUMENTS_DIR + fileName;
        await FileSystem.copyAsync({ from: uri, to: localPath });
        return localPath;
    }

    /**
     * Supprime un fichier local
     */
    async deleteLocalFile(fileName: string): Promise<void> {
        const localPath = DOCUMENTS_DIR + fileName;
        const info = await FileSystem.getInfoAsync(localPath);
        if (info.exists) {
            await FileSystem.deleteAsync(localPath);
        }
    }
}

export const documentService = new DocumentService();
