# 와구와구 Work 원본 애니메이션 복원 요청 (2026-11-25)

현재 Work 제작 폴더의 `index.html`은 GitHub tree 기준 **85바이트**이며 정상 HTML 소스가 아닙니다(원래 Work 검수실로 재생 불가). `README.md`, `design.png`, `parts/*.png`, `review.png`, `mobile.png`는 남아 있습니다. 사용자가 Work 검수실에서 본 애벌레 원본의 실제 `head()` / `bodySegment()` / 렌더 루프가 필요합니다.

## Work에 요청할 일

1. 본인이 작업한 **동작하던 검수실 원본 HTML과 분리된 자바스크립트 전체**, 프로젝트의 기타 텍스처·리소스 파일을 다시 확보하십시오. GitHub `character-production/larva-stage-1/index.html`이 현재 정상 HTML이 아닌 이유를 확인하고, 완전한 파일로 복구하십시오. 임의 재그리기 금지.
2. 복구한 파일은 독립 검수 주소에서 직접 실행하여 **원래 Work 테스트와 똑같이** 생긴 얼굴·몸통·무늬·다리·기어가기·먹기·소화·방귀가 재현되는지 확인하십시오.
3. 검수 소스 안의 실제 `bodySegment`·`head`와 씬 렌더러를 재사용 가능한 모듈(예: `work-larva-renderer.js`)로 추출하고, 게임에서는 player world position, turnAngle, bodyLine/bodyAnchor, fullness/biteMax, digest, gutBoluses, walkCycle 데이터를 주입하도록 설계하십시오.
4. 기존 게임 원본 sprite/body 렌더러와 Work 렌더러가 중복 출력되지 않게, 두 렌더러를 함께 교체하십시오. 반드시 **기본 몸통이 먼저 온전히 보임 → 첫 입에 원형 보존 → 꼬리 앵커 고정 → 기존 8마디 사이가 부드럽게 늘어남**을 확인하십시오. 새 마디가 추가되는 현재 Work 알고리즘과 사용자 기대가 다르므로 그 부분은 별도 개선 승인 전까지 원본과 차이점을 알려주십시오.
5. 정식 게임/저장/코인/컬렉션/충돌 규칙은 변경하지 마십시오. 독립 검수에서 먼저 실제 눈으로 확인한 다음 ?larva=1 시험 모드에 통합하고 사용자 승인 시에만 정식 전환하십시오.

### 주의
이전에 ChatGPT가 만든 `larva-work-preview.js`의 `wormBody()`는 Work의 `bodySegment()`가 아닌 **별도 임의 그림**입니다. 원본과 달라 사용자 불합격. 해당 시험 스크립트의 자동 로드는 제거했으며, 본편의 기존 애벌레는 유지했습니다. 다시 그 코드를 원본이라고 표시하지 마십시오.
