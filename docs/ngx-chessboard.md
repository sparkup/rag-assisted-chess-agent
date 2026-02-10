## Using NGX Chessboard (Angular 17+) — **GitLab Version Required**

**Important: the version published on NPM does NOT work with Angular 17+.  
Only the GitLab version (branch `v3.0.0`) is compatible.**

The `ngx-chess-board` library must be built manually, because the official NPM package does not include the required bundles (FESM2022, ESM2022, Angular metadata, etc.).

---

### 1. Clone the correct version from GitLab

The GitLab repository maintains the version compatible with Angular 17:

```
git clone https://gitlab.com/grzegorz103/ngx-chess-board.git
cd ngx-chess-board
git checkout v3.0.0
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Build the library

Compile the NGX Chessboard library:

```
npm run ng build ngx-chess-board
```

The compiled files will be generated in:

```
dist/ngx-chess-board/
```

This directory must contain:

- `fesm2022/`
- `esm2022/`
- `bundles/`
- `public-api.d.ts`
- `index.d.ts`
- `package.json`
- Angular metadata files

---

### 4. Copy the compiled library into your Angular project

In your project:

```
mkdir -p frontend/libs/ngx-chess-board
cp -R dist/ngx-chess-board/* frontend/libs/ngx-chess-board/
```

> The `libs/` directory is a local workspace location that allows you to use the compiled library without relying on NPM.

---

### 5. Declare the library in `frontend/package.json`

Edit your `frontend/package.json`:

```
"dependencies": {
  ...
  "ngx-chess-board": "file:libs/ngx-chess-board"
}
```

Then reinstall dependencies:

```
npm install
```

---

### 6. Rebuild the frontend

```
npm run build
```

Your Angular application now correctly uses the GitLab-built version of `ngx-chess-board`, compatible with Angular 17+.

---

### Quick summary

| Step | Action                                              |
| ---- | --------------------------------------------------- |
| 1    | Clone the GitLab repository                         |
| 2    | `git checkout v3.0.0`                               |
| 3    | `npm install`                                       |
| 4    | `npm run ng build ngx-chess-board`                  |
| 5    | Copy to `frontend/libs/ngx-chess-board/`            |
| 6    | Add `"file:libs/ngx-chess-board"` to `package.json` |
| 7    | `npm install && npm run build`                      |

This procedure guarantees full compatibility with Angular 17+.
