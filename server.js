const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const ROOT = path.join(__dirname);
const GENERATION = path.join(ROOT, 'generation');
const POSTED = path.join(GENERATION, 'posted');
const QUIZZES = path.join(GENERATION, 'quizzes');

// Ensure posted directory exists
fs.mkdirSync(POSTED, { recursive: true });

// Serve frontend from /public
app.use(express.static(path.join(ROOT, 'public')));

// Serve videos from /generation/posted at /posted
app.use('/posted', express.static(POSTED));

// JSON body for POST /api/generate
app.use(express.json());

// GET /api/videos — list video filenames in generation/posted
app.get('/api/videos', (req, res) => {
  try {
    const files = fs.readdirSync(POSTED).filter((f) => /\.(mp4|webm|mov)$/i.test(f));
    res.json(files.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:videoId — return generation/quizzes/{videoId}.json (e.g. 001.mp4 → 001)
app.get('/api/quiz/:videoId', (req, res) => {
  try {
    const videoId = req.params.videoId;

    // Construct quiz file path
    const quizPath = path.join(__dirname, 'generation', 'quizzes', `${videoId}.json`);

    console.log('Quiz request for videoId:', videoId);
    console.log('Looking for quiz at:', quizPath);

    // Check if quiz file exists
    if (!fs.existsSync(quizPath)) {
      console.log('Quiz not found');
      return res.sendStatus(404);
    }

    // Read and return quiz JSON
    const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));

    console.log('Quiz found, sending to client');

    res.status(200).json(quizData);
  } catch (error) {
    console.error('Quiz endpoint error:', error);
    res.sendStatus(500);
  }
});

// GET /api/characters — return generation/characters.json
app.get('/api/characters', (req, res) => {
  const file = path.join(GENERATION, 'characters.json');
  try {
    const data = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/generate — run python3 generation/video_generation.py character1 character2 topic duration; stream stdout to console
app.post('/api/generate', (req, res) => {
  const { character1, character2, topic, duration } = req.body || {};
  if (!character1 || !character2 || duration == null) {
    return res.status(400).json({ error: 'Missing character1, character2, or duration' });
  }
  const durationNum = Number(duration);
  if (!Number.isInteger(durationNum) || durationNum < 1) {
    return res.status(400).json({ error: 'duration must be a positive integer' });
  }
  const topicStr = topic != null ? String(topic).trim() : 'BrainRot Academy';

  const args = ['video_generation.py', String(character1), String(character2), topicStr, String(durationNum)];
  const proc = spawn('python3', args, {
    cwd: GENERATION,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (chunk) => process.stdout.write(chunk.toString()));
  proc.stderr.on('data', (chunk) => process.stderr.write(chunk.toString()));

  proc.on('close', (code) => {
    if (code === 0) {
      res.json({ ok: true });
    } else {
      res.status(500).json({ error: `Script exited with code ${code}` });
    }
  });

  proc.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});

const PORT = process.env.PORT || 3000;
const os = require('os');

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
}

const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://${localIP}:${PORT}`);
});
