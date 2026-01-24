'use client';

// DermoCare Global Store with Zustand
// Includes mock data and localStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    User,
    Routine,
    LogAdherence,
    Product,
    PatientSummary,
    Appointment,
    ClinicalNote,
    ScheduleType,
    AdherenceStatus,
    AppointmentStatus,
    VisitType,
    RoutineTemplate,
    ChatMessage, // Added
} from './types';
import {
    calculateWeeklyAdherence,
    getAdherenceRiskLevel,
    formatDate,
} from './adherence';

// ============================================
// MOCK DATA
// ============================================

const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prod-1',
        name: 'Limpiador Hidratante',
        description: 'Limpiador suave para pieles sensibles',
        category: 'cleanser',
        frequency: 'Dos veces al día',
        applicationMethod: 'Aplicar en rostro húmedo, masajear 60 segundos',
        iconName: 'water_drop',
        iconBgColor: 'bg-blue-50',
    },
    {
        id: 'prod-2',
        name: 'Sérum Vitamina C',
        description: 'Antioxidante para luminosidad',
        category: 'serum',
        frequency: 'Una vez al día (mañana)',
        applicationMethod: '3-4 gotas, aplicar con toques suaves',
        iconName: 'flare',
        iconBgColor: 'bg-orange-50',
    },
    {
        id: 'prod-3',
        name: 'Gel Hidratante',
        description: 'Hidratación ligera y refrescante',
        category: 'moisturizer',
        frequency: 'Dos veces al día',
        applicationMethod: 'Aplicar uniformemente en rostro y cuello',
        iconName: 'face',
        iconBgColor: 'bg-pink-50',
    },
    {
        id: 'prod-4',
        name: 'Protector Solar SPF 50+',
        description: 'Protección de amplio espectro',
        category: 'sunscreen',
        frequency: 'Cada mañana (reaplicar cada 2h)',
        applicationMethod: 'Aplicar dos dedos de producto',
        iconName: 'sunny',
        iconBgColor: 'bg-yellow-50',
    },
    {
        id: 'prod-5',
        name: 'Crema Contorno de Ojos',
        description: 'Para ojeras y líneas finas',
        category: 'treatment',
        frequency: 'Dos veces al día',
        applicationMethod: 'Pequeña cantidad alrededor del hueso orbital',
        iconName: 'visibility',
        iconBgColor: 'bg-purple-50',
    },
];

const MOCK_CURRENT_PATIENT: User = {
    id: 'patient-1',
    role: 'patient',
    name: 'María García',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCji5F1_QArQELogjT3aonVVgieY10JSt9SDXLQVccy1G3sjWGW-vUnCA2OA7XV1MBlmP1v9aaD9peUWGRcOYF2cg1ULSNe7sbJf4UUc0U_AYfy7AgWo50Z1b4UxRiB4AvlVObW5XX9AhOfAPXH9yVm4agCm8a9J2aupPWpTITQY8g1c1l-Qmqf94f96BrRYRcU7ZHpaURBZXfgOyghOZJSbdQVj5-KY7UcKFr31I9Mq-Zj1_QxDLG8-b-iLQZYdnp8RT8Tnx-ae3c',
    contactInfo: { email: 'maria@example.com', phone: '+34 612 345 678' },
};

const MOCK_CURRENT_PRO: User = {
    id: 'pro-1',
    role: 'pro',
    name: 'Dra. Elena Martínez',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQNnShvQ1gjOi-tdPpjRYzY1KU-2c-uvnJCFKbT3Mu3_Gw1p0taFBSzPlA3oKaweWCARJLNbYbpeIxvyoE7t25vj8gBHqfB37yKWYyR8fTy_PJ5EOIvaJhVbUJiCz9M_qzd0fLkzef7zQEIHb53L2yHtK6IjTKiIcHZXkf22cuXl9Xr4QUzfq9oGDMrU-xNsCUxsXXW0LAGOZScnG9uK-pvePuwcUYh0-GCExy4qFn0CkQ5-G0M3xFJWKmMlw-JW1JZnjopoYA7GM',
    contactInfo: { email: 'dra.martinez@dermocare.com' },
};

