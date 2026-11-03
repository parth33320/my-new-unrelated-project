import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// The live Render cloud backend and database are used for live TDD verification
const RENDER_BASE_URL = process.env.RENDER_BASE_URL || 'https://my-new-unrelated-project.onrender.com';

describe('Feature 5 — Custom Deck Creator CRUD (Stories 14–18) against Real Render DB', () => {
  it('POST /api/decks with valid title returns 201 and { id, title, player_id }', async () => {
    // Unique test player per run
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    assert.equal(playerRes.status, 201);
    const player = await playerRes.json();
    const playerId = player.id;

    const deckTitle = `Test Deck ${Date.now()}`;
    const res = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, playerId: playerId, title: deckTitle, deck_title: deckTitle }),
    });
    assert.equal(res.status, 201, 'POST /api/decks with valid title returns 201');
    const createdDeck = await res.json();
    assert.ok(createdDeck.id, 'Response includes id');
    const titleVal = createdDeck.title ?? createdDeck.deck_title;
    assert.equal(titleVal, deckTitle, 'Response includes title matching created title');
    assert.equal(createdDeck.player_id, playerId, 'Response includes player_id');

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('GET /api/decks?playerId=X returns array including the new deck', async () => {
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    assert.equal(playerRes.status, 201);
    const player = await playerRes.json();
    const playerId = player.id;

    const deckTitle = `Test Deck ${Date.now()}`;
    const postRes = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, title: deckTitle, deck_title: deckTitle }),
    });
    assert.equal(postRes.status, 201);
    const createdDeck = await postRes.json();

    // Query with player_id / playerId
    let getRes = await fetch(`${RENDER_BASE_URL}/api/decks?playerId=${playerId}`);
    if (getRes.status === 400) {
      getRes = await fetch(`${RENDER_BASE_URL}/api/decks?player_id=${playerId}`);
    }
    assert.equal(getRes.status, 200, 'GET /api/decks?playerId=X returns 200');
    const deckList = await getRes.json();
    assert.ok(Array.isArray(deckList), 'Response is array');
    const found = deckList.find((d) => d.id === createdDeck.id);
    assert.ok(found, 'Array includes the new deck');
    assert.equal(found.deck_title ?? found.title, deckTitle);

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('PATCH /api/decks/:id with new title returns 200 with updated title', async () => {
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    const player = await playerRes.json();
    const playerId = player.id;

    const postRes = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, title: `Deck ${Date.now()}` }),
    });
    const createdDeck = await postRes.json();

    const newTitle = `Updated Title ${Date.now()}`;
    const patchRes = await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, deck_title: newTitle }),
    });
    assert.equal(patchRes.status, 200, 'PATCH /api/decks/:id with new title returns 200');
    const updated = await patchRes.json();
    assert.equal(updated.title ?? updated.deck_title, newTitle, 'Returns updated title');

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('DELETE /api/decks/:id returns 204; subsequent GET no longer includes it', async () => {
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    const player = await playerRes.json();
    const playerId = player.id;

    const postRes = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, title: `Deck to Delete ${Date.now()}` }),
    });
    const createdDeck = await postRes.json();

    const deleteRes = await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, {
      method: 'DELETE',
    });
    assert.ok([200, 204].includes(deleteRes.status), 'DELETE /api/decks/:id returns 204 or 200');

    // Subsequent GET verification
    const getRes = await fetch(`${RENDER_BASE_URL}/api/decks?player_id=${playerId}`);
    assert.equal(getRes.status, 200);
    const list = await getRes.json();
    assert.ok(!list.some((d) => d.id === createdDeck.id), 'Subsequent GET no longer includes deleted deck');
  });

  it('POST /api/decks with blank title returns 400 with error message', async () => {
    const res = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: 1, title: '   ', deck_title: '   ' }),
    });
    assert.equal(res.status, 400, 'POST /api/decks with blank title returns 400');
    const body = await res.json();
    assert.ok(body.error && body.error.length > 0, 'Error message is present');
  });

  it('PATCH /api/decks/:id with blank title returns 400', async () => {
    // Create temporary deck to patch
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    const player = await playerRes.json();

    const postRes = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, title: 'Valid Before Blank Patch' }),
    });
    const createdDeck = await postRes.json();

    const patchRes = await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ', deck_title: '   ' }),
    });
    assert.equal(patchRes.status, 400, 'PATCH /api/decks/:id with blank title returns 400');

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('POST /api/decks/:id/words adds a word to the deck', async () => {
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    const player = await playerRes.json();

    const postRes = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, title: 'Word Deck' }),
    });
    const createdDeck = await postRes.json();

    const wordRes = await fetch(`${RENDER_BASE_URL}/api/words/random`);
    const wordData = await wordRes.json();
    const wordId = wordData.id;

    const addRes = await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_id: wordId, wordId: wordId }),
    });
    assert.equal(addRes.status, 201, 'POST /api/decks/:id/words returns 201');

    // Assert word in GET
    const getRes = await fetch(`${RENDER_BASE_URL}/api/decks?player_id=${player.id}`);
    const list = await getRes.json();
    const deck = list.find((d) => d.id === createdDeck.id);
    assert.ok(deck.words.some((w) => w.id === wordId), 'Word exists in deck');

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('DELETE /api/decks/:id/words/:wordId removes that word', async () => {
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    const player = await playerRes.json();

    const postRes = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, title: 'Word Deck Remove' }),
    });
    const createdDeck = await postRes.json();

    const wordRes = await fetch(`${RENDER_BASE_URL}/api/words/random`);
    const wordData = await wordRes.json();
    const wordId = wordData.id;

    // Add word
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_id: wordId }),
    });

    // Remove word
    const delRes = await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}/words/${wordId}`, {
      method: 'DELETE',
    });
    assert.ok([200, 204].includes(delRes.status), 'DELETE word returns 200 or 204');

    // Assert word removed
    const getRes = await fetch(`${RENDER_BASE_URL}/api/decks?player_id=${player.id}`);
    const list = await getRes.json();
    const deck = list.find((d) => d.id === createdDeck.id);
    assert.ok(!deck.words.some((w) => w.id === wordId), 'Word no longer in deck');

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('Security: POST /api/decks with title "<script>alert(1)</script>" is stored as literal string', async () => {
    const uniqueUsername = `p_${Date.now() % 1000000000}_${Math.floor(Math.random() * 1000)}`;
    const playerRes = await fetch(`${RENDER_BASE_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueUsername }),
    });
    const player = await playerRes.json();

    const xssPayload = '<script>alert(1)</script>';
    const res = await fetch(`${RENDER_BASE_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, title: xssPayload }),
    });
    assert.equal(res.status, 201);
    const createdDeck = await res.json();
    const storedTitle = createdDeck.title ?? createdDeck.deck_title;
    assert.equal(storedTitle, xssPayload, 'XSS string stored as literal string and not evaluated');

    // Clean up
    await fetch(`${RENDER_BASE_URL}/api/decks/${createdDeck.id}`, { method: 'DELETE' });
  });

  it('Security: DELETE /api/decks/99999999 returns 404', async () => {
    const res = await fetch(`${RENDER_BASE_URL}/api/decks/99999999`, {
      method: 'DELETE',
    });
    assert.equal(res.status, 404, 'DELETE non-existent deck returns 404');
    const body = await res.json();
    assert.ok(body.error, 'Returns 404 error payload');
  });
});
