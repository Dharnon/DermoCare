import { supabase } from './supabase';

export interface Invitation {
    id: string;
    token: string;
    email?: string;
    organization_id?: string;
    invited_by: string;
    role: 'patient' | 'pro';
    status: 'pending' | 'accepted' | 'expired';
    created_at: string;
    expires_at: string;
    accepted_at?: string;
}

export const invitationService = {
    /**
     * Create a new invitation (for professionals to invite patients)
     */
    async createInvitation(
        invitedBy: string,
        organizationId: string,
        email?: string
    ): Promise<{ invitation: Invitation | null; inviteUrl: string | null; error: Error | null }> {
        const { data, error } = await supabase
            .from('invitations')
            .insert({
                email,
                organization_id: organizationId,
                invited_by: invitedBy,
                role: 'patient',
            })
            .select()
            .single();

        if (error) {
            return { invitation: null, inviteUrl: null, error };
        }

        // Generate invite URL
        const productionUrl = 'https://dermo-care.vercel.app';
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || productionUrl;

        const inviteUrl = `${baseUrl}/invite/${data.token}`;

        return { invitation: data, inviteUrl, error: null };
    },

    /**
     * Validate an invitation token
     */
    async validateInvitation(token: string): Promise<{ invitation: Invitation | null; valid: boolean }> {
        const { data, error } = await supabase
            .from('invitations')
            .select('*, organization:organizations(*)')
            .eq('token', token)
            .eq('status', 'pending')
            .single();

        if (error || !data) {
            return { invitation: null, valid: false };
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
            await supabase
                .from('invitations')
                .update({ status: 'expired' })
                .eq('id', data.id);
            return { invitation: null, valid: false };
        }

        return { invitation: data, valid: true };
    },

    /**
     * Accept an invitation (called after user registers)
     */
    async acceptInvitation(token: string, userId: string): Promise<boolean> {
        const { data: invitation, error } = await supabase
            .from('invitations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
            })
            .eq('token', token)
            .eq('status', 'pending')
            .select()
            .single();

        if (error || !invitation) {
            return false;
        }

        // Update user profile as verified
        await supabase
            .from('profiles')
            .update({
                is_verified: true,
                organization_id: invitation.organization_id,
                invited_by: invitation.invited_by,
                invitation_token: token,
            })
            .eq('id', userId);

        return true;
    },

    /**
     * Verify a patient (for professionals to manually verify without invitation)
     */
    async verifyPatient(patientId: string, verifiedBy: string): Promise<boolean> {
        const { error } = await supabase
            .from('profiles')
            .update({
                is_verified: true,
                invited_by: verifiedBy,
            })
            .eq('id', patientId);

        return !error;
    },

    /**
     * Get pending invitations for an organization
     */
    async getPendingInvitations(organizationId: string): Promise<Invitation[]> {
        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        return error ? [] : data || [];
    },

    /**
     * Revoke an invitation
     */
    async revokeInvitation(invitationId: string): Promise<boolean> {
        const { error } = await supabase
            .from('invitations')
            .update({ status: 'expired' })
            .eq('id', invitationId);

        return !error;
    },
};
