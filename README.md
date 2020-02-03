# Git Semantic Commit Aliases

:warning: not well tested, but should cause no big issue :)

> Git semantic commit local aliases installer, based on [semantic commit messages](https://seesparkbox.com/foundry/semantic_commit_messages) article.

## Install

```sh
npm install git-aliases-semantic-commits --save-dev
```

Use the new aliases:

```sh
git chore 'message'       # same as `git commit -m 'chore: message'`
git cleanup 'message'     # same as `git commit -m 'cleanup: message'`
git docs 'message'        # same as `git commit -m 'docs: message'`
git feat 'message'        # same as `git commit -m 'feat: message'`
git fix 'message'         # same as `git commit -m 'fix: message'`
git localize 'message'    # same as `git commit -m 'localize: message'`
git refactor 'message'    # same as `git commit -m 'refactor: message'`
git style 'message'       # same as `git commit -m 'style: message'`
git test 'message'        # same as `git commit -m 'test: message'`
```

## Scopes

In many projects or repositories you might find some varying scopes for work being done - i.e. backend, frontend, etc. Scope your message using the `-s` parameter:

```sh
git chore -s backend 'message' # same as `git commit -m 'chore(backend): message'`
```

### Automatic scopes

This package also allows for an opt-in automatic scope system, specially useful for monorepo projects (Lerna :heart:). To configure it, you need to add `semanticCommits.scope` strategy to your root `package.json`, i.e.:

```json
{
  "name": "root",
  "version": "1.0.0",
  "semanticCommits": {
    "scope": "package.json"
  }
}
```

There are currently no other strategies available, but "package.json" one. This strategy will look upwards from committing file paths to find related `package.json` files and use their `name` field as scope.

```
├── package.json
└── packages
    ├── first
    │   └── package.json
    └── second
        └── package.json
```

Now, whenever you use the semantic commit aliases this package provides for committing files in this repository, a few patterns will be found:

- `chore: message`: when only files outside packages were changed;
- `chore(first): message`: when only files inside _first_ were changed:
- `chore(first, second): message`: when files in both _first_ and _second_ packages were changed;
- `chore(@root, first): message`: when files in root and inside _first_ packages were changed.

P.s.: you can still override the scope used by setting the `-s` parameter.

## See also

- [git-shared-aliases](https://github.com/lucasconstantino/git-shared-aliases) - Git aliases made available across your team
- [husky](https://github.com/typicode/husky) - Git hooks made easy 🐶 woof!

## License

MIT
