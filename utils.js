const path = require("path");
const { execFileSync } = require("child_process");
const pkgUp = require("pkg-up");

const namespaceStrategies = {
  /**
   * Resolve strategy based on changing files closest package.json name.
   */
  "package.json": ({ gitRoot, projectRoot, projectPackage }) => {
    const namespaces = getStagedFiles()
      // resolve absolute paths to files
      .map(file => path.resolve(gitRoot, file))
      // ignore those files outside scope of namespaced main project
      .filter(file => file.indexOf(projectRoot) !== -1)
      // find closest package.json
      .map(file => pkgUp.sync({ cwd: path.dirname(file) }) || null)
      // resolve name of this namespace
      .map(packagePath => (packagePath && require(packagePath).name) || "@root")
      // ensure we rename root, no sense to use package name here
      .map(name => (name === projectPackage.name ? "@root" : name))
      // ensure we only have one repeating namespace
      .filter((name, i, names) => names.slice(i + 1).indexOf(name) === -1)
      // in case we only have root packages, no need for @root usage
      .filter((name, i, names) => names.length > 1 || name !== "@root")
      // sort package names for consistency
      .sort((a, b) => (a === b ? 0 : a < b ? -1 : 1));

    return namespaces.length ? namespaces.join(", ") : null;
  }
};

/**
 * Resolves the current namespace, based on CLI parameters or package config.
 */
function resolveNamespace(args) {
  // respect manually set namespace
  if (args[0] === "-s") return args[1];

  const gitRoot = getGitRootDir();
  const projectRoot = path.join(gitRoot, getRootPackageDir());
  const projectPackage = require(path.resolve(projectRoot, "./package.json"));
  // prettier-ignore
  const strategy = (projectPackage.semanticCommits && projectPackage.semanticCommits.namespace) || null;

  // early exit for no strategy set.
  if (!strategy) return null;

  // do not allow empty error.
  if (!namespaceStrategies[strategy]) {
    throw new Error(
      `Git Semantic Commit Aliases namespace strategy unknown: ${strategy}`
    );
  }

  return namespaceStrategies[strategy]({
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

module.exports = { resolveNamespace };
