export const pool = {
  async query(sql, params) {
    // Tracer bullet slice: hardcoded word row
    return {
      rows: [
        {
          id: 1,
          jp_form: '海軍',
          meaning_ja: 'navy',
          options: ['navy', 'army', 'air force', 'police']
        }
      ]
    };
  }
};
