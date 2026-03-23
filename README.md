# readme-playground

GitHub 프로필을 꾸미기 위한 다양한 README 프로젝트 모음입니다.

각 프로젝트는 **GitHub Action**으로 동작하며, 토큰 없이도 사용할 수 있습니다.

---

## Projects

### Contribution Garden

GitHub 잔디를 레고 미니피규어가 가꾸는 정원으로 만들어주는 SVG 생성기

<p align="center">
  <img src="lego-contribution-garden/output/lego-garden.svg" alt="LEGO Contribution Garden" width="100%"/>
</p>

<p align="center">
  <a href="lego-contribution-garden/">사용법 보기</a>
</p>

### Streak Stats

GitHub 연속 활동(스트릭)을 깔끔한 카드로 보여주는 SVG 생성기

<p align="center">
  <img src="streak-stats/output/streak-stats-preview.svg" alt="Streak Stats — default" width="450"/>
  <br/>
  <img src="streak-stats/output/streak-stats-preview-dark.svg" alt="Streak Stats — dark" width="450"/>
</p>

<p align="center">
  <a href="streak-stats/">사용법 보기</a>
</p>

---

## Quick Start

각 프로젝트 폴더 안의 README에 워크플로우 예시가 있습니다.

```yaml
# .github/workflows/readme.yml
steps:
  - uses: actions/checkout@v4

  # 원하는 프로젝트 선택
  - uses: eottabom/readme-playground/lego-contribution-garden@v1.0.0
    with:
      github_username: ${{ github.repository_owner }}

  - uses: eottabom/readme-playground/streak-stats@v1.0.0
    with:
      github_username: ${{ github.repository_owner }}
```

## AI

> 이 프로젝트의 일부는 AI 도구의 도움을 받아 개발되었습니다.

## License

MIT
