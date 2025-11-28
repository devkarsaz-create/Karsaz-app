const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
      return;
    }
    
    console.log('✅ Categories connection successful!');
    console.log('📊 Sample categories:', categories.map(c => ({ name: c.name, icon: c.icon })));
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users error:', usersError);
      return;
    }
    
    console.log('✅ Users table accessible!');
    
    // Test ads table
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('*')
      .limit(1);
    
    if (adsError) {
      console.error('❌ Ads error:', adsError);
      return;
    }
    
    console.log('✅ Ads table accessible!');
    
    console.log('🎉 All database connections working perfectly!');
    
  } catch (error) {
    console.error('💥 Connection failed:', error);
  }
}

testConnection();
