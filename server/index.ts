// server/index.ts
import 'dotenv/config'; // Loads your .env file
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Initialize Supabase using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Example API route
app.get('/api/stats', async (req, res) => {
  const { data, error } = await supabase.from('visitors').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/public'));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
