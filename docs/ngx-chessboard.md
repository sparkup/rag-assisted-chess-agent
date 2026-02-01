## Utilisation de NGX Chessboard (Angular 17+) — **Version GitLab obligatoire**

**Important : la version publiée sur NPM ne fonctionne pas avec Angular 17+.  
Seule la version GitLab (branch `v3.0.0`) est compatible.**

La librairie `ngx-chess-board` doit impérativement être compilée manuellement, car le package NPM officiel ne contient pas les bundles nécessaires (FESM2022, ESM2022, metadata, etc.).

---

### 1. Récupérer la version correcte depuis GitLab

Le dépôt GitLab maintient la version compatible avec Angular 17 :

```
git clone https://gitlab.com/grzegorz103/ngx-chess-board.git
cd ngx-chess-board
git checkout v3.0.0
```

---

### 2. Installer les dépendances

```
npm install
```

---

### 3. Compiler la librairie

Compilez la librairie NGX Chessboard :

```
npm run ng build ngx-chess-board
```

Les fichiers compilés apparaîtront dans :

```
dist/ngx-chess-board/
```

Ce dossier doit contenir :

- `fesm2022/`
- `esm2022/`
- `bundles/`
- `public-api.d.ts`
- `index.d.ts`
- `package.json`
- fichiers metadata Angular

---

### 4. Copier la librairie compilée dans votre projet Angular

Dans votre projet :

```
mkdir -p frontend/libs/ngx-chess-board
cp -R dist/ngx-chess-board/* frontend/libs/ngx-chess-board/
```

> Le dossier `libs/` est un emplacement local permettant d’utiliser la librairie compilée sans dépendre de NPM.

---

### 5. Déclarer la librairie dans `frontend/package.json`

Modifiez votre `frontend/package.json` :

```
"dependencies": {
  ...
  "ngx-chess-board": "file:libs/ngx-chess-board"
}
```

Puis réinstallez :

```
npm install
```

---

### 6. Recompiler le frontend

```
npm run build
```

L’application Angular utilise maintenant correctement la version GitLab compilée de `ngx-chess-board` compatible Angular 17.

---

### Résumé rapide

| Étape | Action                                                    |
| ----- | --------------------------------------------------------- |
| 1     | Cloner le repo GitLab                                     |
| 2     | `git checkout v3.0.0`                                     |
| 3     | `npm install`                                             |
| 4     | `npm run ng build ngx-chess-board`                        |
| 5     | Copier dans `frontend/libs/ngx-chess-board/`              |
| 6     | Ajouter `"file:libs/ngx-chess-board"` dans `package.json` |
| 7     | `npm install && npm run build`                            |

Cette procédure garantit une compatibilité complète avec Angular 17+.

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
