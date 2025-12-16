import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database tables
export type User = {
    id: string
    email: string
    passwordHash: string
    displayName: string | null
    avatarUrl: string | null
    pin: string | null
    biometricEnabled: boolean
    createdAt: string
    updatedAt: string
    lastLoginAt: string | null
}

export type Document = {
    id: string
    userId: string
    title: string
    categoryId: string | null
    filePath: string
    fileSize: number
    mimeType: string
    thumbnailPath: string | null
    ocrText: string | null
    expirationDate: string | null
    tags: string[]
    syncStatus: 'LOCAL_ONLY' | 'SYNCING' | 'SYNCED' | 'ERROR'
    encryptionKey: string | null
    createdAt: string
    updatedAt: string
}

export type Category = {
    id: string
    userId: string | null
    name: string
    icon: string | null
    color: string | null
    sortOrder: number
}

export type Pack = {
    id: string
    userId: string
    name: string
    templateId: string | null
    createdAt: string
    updatedAt: string
}

export type Demarche = {
    id: string
    userId: string
    title: string
    templateId: string
    status: 'DRAFT' | 'IN_PROGRESS' | 'SENT' | 'WAITING' | 'COMPLETED'
    deadline: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
    completedAt: string | null
}
