// ============================================
// DOCSBOX MOBILE - useDemarches Hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Demarche, CreateDemarcheRequest, DemarcheStatus } from '@docsbox/core';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface DemarchesResponse {
    data: Demarche[];
    total: number;
    missingPiecesCount: number;
}

async function fetchDemarches(status?: string): Promise<DemarchesResponse> {
    const url = status
        ? `${API_BASE_URL}/demarches?status=${status}`
        : `${API_BASE_URL}/demarches`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch demarches');
    return response.json();
}

async function createDemarche(data: CreateDemarcheRequest): Promise<Demarche> {
    const response = await fetch(`${API_BASE_URL}/demarches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create demarche');
    return response.json();
}

async function updateDemarche(id: string, data: Partial<Demarche>): Promise<Demarche> {
    const response = await fetch(`${API_BASE_URL}/demarches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update demarche');
    return response.json();
}

async function deleteDemarche(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/demarches/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete demarche');
}

export function useDemarches(status?: DemarcheStatus) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['demarches', status],
        queryFn: () => fetchDemarches(status),
    });

    const createMutation = useMutation({
        mutationFn: createDemarche,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demarches'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Demarche> }) =>
            updateDemarche(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demarches'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDemarche,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demarches'] });
        },
    });

    return {
        demarches: query.data?.data ?? [],
        demarcheCount: query.data?.total ?? 0,
        missingPiecesCount: query.data?.missingPiecesCount ?? 0,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        createDemarche: createMutation.mutateAsync,
        updateDemarche: updateMutation.mutateAsync,
        deleteDemarche: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
