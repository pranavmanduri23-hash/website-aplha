import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const app = express();
app.use(express.json());

// Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test database connection
app.get('/api/visitors', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(process.cwd(), 'dist', 'public');

  app.use(express.static(publicPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
