import { supabase } from './supabase';
import type {
    User,
    Product,
    Routine,
    LogAdherence,
    Appointment,
    ClinicalNote,
    ScheduleType,
    AppointmentStatus
} from './types';

// ============================================
// PATIENT SERVICES
// ============================================

export const patientService = {
    async getRoutines(patientId: string) {
        const { data, error } = await supabase
            .from('routines')
            .select(`
                *,
                routine_products (
                    *,
                    product:products (*)
                )
            `)
            .eq('patient_id', patientId);

        if (error) throw error;
        return data;
    },

    async toggleadherence(params: {
        routineId: string;
        productId: string;
        scheduleType: string;
        date: string;
        status: 'checked' | 'pending';
    }) {
        const { data, error } = await supabase
            .from('adherence_logs')
            .upsert({
                routine_id: params.routineId,
                product_id: params.productId,
                schedule_type: params.scheduleType,
                date: params.date,
                status: params.status,
                timestamp: new Date().toISOString()
            }, {
                onConflict: 'routine_id,product_id,date,schedule_type'
            });

        if (error) throw error;
        return data;
    },

    async getAdherenceLogs(patientId: string, startDate: string, endDate: string) {
        // First, get all routine IDs for this patient
        const { data: routines } = await supabase
            .from('routines')
            .select('id')
            .eq('patient_id', patientId);

        if (!routines || routines.length === 0) {
            return [];
        }

        const routineIds = routines.map((r: { id: string }) => r.id);

        // Then, get adherence logs for those routines
        const { data, error } = await supabase
            .from('adherence_logs')
            .select('*')
            .in('routine_id', routineIds)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;
        return data || [];
    }
};

// ============================================
// DOCTOR SERVICES
// ============================================

export const doctorService = {
    async getPatients() {
        const { data, error } = await supabase
            .from('patient_summaries')
            .select('*');

        if (error) throw error;
        return data;
    },

    async assignRoutine(params: {
        patientId: string;
        proId: string;
        scheduleType: string;
        productIds: string[];
    }) {
        const { data, error } = await supabase.rpc('assign_routine', {
            p_patient_id: params.patientId,
            p_pro_id: params.proId,
            p_schedule_type: params.scheduleType,
            p_product_ids: params.productIds
        });

        if (error) throw error;
        return data;
    },

    async addClinicalNote(note: Omit<ClinicalNote, 'id' | 'createdAt'>) {
        const { data, error } = await supabase
            .from('clinical_notes')
            .insert({
                patient_id: note.patientId,
                pro_id: note.proId,
                content: note.content
            });

        if (error) throw error;
        return data;
    }
};

// ============================================
// COMMON SERVICES
// ============================================

export const appointmentService = {
    async getAppointments(userId: string, role: 'patient' | 'pro') {
        const query = supabase
            .from('appointments')
            .select(`
                *,
                patient:profiles!patient_id(*),
                pro:profiles!pro_id(*)
            `);

        if (role === 'patient') {
            query.eq('patient_id', userId);
        } else {
            query.eq('pro_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>) {
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: appointment.patientId,
                pro_id: appointment.proId,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status,
                visit_type: appointment.visitType,
                reason: appointment.reason
            });

        if (error) throw error;
        return data;
    }
};

// ============================================
// ORGANIZATION & ONBOARDING
// ============================================

export const organizationService = {
    async createOrganization(name: string, adminId: string) {
        // 1. Create the organization
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({ name, slug })
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Link the admin user
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                organization_id: org.id,
                role: 'pro'
            })
            .eq('id', adminId);

        if (profileError) throw profileError;

        return org;
    },

    async joinWithInvitation(token: string) {
        const { data, error } = await supabase.rpc('accept_invitation', { p_token: token });
        if (error) throw error;
        return data;
    },

    async getMyOrg(orgId: string) {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

        if (error) throw error;
        return data;
    },

    async searchOrganizations(query: string) {
        if (!query || query.trim().length < 2) return [];
        
        const sanitizedQuery = query.trim().slice(0, 100);
        
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name, slug, logo_url')
                .ilike('name', `%${sanitizedQuery}%`)
                .limit(5);

            if (error) {
                console.error('Search org error:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('Search org failed:', err);
            return [];
        }
    }
};

// ============================================
// TEMPLATE SERVICES
// ============================================

export const templateService = {
    async getTemplates(orgId: string) {
        const { data, error } = await supabase
            .from('routine_templates')
            .select(`
                *,
                routine_template_products (
                    *,
                    product:products (*)
                )
            `)
            .eq('organization_id', orgId);

        if (error) throw error;
        return data;
    },

    async createTemplate(params: {
        name: string,
        icon: string,
        scheduleType: string,
        organizationId: string
    }) {
        const { data, error } = await supabase
            .from('routine_templates')
            .insert({
                name: params.name,
                icon: params.icon,
                schedule_type: params.scheduleType,
                organization_id: params.organizationId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async addProductToTemplate(params: {
        templateId: string,
        productId: string,
        instructions: string,
        order: number
    }) {
        const { data, error } = await supabase
            .from('routine_template_products')
            .insert({
                template_id: params.templateId,
                product_id: params.productId,
                instructions: params.instructions,
                order: params.order
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTemplateProduct(id: string, updates: { instructions?: string, order?: number }) {
        const { data, error } = await supabase
            .from('routine_template_products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeProductFromTemplate(id: string) {
        const { error } = await supabase
            .from('routine_template_products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};


