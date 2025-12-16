// ============================================
// DOCSBOX - Constantes Partagées
// ============================================

import { Category, DemarcheTemplate, SubscriptionPlan } from './types';

// === QUOTAS ===

export const QUOTAS = {
    [SubscriptionPlan.FREE]: {
        maxDocuments: 30,
        maxReminders: 5,
        maxPacks: 3,
        maxDemarches: 0,
        hasOcr: false,
        hasShareLinks: false,
        hasCloudSync: false,
        hasFamilyProfiles: false,
    },
    [SubscriptionPlan.PREMIUM]: {
        maxDocuments: Infinity,
        maxReminders: Infinity,
        maxPacks: Infinity,
        maxDemarches: Infinity,
        hasOcr: true,
        hasShareLinks: true,
        hasCloudSync: true,
        hasFamilyProfiles: true,
    },
} as const;

// === PRICING ===

export const PRICING = {
    monthly: {
        price: 3.99,
        currency: 'EUR',
        productIdIos: 'com.docsbox.premium.monthly',
        productIdAndroid: 'premium_monthly',
    },
    yearly: {
        price: 29.99,
        currency: 'EUR',
        productIdIos: 'com.docsbox.premium.yearly',
        productIdAndroid: 'premium_yearly',
        savings: 0.58, // 58%
    },
} as const;

// === CATÉGORIES PAR DÉFAUT ===

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat_identity', name: 'Identité', icon: 'id-card', color: '#3B82F6', isSystem: true },
    { id: 'cat_housing', name: 'Logement', icon: 'home', color: '#10B981', isSystem: true },
    { id: 'cat_vehicle', name: 'Véhicule', icon: 'car', color: '#F59E0B', isSystem: true },
    { id: 'cat_work', name: 'Travail', icon: 'briefcase', color: '#8B5CF6', isSystem: true },
    { id: 'cat_finance', name: 'Finance', icon: 'credit-card', color: '#EF4444', isSystem: true },
    { id: 'cat_health', name: 'Santé', icon: 'heart', color: '#EC4899', isSystem: true },
    { id: 'cat_education', name: 'Éducation', icon: 'graduation-cap', color: '#06B6D4', isSystem: true },
    { id: 'cat_other', name: 'Autre', icon: 'folder', color: '#6B7280', isSystem: true },
];

// === TEMPLATES PACKS ===

export const PACK_TEMPLATES = [
    {
        type: 'location',
        name: 'Dossier Location',
        description: 'Tous les documents pour une demande de logement',
        requiredDocs: ['Pièce d\'identité', 'Justificatif de domicile', 'Bulletins de salaire (3 derniers)', 'Avis d\'imposition', 'Contrat de travail'],
    },
    {
        type: 'ecole',
        name: 'Inscription École',
        description: 'Documents pour une inscription scolaire',
        requiredDocs: ['Livret de famille', 'Justificatif de domicile', 'Carnet de santé', 'Certificat de radiation'],
    },
    {
        type: 'banque',
        name: 'Ouverture Compte Bancaire',
        description: 'Documents pour ouvrir un compte',
        requiredDocs: ['Pièce d\'identité', 'Justificatif de domicile', 'Justificatif de revenus'],
    },
];

// === TEMPLATES DÉMARCHES ===

