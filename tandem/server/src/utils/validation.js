export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function parseId(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647) {
    throw httpError(400, 'Player ID must be a positive integer.');
  }
  return Number(value);
}

export function parseUsername(value) {
  if (typeof value !== 'string' || !/^[\p{L}\p{N}_-]{2,24}$/u.test(value.trim())) {
    throw httpError(400, 'Use 2–24 letters, numbers, underscores, or hyphens.');
  }
  return value.trim();
}

export function parseDirection(value = 'zh-ja') {
  if (!['zh-ja', 'ja-zh'].includes(value)) throw httpError(400, 'Direction must be zh-ja or ja-zh.');
  return value;
}
