const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read SQL from file
const sql = fs.readFileSync('./fix-db.sql', 'utf8');

// Split SQL into separate statements
const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0)
  .map(stmt => stmt + ';');

async function main() {
  try {
    console.log('Starting database fix...');
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      const { error } = await supabase.rpc('pg_query', { query: statement });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        // Continue with next statement
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('All statements processed');
    
    // Verify the table exists
    const { data: tableExists, error: checkError } = await supabase.rpc('pg_query', { 
      query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications');" 
    });
    
    if (checkError) {
      console.error('Error verifying table:', checkError);
    } else {
      console.log('Verification result:', tableExists);
      console.log('Table creation ' + (tableExists?.[0]?.exists ? 'succeeded' : 'failed'));
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main()
  .then(() => console.log('Process completed'))
  .catch(err => console.error('Process failed:', err))
  .finally(() => process.exit(0)); 