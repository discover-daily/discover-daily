import { app } from '../core/app';
import {
  deleteTokensBySession,
  getSessionToken,
  hasSession,
} from '../services/auth';
import { randomBytes } from 'crypto';
import { asyncClient } from '../core/redis';

app.get('/api/auth/login', async (req, res) => {
  const state = randomBytes(4).toString('hex');
  await asyncClient('setex', state, 30, 'true');

  // TODO: Move this to the integrations/spotify library
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code` +
      `&client_id=${process.env.SPOTIFY_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}` +
      `&state=${encodeURIComponent(state)}`
  );
});

app.get('/api/auth/session', async (req, res) => {
  if (await hasSession(req)) {
    res.status(200);
  } else {
    res.status(404);
  }
  res.send();
});

app.post('/api/auth/logout', async (req, res) => {
  const sessionId = await getSessionToken(req);
  if (sessionId) {
    await deleteTokensBySession(sessionId);
    res.cookie('session', null, { maxAge: 0 });
    res.status(204);
  } else {
    res.status(404);
  }
  res.send();
});
