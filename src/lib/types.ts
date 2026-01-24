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
}

export interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    category: 'cleanser' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other';
    frequency: string; // e.g., "Twice daily", "Every other day"
    applicationMethod: string; // e.g., "Apply on damp face, massage for 60s"
    iconName?: string; // Material icon name
    iconBgColor?: string; // Tailwind color class
}

export interface RoutineProduct extends Product {
    isCompleted: boolean;
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

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: string; // ISO string
    isRead: boolean;
    type: 'text' | 'image' | 'system';
}
