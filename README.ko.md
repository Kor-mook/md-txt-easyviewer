# MD/TXT EasyViewer

[English](README.md) | **한국어**

**MD/TXT EasyViewer**는 Markdown과 텍스트 파일을 빠르고 깔끔하게 볼 수 있는 Windows 뷰어입니다.

- **빠른 문서 열기** — 파일과 주변 폴더를 바로 탐색합니다.
- **수정 내용 자동 반영** — 외부 편집기에서 저장하면 열려 있는 문서가 갱신됩니다.
- **탭으로 문서 보기** — 여러 파일을 열고 간편하게 전환합니다.
- **언어 확장** — 직접 만든 JSON 언어 파일을 추가할 수 있습니다.

## 만든 이유

Markdown이나 텍스트 파일을 읽을 때 편집기 화면을 거치지 않고, 파일이 있는 폴더와 주변 문서를 바로 탐색할 수 있는 가벼운 뷰어가 필요했습니다. 문서를 열어 둔 상태에서도 외부 편집기의 저장 결과를 확인하는 것을 목표로 했습니다.

## 구현과 설계

- **화면과 파일 접근 분리:** C#의 로컬 HTTP 서버가 폴더·파일과 Windows 기능을 제공하고, Microsoft Edge 앱 창이 HTML/CSS/JavaScript 화면을 표시합니다. 서버는 루프백 주소와 실행마다 생성한 경로 토큰을 사용합니다.
- **문서와 폴더 탐색:** 문서 이동 기록과 폴더 이동 기록을 분리해, 마우스 앞뒤 버튼이 커서 위치에 따라 다르게 동작하도록 했습니다. 폴더를 이동해도 열린 문서와 탭은 유지합니다.
- **변경 반영:** 보이는 문서를 약 2초 간격으로 다시 확인하고, 내용이 달라지면 스크롤 위치를 유지하며 갱신합니다.
- **Windows 통합:** 설치 시 파일 연결 후보와 시작 메뉴에 등록하고, 감지된 외부 편집기를 선택할 수 있습니다. 기존 기본 앱은 강제로 변경하지 않습니다.
- **수식 표시:** 외부 수식 라이브러리 없이 LaTeX 문법의 일부를 MathML로 변환합니다. 지원하지 않는 수식은 원문으로 남깁니다.

배포를 준비하면서 앱을 MSIX로 패키징하고 Microsoft Store에 처음 제출해 보는 경험도 했습니다.

## 확인한 항목

Windows에서 뷰어와 설치 프로그램 빌드를 확인했습니다. Edge 화면에서 탭과 폴더 이동, 사이드바 상태 복원, 문서 변경 반영, 주요 수식과 Markdown 문자 표시를 점검했으며, 별도 테스트 위치에서 설치 파일 복사와 앱 등록을 확인했습니다. 아직 저장소에 포함된 자동 테스트나 CI는 없습니다.

## 설치

[**⬇ Windows 설치 파일 다운로드**](https://github.com/Kor-mook/md-txt-easyviewer/releases/latest/download/MD-TXT-EasyViewer-Setup.exe)

[**Microsoft Store에서 보기**](https://apps.microsoft.com/detail/9NH6VL2C69ZL) — 스토어 이용 가능 여부는 인증 및 게시 상태에 따라 달라집니다.

다운로드한 `MD-TXT-EasyViewer-Setup.exe`를 실행합니다. 설치 파일은 필요한 앱 파일을 포함하므로 설치 중 인터넷 연결이 필요하지 않습니다. 현재 사용자 계정에 설치하고 시작 메뉴와 Windows 기본 앱 선택 목록에 등록합니다. 기존 기본 앱은 변경하지 않습니다.

현재 빌드는 코드 서명이 없으며 Windows에서 보안 경고가 나타날 수 있습니다. Microsoft Edge와 Windows가 필요합니다.

## 언어 추가

영어가 기본이며 한국어가 포함되어 있습니다. GitHub 설치 파일로 설치한 경우 앱 코드를 수정하지 않고 언어를 추가할 수 있습니다. `src/viewer/locales/en.json`을 복사해 `name`과 `strings` 값을 번역하고, 설치된 앱의 `%LOCALAPPDATA%/Programs/MDTXEasyViewer/locales/` 폴더에 `fr.json`처럼 UTF-8 JSON 파일로 저장하세요. 설정에서 새 언어를 선택할 수 있습니다. 파일 이름은 영문자·숫자·하이픈·밑줄로 40자까지 사용할 수 있고, 빠진 문구는 영어로 표시됩니다. Windows 기본 창과 설치 메시지에는 선택한 언어가 적용되지 않을 수 있습니다. Microsoft Store 패키지에서 언어 파일을 추가하는 방법은 아직 검증하지 않았습니다.

## 빌드

Windows에서 .NET Framework 4.x C# 컴파일러가 필요합니다. 저장소 루트에서 다음 명령을 실행합니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

결과물은 `build/viewer/MarkdownViewer.exe`와 `build/MD-TXT-EasyViewer-Setup.exe`에 생성됩니다. `build/`는 Git에 포함되지 않습니다. 외부 패키지를 설치하거나 다운로드하지 않습니다.

## 구조

```text
src/viewer/       뷰어 소스와 언어 파일
src/installer/    단일 설치 프로그램과 설치 스크립트
assets/           앱 아이콘
scripts/          빌드 스크립트
사용법.txt         사용 안내
```

## 참고

이 앱은 로컬 파일을 읽기 전용으로 표시하며, 실행 중 로컬 주소의 HTTP 서버를 통해 Microsoft Edge 앱 창에 문서를 표시합니다. Windows 전체 검색은 Windows가 색인한 파일만 대상으로 합니다.

수식 렌더러는 모든 LaTeX 문법을 지원하지 않습니다. 지원하지 않는 명령은 원문으로 표시됩니다. 자세한 사용법은 [사용법.txt](사용법.txt)를 참고하세요.

## 앞으로 개선할 점

- 설정에서 `.md`와 `.txt`의 Windows 기본 앱 설정으로 바로 이동하는 기능 추가
- 제거 및 업데이트 과정 정리와 새로운 Windows 환경에서의 설치 검증
- 자동 테스트와 CI 추가
- Markdown·LaTeX 지원 범위 확장 및 오류 사례 보완
- 백그라운드 프로세스 종료 방식과 코드 서명 검토

## 라이선스

아직 라이선스를 지정하지 않았습니다. 다른 사용자가 사용하거나 재배포할 수 있는 조건을 정해야 합니다.
