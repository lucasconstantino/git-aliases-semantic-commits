const path = require("path");
const { execFileSync } = require("child_process");
const pkgUp = require("pkg-up");

const scopeStrategies = {
  /**
   * Resolve strategy based on changing files closest package.json name.
   */
  "package.json": ({ gitRoot, projectRoot, projectPackage }) => {
    const scopes = getStagedFiles()
      // resolve absolute paths to files
      .map(file => path.resolve(gitRoot, file))
      // ignore those files outside scope of scoped main project
      .filter(file => file.indexOf(projectRoot) !== -1)
      // find closest package.json
      .map(file => pkgUp.sync({ cwd: path.dirname(file) }) || null)
      // resolve name of this scope
      .map(packagePath => (packagePath && require(packagePath).name) || "@root")
      // ensure we rename root, no sense to use package name here
      .map(name => (name === projectPackage.name ? "@root" : name))
      // ensure we only have one repeating scope
      .filter((name, i, names) => names.slice(i + 1).indexOf(name) === -1)
      // in case we only have root packages, no need for @root usage
      .filter((name, i, names) => names.length > 1 || name !== "@root")
      // sort package names for consistency
      .sort((a, b) => (a === b ? 0 : a < b ? -1 : 1));

    return scopes.length ? scopes.join(", ") : null;
  }
};

/**
 * Resolves the current scope, based on CLI parameters or package config.
 */
function resolveScope(args) {
  // respect manually set scope
  if (args[0] === "-s") return args[1];

  const gitRoot = getGitRootDir();
  const projectRoot = path.join(gitRoot, getRootPackageDir());
  const projectPackage = require(path.resolve(projectRoot, "./package.json"));
  // prettier-ignore
  const strategy = (projectPackage.semanticCommits && projectPackage.semanticCommits.scope) || null;

  // early exit for no strategy set.
  if (!strategy) return null;

  // do not allow empty error.
  if (!scopeStrategies[strategy]) {
    throw new Error(
      `Git Semantic Commit Aliases scope strategy unknown: ${strategy}`
    );
  }

  return scopeStrategies[strategy]({
    gitRoot,
    projectRoot,
    projectPackage
  });
}

function getGitRootDir() {
  return (execFileSync("git", ["rev-parse", "--show-toplevel"]) + "").replace(
    /\r?\n|\r/g,
    ""
  );
}

function getRootPackageDir() {
  return (
    execFileSync("git", ["config", "git-shared-alias.root"]) + ""
  ).replace(/\r?\n|\r/g, "");
}

function getStagedFiles() {
  const result = (
    execFileSync("git", ["diff", "--name-only", "--staged"]) + ""
  ).split("\n");

  return result.filter(Boolean);
}

module.exports = { resolveScope };
