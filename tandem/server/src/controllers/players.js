// TODO: Use parameterized pg queries. Return 409 for duplicate usernames
// and 404 for missing players. Deleting a player cascades to their scores.
export function createPlayer(req, res) {
  res.status(501).json({ error: 'TODO: Create a player.' });
}
export function getPlayer(req, res) {
  res.status(501).json({ error: 'TODO: Return a profile and its 10 most recent scores.' });
}
export function renamePlayer(req, res) {
  res.status(501).json({ error: 'TODO: Rename a player.' });
}
export function deletePlayer(req, res) {
  res.status(501).json({ error: 'TODO: Delete a player.' });
}