export const DEMARCHE_TEMPLATES: DemarcheTemplate[] = [
    {
        id: 'tpl_carte_grise',
        name: 'Carte grise',
        description: 'Changement de titulaire ou d\'adresse',
        icon: 'car',
        defaultSteps: [
            { orderIndex: 0, title: 'Rassembler les pièces justificatives', done: false },
            { orderIndex: 1, title: 'Créer un compte ANTS', done: false },
            { orderIndex: 2, title: 'Remplir le formulaire en ligne', done: false },
            { orderIndex: 3, title: 'Payer les taxes', done: false },
            { orderIndex: 4, title: 'Attendre réception du certificat', done: false },
        ],
        defaultPieces: [
            { name: 'Ancien certificat d\'immatriculation' },
            { name: 'Pièce d\'identité' },
            { name: 'Justificatif de domicile' },
            { name: 'Formulaire Cerfa' },
        ],
    },
    {
        id: 'tpl_passeport',
        name: 'Passeport / CNI',
        description: 'Première demande ou renouvellement',
        icon: 'id-card',
        defaultSteps: [
            { orderIndex: 0, title: 'Faire les photos d\'identité', done: false },
            { orderIndex: 1, title: 'Acheter le timbre fiscal', done: false },
            { orderIndex: 2, title: 'Pré-demande en ligne', done: false },
            { orderIndex: 3, title: 'Rendez-vous en mairie', done: false },
            { orderIndex: 4, title: 'Récupérer le document', done: false },
        ],
        defaultPieces: [
            { name: 'Photos d\'identité' },
            { name: 'Timbre fiscal' },
            { name: 'Justificatif de domicile' },
            { name: 'Acte de naissance' },
        ],
    },
    {
        id: 'tpl_permis',
        name: 'Permis de conduire',
        description: 'Perte, vol ou échange',
        icon: 'id-badge',
        defaultSteps: [
            { orderIndex: 0, title: 'Déclaration de perte/vol', done: false },
            { orderIndex: 1, title: 'Demande sur ANTS', done: false },
            { orderIndex: 2, title: 'Fournir les justificatifs', done: false },
            { orderIndex: 3, title: 'Attendre réception', done: false },
        ],
        defaultPieces: [
            { name: 'Pièce d\'identité' },
            { name: 'Photos d\'identité' },
            { name: 'Justificatif de domicile' },
        ],
    },
    {
        id: 'tpl_demenagement',
        name: 'Déménagement',
        description: 'Checklist résiliations et transferts',
        icon: 'truck',
        defaultSteps: [
            { orderIndex: 0, title: 'Donner préavis au propriétaire', done: false },
            { orderIndex: 1, title: 'Résilier/transférer électricité', done: false },
            { orderIndex: 2, title: 'Résilier/transférer internet', done: false },
            { orderIndex: 3, title: 'Prévenir les impôts', done: false },
            { orderIndex: 4, title: 'Mettre à jour la CAF', done: false },
            { orderIndex: 5, title: 'Changer adresse bancaire', done: false },
            { orderIndex: 6, title: 'Redirection courrier La Poste', done: false },
        ],
        defaultPieces: [
            { name: 'Nouveau bail' },
            { name: 'Ancien justificatif de domicile' },
            { name: 'État des lieux' },
        ],
    },
    {
        id: 'tpl_caf',
        name: 'CAF / APL',
        description: 'Demande d\'aides au logement',
        icon: 'home',
        defaultSteps: [
            { orderIndex: 0, title: 'Créer un compte CAF', done: false },
            { orderIndex: 1, title: 'Faire une simulation', done: false },
            { orderIndex: 2, title: 'Constituer le dossier', done: false },
            { orderIndex: 3, title: 'Soumettre la demande', done: false },
            { orderIndex: 4, title: 'Suivre le traitement', done: false },
        ],
        defaultPieces: [
            { name: 'Pièce d\'identité' },
            { name: 'RIB' },
            { name: 'Bail' },
            { name: 'Avis d\'imposition' },
        ],
    },
    {
        id: 'tpl_assurance',
        name: 'Assurance habitation',
        description: 'Souscription ou déclaration de sinistre',
        icon: 'shield',
        defaultSteps: [
            { orderIndex: 0, title: 'Comparer les offres', done: false },
            { orderIndex: 1, title: 'Choisir une assurance', done: false },
            { orderIndex: 2, title: 'Fournir les documents', done: false },
            { orderIndex: 3, title: 'Signer le contrat', done: false },
            { orderIndex: 4, title: 'Recevoir l\'attestation', done: false },
        ],
        defaultPieces: [
            { name: 'Bail' },
            { name: 'Pièce d\'identité' },
            { name: 'RIB' },
        ],
    },
    {
        id: 'tpl_impots',
        name: 'Impôts',
        description: 'Déclaration et échéances',
        icon: 'file-text',
        defaultSteps: [
            { orderIndex: 0, title: 'Rassembler les documents', done: false },
            { orderIndex: 1, title: 'Vérifier la déclaration pré-remplie', done: false },
            { orderIndex: 2, title: 'Ajouter les revenus/charges', done: false },
            { orderIndex: 3, title: 'Valider la déclaration', done: false },
            { orderIndex: 4, title: 'Payer l\'impôt (si applicable)', done: false },
        ],
        defaultPieces: [
            { name: 'Avis d\'imposition N-1' },
            { name: 'Justificatifs de revenus' },
            { name: 'Justificatifs de charges déductibles' },
        ],
    },
];

// === RAPPELS PAR DÉFAUT ===

export const DEFAULT_REMINDER_DAYS = [7, 30]; // 7 jours et 30 jours avant expiration

// === ANALYTICS EVENTS ===

export const ANALYTICS_EVENTS = {
    ONBOARDING_COMPLETE: 'onboarding_complete',
    DOC_ADDED: 'doc_added',
    DOC_DELETED: 'doc_deleted',
    REMINDER_SET: 'reminder_set',
    PACK_CREATED: 'pack_created',
    PACK_EXPORTED: 'pack_exported',
    PAYWALL_VIEW: 'paywall_view',
    SUBSCRIBE_START: 'subscribe_start',
    SUBSCRIBE_SUCCESS: 'subscribe_success',
    DEMARCHE_CREATED: 'demarche_created',
    DEMARCHE_COMPLETED: 'demarche_completed',
} as const;
