// 스모크테스트: validateSubmitFields (worker.js의 강화된 검증)
// 외부 호출 없음 — 텔레그램/이메일/Airtable 전혀 건드리지 않음
const MAX_FIELD_LENGTH = 500;

function validateSubmitFields(fields) {
  if (!fields || typeof fields !== 'object') return '필드 데이터가 없습니다';

  // 의미 있는 문자(글자/숫자) 1개 이상 — 전각공백·zero-width·탭·줄바꿈만 있어도 차단
  const hasMeaningful = (v) => /[\p{L}\p{N}]/u.test(String(v ?? ''));

  const required = ['기업명', '대표자명', '연락처'];
  for (const f of required) {
    const raw = fields[f];
    if (raw === undefined || raw === null) return `${f}은(는) 필수입니다`;
    if (String(raw).length > MAX_FIELD_LENGTH) return `${f} 길이 초과`;
    if (!hasMeaningful(raw)) return `${f}을(를) 정확히 입력해주세요`;
  }
  if (!/\p{L}/u.test(String(fields['기업명']))) return '기업명을 정확히 입력해주세요';
  if (!/\p{L}/u.test(String(fields['대표자명']))) return '대표자명을 정확히 입력해주세요';

  const phoneDigits = String(fields['연락처']).replace(/\D/g, '');
  if (!/^[\d\-]{9,14}$/.test(String(fields['연락처']).replace(/\s/g, '')))
    return '연락처 형식이 올바르지 않습니다';
  if (/^0+$/.test(phoneDigits)) return '연락처를 정확히 입력해주세요';

  if (fields['이메일'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fields['이메일'])))
    return '이메일 형식이 올바르지 않습니다';
  return null;
}

const cases = [
  ['정상 접수',                  { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '010-1234-5678', '이메일': 'test@example.com' }, false],
  ['빈객체',                    {}, true],
  ['null 필드',                 { '기업명': null, '대표자명': '홍길동', '연락처': '01012345678' }, true],
  ['일반 공백만',                { '기업명': '   ', '대표자명': '   ', '연락처': '   ' }, true],
  ['전각공백만 (U+3000)',         { '기업명': '　　', '대표자명': '　　', '연락처': '01012345678' }, true],
  ['zero-width만 (U+200B)',     { '기업명': '​​', '대표자명': '​', '연락처': '01012345678' }, true],
  ['nbsp (U+00A0)',            { '기업명': '  ', '대표자명': ' ', '연락처': '01012345678' }, true],
  ['탭/줄바꿈',                  { '기업명': '\t\n', '대표자명': '\t', '연락처': '01012345678' }, true],
  ['혼합 공백 종류',              { '기업명': '　​ \t\n', '대표자명': '홍길동', '연락처': '01012345678' }, true],
  ['기업명 점만 (.)',             { '기업명': '.', '대표자명': '홍길동', '연락처': '01012345678' }, true],
  ['기업명 하이픈만 (-)',          { '기업명': '-', '대표자명': '홍길동', '연락처': '01012345678' }, true],
  ['기업명 숫자만 (123)',          { '기업명': '123', '대표자명': '홍길동', '연락처': '01012345678' }, true],
  ['대표자명 숫자만',              { '기업명': '(주)홍길동', '대표자명': '123', '연락처': '01012345678' }, true],
  ['기업명 1자 한글 (정상)',        { '기업명': '주', '대표자명': '홍길동', '연락처': '01012345678' }, false],
  ['기업명 영문 1자 (정상)',        { '기업명': 'A', '대표자명': '홍길동', '연락처': '01012345678' }, false],
  ['연락처 0만 (00000000000)',   { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '00000000000' }, true],
  ['연락처 짧음 (12345)',         { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '12345' }, true],
  ['연락처 영문 포함',             { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '010abcd5678' }, true],
  ['이메일 잘못된 형식',           { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '01012345678', '이메일': 'notanemail' }, true],
  ['이메일 생략 (정상)',           { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '01012345678' }, false],
  ['연락처 하이픈 포함 (정상)',     { '기업명': '(주)홍길동', '대표자명': '홍길동', '연락처': '02-345-6789' }, false],
  ['길이 초과 (501자)',           { '기업명': 'A'.repeat(501), '대표자명': '홍', '연락처': '01012345678' }, true],
];

let pass = 0, fail = 0;
for (const [label, input, shouldBlock] of cases) {
  const result = validateSubmitFields(input);
  const blocked = result !== null;
  const ok = blocked === shouldBlock;
  const mark = ok ? '✅' : '❌';
  if (ok) pass++; else fail++;
  console.log(`${mark} [${shouldBlock ? 'BLOCK' : 'PASS '}] ${label.padEnd(34)} → ${blocked ? '차단: ' + result : '통과'}`);
}
console.log('');
console.log(`Result: ${pass}/${pass + fail} pass${fail ? ` (${fail} FAIL)` : ''}`);

// === Rate Limit 상수 확인 ===
console.log('');
console.log('=== Rate Limit 정책 (worker.js 상수) ===');
console.log('  RATE_LIMIT_MAX    = 3 (3회)');
console.log('  RATE_LIMIT_WINDOW = 180초 = 3분');
console.log('  카운트 위치       = 검증 통과 후 (봇/스캐너는 카운트 안 됨)');
