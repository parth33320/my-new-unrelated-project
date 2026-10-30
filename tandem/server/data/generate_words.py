import urllib.request
import gzip
import re
import json
import random

PINYIN_TONE_MAP = {
    'a': ['a', 'ā', 'á', 'ǎ', 'à', 'a'],
    'e': ['e', 'ē', 'é', 'ě', 'è', 'e'],
    'i': ['i', 'ī', 'í', 'ǐ', 'ì', 'i'],
    'o': ['o', 'ō', 'ó', 'ǒ', 'ò', 'o'],
    'u': ['u', 'ū', 'ú', 'ǔ', 'ù', 'u'],
    'v': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
}

def pinyin_num_to_accent(pinyin_str):
    tokens = pinyin_str.split()
    converted = []
    for token in tokens:
        m = re.match(r'^([a-zA-BVvüÜ:]+)(\d)$', token)
        if not m:
            converted.append(token)
            continue
        word, tone = m.group(1), int(m.group(2))
        word = word.replace('v', 'ü').replace('u:', 'ü')
        if tone == 5 or tone == 0:
            converted.append(word)
            continue

        target_idx = -1
        word_lower = word.lower()
        if 'a' in word_lower:
            target_idx = word_lower.find('a')
        elif 'e' in word_lower:
            target_idx = word_lower.find('e')
        elif 'ou' in word_lower:
            target_idx = word_lower.find('o')
        else:
            for i in range(len(word_lower) - 1, -1, -1):
                if word_lower[i] in 'iouvü':
                    target_idx = i
                    break

        if target_idx != -1:
            char = word[target_idx]
            is_upper = char.isupper()
            char_lower = char.lower()
            accented = PINYIN_TONE_MAP.get(char_lower, [char_lower]*6)[tone]
            if is_upper:
                accented = accented.upper()
            word = word[:target_idx] + accented + word[target_idx+1:]
        converted.append(word)
    return ' '.join(converted)

