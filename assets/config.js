/* Paper Build account settings. These values are public by design (safe to commit).
   Fill them in after creating the Supabase project — see SETUP.md. Leave supabaseUrl empty
   to run without accounts (everything unlocked, nothing saved online). */
window.PB_CONFIG = {
  supabaseUrl: '',          // e.g. 'https://abcd1234.supabase.co'
  supabaseAnonKey: '',      // Project Settings → API → anon public key
  siteUrl: 'https://kalpeshkatare.in/Paperbuild/app.html', // where email links send people back
  google: false,            // set true after enabling Google in Supabase → Authentication → Providers
  phone: false              // set true after adding an SMS provider in Supabase → Authentication → Providers → Phone
};
