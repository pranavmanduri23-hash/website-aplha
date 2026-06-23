require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

app.use(express.json());

// Main Route: Tracks visitor and displays welcome message
app.get('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Log the visitor to Supabase
    const { error } = await supabase
      .from('visitors')
      .insert([{ ip_address: ip }]);

    if (error) throw error;

    res.send('<h1>Welcome to Birla Open Minds Hub</h1><p>Your visit has been logged.</p>');
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).send('Error logging visitor.');
  }
});

// Admin Route: Get total count
app.get('/admin/stats', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    res.json({ totalVisitors: count });
  } catch (err) {
    res.status(500).send('Error fetching stats.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
