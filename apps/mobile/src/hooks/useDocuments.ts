// ============================================
// DOCSBOX MOBILE - useDocuments Hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, CreateDocumentRequest } from '@docsbox/core';
import { documentService } from '../services/document.service';

export function useDocuments(params?: {
    category?: string;
    tag?: string;
    search?: string;
}) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['documents', params],
        queryFn: () => documentService.getDocuments(params),
    });

    const createMutation = useMutation({
        mutationFn: ({ file, metadata }: {
            file: { uri: string; name: string; type: string };
            metadata: CreateDocumentRequest;
        }) => documentService.createDocument(file, metadata),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateDocumentRequest> }) =>
            documentService.updateDocument(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => documentService.deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    return {
        documents: query.data?.data ?? [],
        documentCount: query.data?.total ?? 0,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        createDocument: createMutation.mutateAsync,
        updateDocument: updateMutation.mutateAsync,
        deleteDocument: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: ['document', id],
        queryFn: () => documentService.getDocument(id),
        enabled: !!id,
    });
}
