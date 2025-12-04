import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    getUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        return { user, error }
    },

    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        return { session, error }
    },

    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback)
    }
}

// Database helpers
export const db = {
    // Deliveries
    getDeliveries: async () => {
        const { data, error } = await supabase
            .from('deliveries')
            .select(`
        *,
        customer:customers(*),
        created_by_user:profiles(*)
      `)
            .order('created_at', { ascending: false })
        return { data, error }
    },

    getDeliveryById: async (id) => {
        const { data, error } = await supabase
            .from('deliveries')
            .select(`
        *,
        customer:customers(*),
        created_by_user:profiles(*),
        tracking_updates(*)
      `)
            .eq('id', id)
            .single()
        return { data, error }
    },

    getDeliveryByTrackingCode: async (trackingCode) => {
        const { data, error } = await supabase
            .from('deliveries')
            .select(`
        *,
        customer:customers(*),
        tracking_updates(*)
      `)
            .eq('tracking_code', trackingCode)
            .single()
        return { data, error }
    },

    createDelivery: async (delivery) => {
        const { data, error } = await supabase
            .from('deliveries')
            .insert([delivery])
            .select()
            .single()
        return { data, error }
    },

    updateDelivery: async (id, updates) => {
        const { data, error } = await supabase
            .from('deliveries')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    deleteDelivery: async (id) => {
        const { error } = await supabase
            .from('deliveries')
            .delete()
            .eq('id', id)
        return { error }
    },

    // Tracking Updates
    getTrackingUpdates: async (deliveryId) => {
        const { data, error } = await supabase
            .from('tracking_updates')
            .select('*')
            .eq('delivery_id', deliveryId)
            .order('created_at', { ascending: false })
        return { data, error }
    },

    addTrackingUpdate: async (update) => {
        const { data, error } = await supabase
            .from('tracking_updates')
            .insert([update])
            .select()
            .single()
        return { data, error }
    },

    // Customers
    getCustomers: async () => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true })
        return { data, error }
    },

    getCustomerById: async (id) => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    },

    createCustomer: async (customer) => {
        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()
            .single()
        return { data, error }
    },

    updateCustomer: async (id, updates) => {
        const { data, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    // Profiles
    getProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        return { data, error }
    },

    updateProfile: async (userId, updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()
        return { data, error }
    }
}

// Realtime subscriptions
export const realtime = {
    subscribeToDelivery: (deliveryId, callback) => {
        return supabase
            .channel(`delivery:${deliveryId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'deliveries',
                    filter: `id=eq.${deliveryId}`
                },
                callback
            )
            .subscribe()
    },

    subscribeToTrackingUpdates: (deliveryId, callback) => {
        return supabase
            .channel(`tracking:${deliveryId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tracking_updates',
                    filter: `delivery_id=eq.${deliveryId}`
                },
                callback
            )
            .subscribe()
    },

    unsubscribe: (channel) => {
        return supabase.removeChannel(channel)
    }
}
