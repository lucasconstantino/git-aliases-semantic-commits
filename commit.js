const { execFileSync } = require("child_process");
const { resolveScope } = require("./utils");
const [_node, _curr, type, ...args] = process.argv;

const scope = resolveScope(args);
const messages = args.slice(args[0] === "-s" ? 2 : 0);
const params = ["commit", "-m"];

if (!messages.length && scope) {
  // open edit mode with scope
  params.push(`${type}(${scope}): `, "-e");
} else if (!messages.length && !scope) {
  // open edit mode without scope
  params.push(`${type}: `, "-e");
} else if (scope) {
  // commit with scope
  params.push(`${type}(${scope}): ${messages.join("\n\n")}`);
} else {
  // commit without scope
  params.push(`${type}: ${messages.join("\n\n")}`);
}

execFileSync("git", params, { stdio: "inherit" });
