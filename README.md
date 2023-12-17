# solvook-studio

solvook studio

## 설치

### Node.js

Node.js 버젼은 `nvm` 을 사용합니다.\
`.nvmrc` 파일에 버젼을 기록합니다.

- [설치 가이드](https://github.com/nvm-sh/nvm)

```
nvm use
```

### Yarn Berry

기존 `npm` 의 문제들을 개선한 `yarn berry` 를 패키지 매니저로 사용합니다.\
`yarn berry` 로 설치된 파일들은 repo 내 `.yarn` 디렉토리 아래 설치됩니다. **해당 내용들은 커밋에 포함되어야 합니다.**

- [node_modules로부터 우리를 구원해 줄 Yarn Berry](https://toss.tech/article/node-modules-and-yarn-berry)
- [설치 가이드](https://yarnpkg.com/getting-started/install)

```
corepack enable
yarn
```

### VSCode

`yarn berry` 를 사용함으로 zip 파일 형태로 패키지들이 설치되기 때문에 기존 `node_modules` 에서 패키지를 불러올 수 없습니다.\
VSCode Extension 을 설치하여 기존 형태와 동일하게 사용 가능하도록 합니다.\

- [ZipFS](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs)

```
yarn dlx @yarnpkg/sdks vscode
```

`cmd` + `shift` + `p` 후 TypeScript: Select TypeScript Version 에서 Use Workspace Version 선택