ROMAJI_HIRAGANA_MAP = [
    ('kyou', 'きょう'), ('shou', 'しょう'), ('chou', 'ちょう'), ('ryou', 'りょう'),
    ('gyou', 'ぎょう'), ('byou', 'びょう'), ('pyou', 'ぴょう'), ('hyou', 'ひょう'),
    ('myou', 'みょう'), ('kyuu', 'きゅう'), ('shuu', 'しゅう'), ('chuu', 'ちゅう'),
    ('ryuu', 'りゅう'), ('gyuu', 'ぎゅう'), ('byuu', 'びゅう'), ('pyuu', 'ぴゅう'),
    ('hyuu', 'ひゅう'), ('myuu', 'みゅう'), ('kya', 'きゃ'), ('sha', 'しゃ'),
    ('cha', 'ちゃ'), ('rya', 'りゃ'), ('gya', 'ぎゃ'), ('bya', 'びゃ'),
    ('pya', 'ぴゃ'), ('hya', 'ひゃ'), ('mya', 'みゃ'), ('kyo', 'きょ'),
    ('sho', 'しょ'), ('cho', 'ちょ'), ('ryo', 'りょ'), ('gyo', 'ぎょ'),
    ('byo', 'びょ'), ('pyo', 'ぴょ'), ('hyo', 'ひょ'), ('myo', 'みょ'),
    ('kyu', 'きゅ'), ('shu', 'しゅ'), ('chu', 'ちゅ'), ('ryu', 'りゅ'),
    ('gyu', 'ぎゅ'), ('byu', 'びゅ'), ('pyu', 'ぴゅ'), ('hyu', 'ひゅ'),
    ('myu', 'みゅ'), ('shi', 'し'), ('chi', 'ち'), ('tsu', 'つ'),
    ('fu', 'ふ'), ('ji', 'じ'), ('kwa', 'くゎ'), ('gwa', 'ぐゎ'),
    ('aa', 'ああ'), ('ii', 'いい'), ('uu', 'うう'), ('ee', 'えい'),
    ('oo', 'おう'), ('ou', 'おう'), ('ei', 'えい'),
    ('ka', 'か'), ('ki', 'き'), ('ku', 'く'), ('ke', 'け'), ('ko', 'こ'),
    ('sa', 'さ'), ('su', 'す'), ('se', 'せ'), ('so', 'そ'),
    ('ta', 'た'), ('ti', 'ち'), ('tu', 'つ'), ('te', 'て'), ('to', 'と'),
    ('na', 'な'), ('ni', 'に'), ('nu', 'ぬ'), ('ne', 'ね'), ('no', 'の'),
    ('ha', 'は'), ('hi', 'ひ'), ('he', 'へ'), ('ho', 'ほ'),
    ('ma', 'ま'), ('mi', 'み'), ('mu', 'む'), ('me', 'め'), ('mo', 'も'),
    ('ya', 'や'), ('yu', 'ゆ'), ('yo', 'よ'),
    ('ra', 'ら'), ('ri', 'り'), ('ru', 'る'), ('re', 'れ'), ('ro', 'ろ'),
    ('wa', 'わ'), ('wo', 'を'), ('nn', 'ん'), ('n', 'ん'),
    ('ga', 'が'), ('gi', 'ぎ'), ('gu', 'ぐ'), ('ge', 'げ'), ('go', 'ご'),
    ('za', 'ざ'), ('zi', 'じ'), ('zu', 'ず'), ('ze', 'ぜ'), ('zo', 'ぞ'),
    ('da', 'だ'), ('di', 'ぢ'), ('du', 'づ'), ('de', 'で'), ('do', 'ど'),
    ('ba', 'ば'), ('bi', 'び'), ('bu', 'ぶ'), ('be', 'べ'), ('bo', 'ぼ'),
    ('pa', 'ぱ'), ('pi', 'ぴ'), ('pu', 'ぷ'), ('pe', 'ぺ'), ('po', 'ぽ'),
    ('a', 'あ'), ('i', 'い'), ('u', 'う'), ('e', 'え'), ('o', 'お')
]

def romaji_to_hiragana(s):
    s = s.lower()
    res = []
    i = 0
    while i < len(s):
        if i + 1 < len(s) and s[i] == s[i+1] and s[i] in 'kstgdbpjzc' and s[i:i+2] != 'nn':
            res.append('っ')
            i += 1
            continue
        matched = False
        for rom, hira in ROMAJI_HIRAGANA_MAP:
            if s.startswith(rom, i):
                res.append(hira)
                i += len(rom)
                matched = True
                break
        if not matched:
            res.append(s[i])
            i += 1
    return ''.join(res)

