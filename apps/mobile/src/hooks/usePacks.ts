// ============================================
// DOCSBOX MOBILE - usePacks Hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pack, CreatePackRequest } from '@docsbox/core';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// TODO: Déplacer dans un service dédié
async function fetchPacks(): Promise<{ data: Pack[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/packs`);
    if (!response.ok) throw new Error('Failed to fetch packs');
    return response.json();
}

async function createPack(data: CreatePackRequest): Promise<Pack> {
    const response = await fetch(`${API_BASE_URL}/packs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create pack');
    return response.json();
}

async function deletePack(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/packs/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete pack');
}

export function usePacks() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['packs'],
        queryFn: fetchPacks,
    });

    const createMutation = useMutation({
        mutationFn: createPack,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packs'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePack,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packs'] });
        },
    });

    return {
        packs: query.data?.data ?? [],
        packCount: query.data?.total ?? 0,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        createPack: createMutation.mutateAsync,
        deletePack: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
