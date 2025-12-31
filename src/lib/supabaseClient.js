
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

let supabaseInstance = null;

if (supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && supabaseKey) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
        console.error("Supabase Init Error:", e);
    }
} else {
    console.warn("Supabase credentials missing! Using mock client.");
}

// Fallback mock client to prevent app crash
export const supabase = supabaseInstance || {
    from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ data: null, error: "Supabase not configured" })
    })
};