const MOCK_PATIENTS: User[] = [
    MOCK_CURRENT_PATIENT,
    {
        id: 'patient-2',
        role: 'patient',
        name: 'Carlos Rodríguez',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0r-Aoz5_kPcTwk6xXUmtllj8x74kC0L-rY3cNgnYnhLLokUYrTcxAkGt1bDcLbmsyl9Iac6kBhpV0g-DArVJqT02_AyFI4v6Tq12T45cGE8zFWP8xkdkSDv1pZ2_2jFlmodCxLOvI69ONR4ZGHMlHDuDp36XY0DJNK_qnvcTcKu-PuNpz-fCExOakEY6WKSwJncKBhT_5sMG75QKEuCQXSgZnvLTO0wp357fSOG7gHwkLG2rUNW6r76rfoRYbrw4JDJhuOEiWvwo',
        contactInfo: { email: 'carlos@example.com' },
    },
    {
        id: 'patient-3',
        role: 'patient',
        name: 'Lucía Fernández',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaD-CbnS7BLePYAub0PFepRwyOKiM3JUo58-1mCuRRifJB_TelGKceiI-kJBSX2vHsOyB39mbyg9UlGOY2mCPIQSueSMhFttNlqEbtWT6FnpTdWGrfOvpPgvHLql6RllIMJARvbiAnCU4MYMB1KCcRHtOMUOraUgMB5JycXbfZD50E5BcakmC6qEPeuNtTdwDzQFbc0xRvLB0KyjSdWlWWhv1coSkbZNheYsVQYa4SlFxkiesguPuqB003aremN5yBjeTy3FaqXi8',
        contactInfo: { email: 'lucia@example.com' },
    },
];

// ============================================
// Store Implementation
// ============================================

const MOCK_MESSAGES: ChatMessage[] = [
    {
        id: 'msg-1',
        text: 'Hola Doctora, ¿puedo usar el sérum de vitamina C por la mañana?',
        senderId: 'user-1',
        receiverId: 'pro-1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        isRead: true,
        type: 'text'
    },
    {
        id: 'msg-2',
        text: 'Hola Ana. Sí claro, es lo recomendado. Pero recuerda aplicar protector solar después.',
        senderId: 'pro-1',
        receiverId: 'user-1',
        timestamp: new Date(Date.now() - 86400000 * 2 + 600000).toISOString(),
        isRead: true,
        type: 'text'
    },
    {
        id: 'msg-3',
        text: 'Entendido, gracias!',
        senderId: 'user-1',
        receiverId: 'pro-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: false,
        type: 'text'
    }
];

// ============================================
// STORE INTERFACE
// ============================================

interface DermoCareState {
    // Current user context
    currentUser: User | null; // Added
    currentPatient: User | null;
    currentPro: User | null;

    // Data
    products: Product[];
    routines: Routine[];
    templates: RoutineTemplate[];
    adherenceLogs: LogAdherence[];
    clinicalNotes: ClinicalNote[];
    appointments: Appointment[];
    patients: User[];

    // Actions - Patient
    toggleProductCheck: (
        routineId: string,
        productId: string,
        scheduleType: ScheduleType,
        date: string
    ) => void;
    getProductStatus: (
        routineId: string,
        productId: string,
        scheduleType: ScheduleType,
        date: string
    ) => AdherenceStatus;
    getPatientRoutine: (scheduleType: ScheduleType) => Routine | undefined;
    getProductById: (id: string) => Product | undefined;

    // Actions - Pro: Patient Management
    addPatient: (patient: Omit<User, 'id' | 'role'>) => User;
    updatePatient: (id: string, updates: Partial<User>) => void;
    deletePatient: (id: string) => void;

    // Actions - Pro: Routine Assignment
    assignRoutineToPatient: (
        patientId: string,
        productIds: string[],
        scheduleType: ScheduleType
    ) => Routine;
    updateRoutine: (routineId: string, productIds: string[]) => void;
    removeProductFromRoutine: (routineId: string, productId: string) => void;
    addProductToRoutine: (routineId: string, productId: string) => void;

    // Actions - Pro: Data Access
    getPatientSummaries: () => PatientSummary[];
    getPatientById: (id: string) => User | undefined;
    getRoutinesByPatient: (patientId: string) => Routine[];
    addClinicalNote: (note: Omit<ClinicalNote, 'id' | 'createdAt'>) => void;
    getClinicalNotes: (patientId: string) => ClinicalNote[];