def clean_definition(text):
    text = re.sub(r'see\s+[^\;\,]+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'variant of\s+[^\;\,]+', '', text, flags=re.IGNORECASE)
    parts = [p.strip() for p in text.split(';') if p.strip()]
    return '; '.join(parts) if parts else text.strip()

def clean_sentence_en(meaning_str):
    parts = [p.strip() for p in meaning_str.split(';') if p.strip()]
    first = parts[0] if parts else meaning_str
    first = re.sub(r'\(.*?\)', '', first).strip()
    if not first:
        first = meaning_str
    return first

def fetch_data():
    zh_url = 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz'
    req = urllib.request.Request(zh_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        cedict_text = gzip.decompress(resp.read()).decode('utf-8')

    cedict_by_trad = {}
    for line in cedict_text.splitlines():
        if line.startswith('#') or not line.strip():
            continue
        m = re.match(r'^(\S+)\s+(\S+)\s+\[(.*?)\]\s+/(.*)/$', line)
        if m:
            trad, simp, py, mean_str = m.groups()
            meanings = [x.strip() for x in mean_str.split('/') if x.strip()]
            if trad not in cedict_by_trad:
                cedict_by_trad[trad] = []
            cedict_by_trad[trad].append({'simp': simp, 'pinyin': py, 'meanings': meanings})

    jp_url = 'https://raw.githubusercontent.com/sph-mn/nihongo/master/data/jouyou-kanji-only-words.csv'
    req = urllib.request.Request(jp_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        jp_lines = resp.read().decode('utf-8').splitlines()

    stopwords = {'a', 'an', 'the', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'or', 'and', 'be', 'is', 'are', 'esp', 'e.g.', 'etc', 'something', 'someone', 'one', 'ones', 'sth', 'sb', 'see', 'variant'}

    def tokenize(text):
        words = re.findall(r'[a-zA-Z]+', text.lower())
        return set(w for w in words if w not in stopwords)

    def jaccard_similarity(text1, text2):
        s1 = tokenize(text1)
        s2 = tokenize(text2)
        if not s1 or not s2:
            return 0.0
        return len(s1 & s2) / len(s1 | s2)

    raw_matched_dict = {}

    for line in jp_lines:
        m = re.match(r'^(\S+)\s+(\S+)\s+\"(.*)\"$', line)
        if not m:
            m = re.match(r'^(\S+)\s+(\S+)\s+(.*)$', line)
        if m:
            jp_w, jp_r, jp_m = m.groups()
            jp_m = jp_m.strip('\"')

            if jp_w in raw_matched_dict:
                continue

            if jp_w in cedict_by_trad:
                cedict_entry = cedict_by_trad[jp_w][0]
                simp = cedict_entry['simp']
                py_num = cedict_entry['pinyin']
                py_accent = pinyin_num_to_accent(py_num)

                zh_m_raw = '; '.join(cedict_entry['meanings'])
                zh_m = clean_definition(zh_m_raw)
                jp_m_clean = clean_definition(jp_m)

                if not zh_m or not jp_m_clean:
                    continue

                overlap = jaccard_similarity(jp_m_clean, zh_m)

                if overlap > 0.3:
                    rel = 'true'
                elif overlap == 0.0:
                    rel = 'false'
                else:
                    continue

                hiragana_reading = romaji_to_hiragana(jp_r)
                clean_ja_en = clean_sentence_en(jp_m_clean)
                clean_zh_en = clean_sentence_en(zh_m)

                raw_matched_dict[jp_w] = {
                    'jp_form': jp_w,
                    'zh_simplified': simp,
                    'zh_traditional': jp_w,
                    'jp_reading': [hiragana_reading],
                    'pinyin': [py_accent],
                    'relation': rel,
                    'reading_type': 'on',
                    'meaning_ja': jp_m_clean,
                    'meaning_zh': zh_m,
                    'category_ja': 'general',
                    'category_zh': 'general',
                    'sentence_ja': f'{jp_w}を書く。',
                    'sentence_ja_en': f'I write {clean_ja_en}.',
                    'sentence_zh': f'使用{simp}。',
                    'sentence_zh_en': f'Use {clean_zh_en}.',
                    'level': 3,
                    'note': None
                }

    raw_matched = list(raw_matched_dict.values())
    trues = [item for item in raw_matched if item['relation'] == 'true']
    falses = [item for item in raw_matched if item['relation'] == 'false']

    random.seed(42)
    selected_trues = random.sample(trues, min(250, len(trues)))
    selected_falses = random.sample(falses, min(250, len(falses)))

    dataset = selected_trues + selected_falses
    random.shuffle(dataset)

    all_meanings = list(set([w['meaning_ja'] for w in dataset] + [w['meaning_zh'] for w in dataset]))

    for word in dataset:
        candidates = [m for m in all_meanings if m != word['meaning_ja'] and m != word['meaning_zh']]
        word['distractors'] = random.sample(candidates, 3)

    with open('tandem/server/data/words.json', 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    print(f'Successfully generated {len(dataset)} clean, deduplicated words in tandem/server/data/words.json.')

if __name__ == '__main__':
    fetch_data()
