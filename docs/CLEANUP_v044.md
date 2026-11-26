# v0.2.44 안정화 검수 기록 — 2026-11-27

기준: 6a409c01430994f171098feb8e52b7eae3452718

{
  "deadCssClasses": 59,
  "removedSelectors": 157,
  "removedRules": 154,
  "exactDuplicateRules": 1,
  "cssBefore": 63667,
  "cssAfter": 46297,
  "homeBefore": 39179,
  "homeAfter": 37285,
  "oldCacheAssets": 68,
  "newCacheAssets": 58,
  "allRuntimeAssetsExist": true,
  "saveLoadUnchanged": true,
  "rendererPreserved": true,
  "collectionProfileAndGestureUnchanged": true,
  "syntaxPassed": true
}

미사용 수납장/콜라주 관련 코드만 정리. 예전 사진 파일과 폐기된 실험 원본은 Git/Drive 보존, 실행 경로와 캐시에서 제외. 동일 선택자의 다른 속성은 CSS cascade 보존을 위해 유지. JS 문법, 실제 에셋 경로, 저장/로드 원문, 현재 렌더러 및 컬렉션 프로필/조작 코드 비교 통과. 별도 서비스워커 모의 테스트와 실제 휴대폰 회귀 검수 필요. 새 기능 및 밸런스 변경 없음.