    // Actions - Appointments
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
    updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
    cancelAppointment: (id: string) => void;
    getPatientAppointments: (patientId: string) => Appointment[];
    getDoctorAppointments: (proId: string, date?: string) => Appointment[];
    getNextPatientAppointment: (patientId: string) => Appointment | undefined;

    // Actions - Templates & Instructions
    saveRoutineAsTemplate: (routineId: string, name: string, icon: string) => void;
    applyTemplateToRoutine: (routineId: string, templateId: string) => void;
    deleteTemplate: (templateId: string) => void;
    addTemplate: (template: Omit<RoutineTemplate, 'id'>) => void; // Added
    updateTemplate: (templateId: string, updates: { name?: string; icon?: string }) => void;
    updateProductInstructions: (routineId: string, productId: string, instructions: string) => void;

    // Actions - Inventory
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    // Actions - Chat
    chatMessages: ChatMessage[];
    sendMessage: (text: string, senderId: string, receiverId: string) => void;
    markMessagesAsRead: (viewerId: string, senderId: string) => void;
}

// ============================================
// CREATE STORE
// ============================================

const today = formatDate(new Date());
const yesterday = formatDate(new Date(Date.now() - 86400000));
const tomorrow = formatDate(new Date(Date.now() + 86400000));

// Mock Appointments for demo
const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'apt-demo-1',
        patientId: 'patient-1',
        proId: 'pro-1',
        date: today,
        time: '10:00',
        status: 'confirmed',
        visitType: 'follow-up',
        reason: 'Revisión de progreso con tratamiento actual',
        createdAt: new Date(),
    },
    {
        id: 'apt-demo-2',
        patientId: 'patient-2',
        proId: 'pro-1',
        date: today,
        time: '11:30',
        status: 'pending',
        visitType: 'first-visit',
        reason: 'Consulta inicial dermatológica',
        createdAt: new Date(),
    },
    {
        id: 'apt-demo-3',
        patientId: 'patient-3',
        proId: 'pro-1',
        date: tomorrow,
        time: '09:30',
        status: 'confirmed',
        visitType: 'routine-check',
        createdAt: new Date(),
    },
];

