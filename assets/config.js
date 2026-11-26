/* Paper Build account settings. These values are public by design (safe to commit).
   Fill them in after creating the Supabase project — see SETUP.md. Leave supabaseUrl empty
   to run without accounts (everything unlocked, nothing saved online). */
window.PB_CONFIG = {
  supabaseUrl: 'https://uvfpkcjdnpeeeewfoasf.supabase.co',
  supabaseAnonKey: 'sb_publishable_VUxgnUbKznzW-aApao-xfA_ToykAmgk', // publishable key (public by design)
  siteUrl: 'https://kalpeshkatare.in/Paperbuild/app.html', // where email links send people back
  google: false,            // set true after enabling Google in Supabase → Authentication → Providers
  microsoft: false,         // set true after enabling Azure (Microsoft) in Supabase → Authentication → Providers
  phone: false              // set true after adding an SMS provider in Supabase → Authentication → Providers → Phone
};
