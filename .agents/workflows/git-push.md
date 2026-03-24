---
description: git push 전 빌드 검증 후 커밋 및 푸시
---

# Git Push 워크플로우

git push를 할 때는 반드시 아래 순서를 따른다.

## 1. 빌드 테스트

// turbo
```bash
source ~/.nvm/nvm.sh && nvm use 23 && npm run build
```

빌드가 성공하면 다음 단계로 진행한다.
빌드가 실패하면 에러를 수정하고 1단계부터 다시 시작한다.

## 2. 변경 사항 스테이징

```bash
git add <변경된 파일들>
```

## 3. 커밋 생성

```bash
git commit -m "<커밋 메시지>"
```

커밋 메시지는 conventional commits 형식을 따른다: `type(scope): description`

## 4. 푸시

```bash
git push
```
