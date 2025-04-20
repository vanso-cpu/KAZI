const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the anon key instead of the access token
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Using URL:', supabaseUrl);
console.log('Using Key:', supabaseKey ? 'Key is present' : 'Key is missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNotificationsTable() {
  try {
    console.log('Creating notifications table...');
    
    // Execute SQL directly
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('payment', 'booking', 'system', 'chat')),
        is_read BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('Error creating notifications table:', createError);
      return;
    }
    
    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL });
    
    if (indexError) {
      console.error('Error creating indexes:', indexError);
      return;
    }
    
    // Enable RLS
    const enableRLSSQL = `
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own notifications"
        ON public.notifications FOR SELECT
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own notifications"
        ON public.notifications FOR UPDATE
        USING (auth.uid() = user_id);
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
    
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
      return;
    }
    
    // Create triggers
    const createTriggersSQL = `
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS handle_updated_at ON public.notifications;
      CREATE TRIGGER handle_updated_at
        BEFORE UPDATE ON public.notifications
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggersSQL });
    
    if (triggerError) {
      console.error('Error creating triggers:', triggerError);
      return;
    }
    
    // Add to realtime
    const realtimeSQL = `
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    `;
    
    const { error: realtimeError } = await supabase.rpc('exec_sql', { sql: realtimeSQL });
    
    if (realtimeError) {
      console.error('Error adding to realtime:', realtimeError);
      return;
    }
    
    console.log('Notifications table created successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createNotificationsTable()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Script failed:', err))
  .finally(() => process.exit(0)); 