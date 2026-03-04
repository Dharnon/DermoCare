// DermoCare Core Types
// Data models based on DRP specification

export type UserRole = 'pro' | 'patient';
export type ScheduleType = 'am' | 'pm';
export type AdherenceStatus = 'checked' | 'missed' | 'pending';
export type RiskLevel = 'on-track' | 'at-risk' | 'critical';

export interface ContactInfo {
    email: string;
    phone?: string;
}

export interface User {
    id: string;
    role: UserRole;
    name: string;
    avatarUrl?: string;
    contactInfo: ContactInfo;
    bio?: string;
    specialization?: string;
    organization_id?: string;
    invitedBy?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    category: string; // Changed from union to string to allow custom categories
    frequency: string; // e.g., "Twice daily", "Every other day"
    applicationMethod: string; // e.g., "Apply on damp face, massage for 60s"
    iconName?: string; // Material icon name
    iconBgColor?: string; // Tailwind color class
    // Shopping/Info details
    price?: string;
    brand?: string;
    purchaseLink?: string;
    // Deep Details
    ingredients?: string;
    benefits?: string[];
    warnings?: string;
}

export interface RoutineProduct extends Product {
    isCompleted: boolean;
    order?: number;
    instructions?: string; // New: Custom instructions for this product in the routine
}

export interface RoutineTemplate {
    id: string;
    name: string;
    icon: string;
    products: string[]; // List of product IDs
    scheduleType: 'am' | 'pm';
}

export interface Routine {
    id: string;
    patientId: string;
    proId: string;
    products: RoutineProduct[];
    scheduleType: ScheduleType;
    createdAt: Date;
    updatedAt: Date;
}

export interface LogAdherence {
    id: string;
    routineId: string;
    productId: string;
    date: string; // YYYY-MM-DD format
    scheduleType: ScheduleType;
    status: AdherenceStatus;
    timestamp?: Date; // When the check was made
}

export interface ClinicalNote {
    id: string;
    patientId: string;
    proId: string;
    content: string;
    type?: VisitType;
    photos?: string[];
    isPrivate: boolean;
    createdAt: Date;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled';
export type VisitType = 'first-visit' | 'follow-up' | 'routine-check';

export interface Appointment {
    id: string;
    patientId: string;
    proId: string;
    date: string;         // YYYY-MM-DD
    time: string;         // HH:MM format
    status: AppointmentStatus;
    visitType: VisitType;
    reason?: string;      // Motivo de la cita
    notes?: string;
    createdAt: Date;
}

export interface PatientStats {
    weeklyAdherence: number;
    totalProducts: number;
    completedToday: number;
    streak: number; // Days in a row with 100% adherence
    riskLevel: RiskLevel;
}

// Helper type for patient list in doctor view
export interface PatientSummary {
    patient: User;
    adherencePercentage: number;
    currentRoutine?: Routine;
    lastCheck?: Date;
    riskLevel: RiskLevel;
    treatmentType: string;
    dayNumber: number;
}

export interface ProgressEntry {
    id: string;
    patientId: string;
    photoUrl: string;
    notes?: string;
    professionalFeedback?: string;
    createdAt: string; // ISO string
}

export interface ProductReview {
    id: string;
    productId: string;
    patientId: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: string; // ISO string
    isRead: boolean;
    type: 'text' | 'image' | 'system';
}

// Database response types (from Supabase)
export interface ProfileRow {
    id: string;
    name: string | null;
    role: UserRole;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialization: string | null;
    organization_id: string | null;
    invited_by: string | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    organizations?: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

export interface RoutineRow {
    id: string;
    patient_id: string;
    pro_id: string;
    schedule_type: ScheduleType;
    created_at: string;
    updated_at: string;
    routine_products?: RoutineProductRow[];
}

export interface RoutineProductRow {
    id: string;
    routine_id: string;
    product_id: string;
    order: number;
    instructions: string | null;
    products?: ProductRow;
}

export interface ProductRow {
    id: string;
    name: string;
    description: string | null;
    category: string;
    frequency: string | null;
    application_method: string | null;
    image_url: string | null;
    icon_name: string | null;
    icon_bg_color: string | null;
    price: string | null;
    brand: string | null;
    purchase_link: string | null;
    ingredients: string | null;
    benefits: string[] | null;
    warnings: string | null;
    organization_id: string | null;
    created_at: string;
}

export interface AdherenceLogRow {
    id: string;
    routine_id: string;
    product_id: string;
    date: string;
    schedule_type: ScheduleType;
    status: AdherenceStatus;
    timestamp: string;
}

export interface AppointmentRow {
    id: string;
    patient_id: string;
    pro_id: string;
    date: string;
    time: string;
    status: AppointmentStatus;
    visit_type: VisitType;
    reason: string | null;
    notes: string | null;
    created_at: string;
}

export interface OrganizationRow {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    created_at?: string;
}

export interface OrganizationSearchResult {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
}
