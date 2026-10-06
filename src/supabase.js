import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null until you fill in .env, so the site still shows sample data
// pkce: OAuth returns ?code=… in the query string instead of tokens in the #hash, which the hash router uses
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null