export const useDermoCareStore = create<DermoCareState>()(
    persist(
        (set, get) => ({
            // Initial state with mock data
            currentUser: MOCK_CURRENT_PATIENT, // Added
            currentPatient: MOCK_CURRENT_PATIENT,
            currentPro: MOCK_CURRENT_PRO,
            products: MOCK_PRODUCTS,
            patients: MOCK_PATIENTS,
            clinicalNotes: [],
            appointments: MOCK_APPOINTMENTS,
            chatMessages: MOCK_MESSAGES,

            templates: [
                {
                    id: 'template-acne-basic',
                    name: 'Rutina Acné Básico',
                    icon: 'clean_hands',
                    products: ['prod-1', 'prod-3', 'prod-4'],
                    scheduleType: 'am'
                },
                {
                    id: 'template-hydration',
                    name: 'Hidratación Profunda',
                    icon: 'water_drop',
                    products: ['prod-1', 'prod-2', 'prod-3'],
                    scheduleType: 'am'
                }
            ],

            routines: [
                {
                    id: 'routine-am-1',
                    patientId: 'patient-1',
                    proId: 'pro-1',
                    scheduleType: 'am',
                    products: MOCK_PRODUCTS.slice(0, 4).map((p, i) => ({ ...p, order: i, isCompleted: false })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'routine-pm-1',
                    patientId: 'patient-1',
                    proId: 'pro-1',
                    scheduleType: 'pm',
                    products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[2], MOCK_PRODUCTS[4]].map((p, i) => ({
                        ...p,
                        order: i,
                        isCompleted: false
                    })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'routine-am-2',
                    patientId: 'patient-2',
                    proId: 'pro-1',
                    scheduleType: 'am',
                    products: MOCK_PRODUCTS.slice(0, 3).map((p, i) => ({ ...p, order: i, isCompleted: false })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'routine-am-3',
                    patientId: 'patient-3',
                    proId: 'pro-1',
                    scheduleType: 'am',
                    products: MOCK_PRODUCTS.map((p, i) => ({ ...p, order: i, isCompleted: false })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],

            // Pre-populate with some adherence logs for demo
            adherenceLogs: [
                // Patient 1 - yesterday (some completed)
                { id: 'log-1', routineId: 'routine-am-1', productId: 'prod-1', date: yesterday, scheduleType: 'am', status: 'checked', timestamp: new Date() },
                { id: 'log-2', routineId: 'routine-am-1', productId: 'prod-2', date: yesterday, scheduleType: 'am', status: 'checked', timestamp: new Date() },
                { id: 'log-3', routineId: 'routine-am-1', productId: 'prod-3', date: yesterday, scheduleType: 'am', status: 'checked', timestamp: new Date() },
                // Patient 1 - today (partial)
                { id: 'log-4', routineId: 'routine-am-1', productId: 'prod-1', date: today, scheduleType: 'am', status: 'checked', timestamp: new Date() },
                { id: 'log-5', routineId: 'routine-am-1', productId: 'prod-2', date: today, scheduleType: 'am', status: 'checked', timestamp: new Date() },
                { id: 'log-6', routineId: 'routine-am-1', productId: 'prod-3', date: today, scheduleType: 'am', status: 'checked', timestamp: new Date() },
            ],

            // Actions - Templates
            saveRoutineAsTemplate: (routineId, name, icon) => {
                const routine = get().routines.find(r => r.id === routineId);
                if (!routine) return;

                const newTemplate: RoutineTemplate = {
                    id: `temp-${Date.now()}`,
                    name,
                    icon,
                    scheduleType: routine.scheduleType,
                    products: routine.products.map(p => p.id)
                };

                set(state => ({ templates: [...state.templates, newTemplate] }));
            },

            applyTemplateToRoutine: (routineId, templateId) => {
                const template = get().templates.find(t => t.id === templateId);
                const { products } = get();

                if (!template) return;

                const routineProducts = template.products
                    .map((id, index) => {
                        const product = products.find(p => p.id === id);
                        // When applying template, we reset custom instructions
                        return product ? { ...product, order: index, isCompleted: false } : null;
                    })
                    .filter(Boolean) as import('./types').RoutineProduct[];

                set(state => ({
                    routines: state.routines.map(r =>
                        r.id === routineId
                            ? { ...r, products: routineProducts, updatedAt: new Date() }
                            : r
                    )
                }));
            },

            deleteTemplate: (templateId) => {
                set(state => ({
                    templates: state.templates.filter(t => t.id !== templateId)
                }));
            },

            addTemplate: (template) => {
                const newTemplate: RoutineTemplate = {
                    ...template,
                    id: `temp-${Date.now()}`,
                    products: template.products || []
                };
                set(state => ({ templates: [...state.templates, newTemplate] }));
            },

            updateTemplate: (templateId, updates) => {
                set(state => ({
                    templates: state.templates.map(t =>
                        t.id === templateId ? { ...t, ...updates } : t
                    )
                }));
            },

            // Actions - Inventory products
            addProduct: (productData) => {
                const newProduct: Product = {
                    ...productData,
                    id: `prod-${Date.now()}`,
                };
                set((state) => ({ products: [...state.products, newProduct] }));
            },

            updateProduct: (id, updates) => {
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                    // Also update routines that contain this product?
                    // Ideally yes to keep coherence, but RoutineProduct extends Product.
                    // If we change name/icon in catalog, it should reflect in routines.
                    // Since routine.products are independent objects in current implementation (copied on add),
                    // we need to update them too to keep them in sync.
                    routines: state.routines.map(r => ({
                        ...r,
                        products: r.products.map(rp =>
                            rp.id === id ? { ...rp, ...updates } : rp
                        )
                    }))
                }));
            },

            deleteProduct: (id) => {
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                    // Remove from all routines
                    routines: state.routines.map(r => ({
                        ...r,
                        products: r.products.filter(p => p.id !== id),
                        updatedAt: new Date()
                    }))
                }));
            },

            updateProductInstructions: (routineId, productId, instructions) => {
                set(state => ({
                    routines: state.routines.map(r =>
                        r.id === routineId
                            ? {
                                ...r,
                                products: r.products.map(p =>
                                    p.id === productId ? { ...p, instructions } : p
                                ),
                                updatedAt: new Date()
                            }
                            : r
                    )
                }));
            },

            // Actions - Chat
            sendMessage: (text, senderId, receiverId) => {
                const newMessage: ChatMessage = {
                    id: `msg-${Date.now()}`,
                    text,
                    senderId,
                    receiverId,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    type: 'text'
                };
                set((state) => ({ chatMessages: [...state.chatMessages, newMessage] }));
            },

            markMessagesAsRead: (viewerId, senderId) => {
                set((state) => ({
                    chatMessages: state.chatMessages.map(msg =>
                        (msg.receiverId === viewerId && msg.senderId === senderId && !msg.isRead)
                            ? { ...msg, isRead: true }
                            : msg
                    )
                }));
            },

            // Actions - Patient
            toggleProductCheck: (routineId, productId, scheduleType, date) => {
                set((state) => {
                    const existingLog = state.adherenceLogs.find(
                        (log) =>
                            log.routineId === routineId &&
                            log.productId === productId &&
                            log.scheduleType === scheduleType &&
                            log.date === date
                    );

                    if (existingLog) {
                        // Toggle status
                        return {
                            adherenceLogs: state.adherenceLogs.map((log) =>
                                log.id === existingLog.id
                                    ? {
                                        ...log,
                                        status: log.status === 'checked' ? 'pending' : 'checked',
                                        timestamp: new Date(),
                                    }
                                    : log
                            ),
                        };
                    } else {
                        // Create new log
                        const newLog: LogAdherence = {
                            id: `log-${Date.now()}`,
                            routineId,
                            productId,
                            scheduleType,
                            date,
                            status: 'checked',
                            timestamp: new Date(),
                        };
                        return { adherenceLogs: [...state.adherenceLogs, newLog] };
                    }
                });
            },

            getProductStatus: (routineId, productId, scheduleType, date) => {
                const log = get().adherenceLogs.find(
                    (l) =>
                        l.routineId === routineId &&
                        l.productId === productId &&
                        l.scheduleType === scheduleType &&
                        l.date === date
                );
                return log?.status ?? 'pending';
            },

            getPatientRoutine: (scheduleType) => {
                const patientId = get().currentPatient?.id;
                if (!patientId) return undefined;
                return get().routines.find(
                    (r) => r.patientId === patientId && r.scheduleType === scheduleType
                );
            },

            getProductById: (id) => get().products.find((p) => p.id === id),

            // Patient Management Actions
            addPatient: (patientData) => {
                const newPatient: User = {
                    ...patientData,
                    id: `patient-${Date.now()}`,
                    role: 'patient',
                };
                set((state) => ({ patients: [...state.patients, newPatient] }));
                return newPatient;
            },

            updatePatient: (id, updates) => {
                set((state) => ({
                    patients: state.patients.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },

            deletePatient: (id) => {
                set((state) => ({
                    patients: state.patients.filter((p) => p.id !== id),
                    routines: state.routines.filter((r) => r.patientId !== id),
                    adherenceLogs: state.adherenceLogs.filter(
                        (l) => !state.routines.find((r) => r.patientId === id && r.id === l.routineId)
                    ),
                }));
            },

            // Routine Assignment Actions
            assignRoutineToPatient: (patientId, productIds, scheduleType) => {
                const { products, currentPro } = get();
                const routineProducts = productIds
                    .map((id, index) => {
                        const product = products.find((p) => p.id === id);
                        return product ? { ...product, order: index, isCompleted: false, instructions: '' } : null;
                    })
                    .filter(Boolean) as import('./types').RoutineProduct[];

                const newRoutine: Routine = {
                    id: `routine-${scheduleType}-${Date.now()}`,
                    patientId,
                    proId: currentPro?.id || 'pro-1',
                    scheduleType,
                    products: routineProducts,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set((state) => ({ routines: [...state.routines, newRoutine] }));
                return newRoutine;
            },

            updateRoutine: (routineId, productIds) => {
                const { products } = get();
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === routineId
                            ? {
                                ...r,
                                products: productIds
                                    .map((id, index) => {
                                        const product = products.find((p) => p.id === id);
                                        return product ? { ...product, order: index, isCompleted: false } : null;
                                    })
                                    .filter(Boolean) as import('./types').RoutineProduct[],
                                updatedAt: new Date(),
                            }
                            : r
                    ),
                }));
            },

            removeProductFromRoutine: (routineId, productId) => {
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === routineId
                            ? {
                                ...r,
                                products: r.products.filter((p) => p.id !== productId),
                                updatedAt: new Date(),
                            }
                            : r
                    ),
                }));
            },

            addProductToRoutine: (routineId, productId) => {
                const product = get().products.find((p) => p.id === productId);
                if (!product) return;

                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === routineId
                            ? {
                                ...r,
                                products: [...r.products, { ...product, order: r.products.length, isCompleted: false }],
                                updatedAt: new Date(),
                            }
                            : r
                    ),
                }));
            },

            // Pro: Data Access
            getPatientSummaries: () => {
                const { patients, routines, adherenceLogs } = get();
                const treatmentTypes = ['Tratamiento Acné', 'Cuidado Eczema', 'Anti-Aging'];

                return patients
                    .filter((p) => p.role === 'patient')
                    .map((patient, index) => {
                        const patientRoutines = routines.filter((r) => r.patientId === patient.id);
                        const currentRoutine = patientRoutines[0];
                        const adherence = currentRoutine
                            ? calculateWeeklyAdherence(adherenceLogs, currentRoutine)
                            : 0;

                        return {
                            patient,
                            adherencePercentage: adherence,
                            currentRoutine,
                            lastCheck: new Date(),
                            riskLevel: getAdherenceRiskLevel(adherence),
                            treatmentType: treatmentTypes[index % treatmentTypes.length],
                            dayNumber: Math.floor(Math.random() * 30) + 1,
                        };
                    });
            },

            getPatientById: (id) => get().patients.find((p) => p.id === id),

            getRoutinesByPatient: (patientId) =>
                get().routines.filter((r) => r.patientId === patientId),

            addClinicalNote: (note) => {
                const newNote: ClinicalNote = {
                    ...note,
                    id: `note-${Date.now()}`,
                    createdAt: new Date(),
                };
                set((state) => ({ clinicalNotes: [...state.clinicalNotes, newNote] }));
            },

            getClinicalNotes: (patientId) =>
                get().clinicalNotes.filter((n) => n.patientId === patientId),

            // Appointment Actions
            addAppointment: (appointmentData) => {
                const newAppointment: Appointment = {
                    ...appointmentData,
                    id: `apt-${Date.now()}`,
                    createdAt: new Date(),
                };
                set((state) => ({ appointments: [...state.appointments, newAppointment] }));
                return newAppointment;
            },

            updateAppointmentStatus: (id, status) => {
                set((state) => ({
                    appointments: state.appointments.map((apt) =>
                        apt.id === id ? { ...apt, status } : apt
                    ),
                }));
            },

            cancelAppointment: (id) => {
                set((state) => ({
                    appointments: state.appointments.map((apt) =>
                        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
                    ),
                }));
            },

            getPatientAppointments: (patientId) => {
                return get().appointments.filter((apt) => apt.patientId === patientId);
            },

            getDoctorAppointments: (proId, date) => {
                const appointments = get().appointments.filter((apt) => apt.proId === proId);
                if (date) {
                    return appointments.filter((apt) => apt.date === date);
                }
                return appointments;
            },

            getNextPatientAppointment: (patientId) => {
                const today = formatDate(new Date());
                return get()
                    .appointments
                    .filter(
                        (apt) =>
                            apt.patientId === patientId &&
                            apt.date >= today &&
                            apt.status !== 'cancelled' &&
                            apt.status !== 'completed'
                    )
                    .sort((a, b) => {
                        if (a.date === b.date) {
                            return a.time.localeCompare(b.time);
                        }
                        return a.date.localeCompare(b.date);
                    })[0];
            },
        }),
        {
            name: 'dermocare-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                adherenceLogs: state.adherenceLogs,
                clinicalNotes: state.clinicalNotes,
                appointments: state.appointments,
                templates: state.templates,
                routines: state.routines,
            }),
        }
    )
);
