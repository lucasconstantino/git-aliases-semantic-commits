const { execFileSync } = require("child_process");
const { resolveNamespace } = require("./utils");
const [_node, _curr, type, ...args] = process.argv;

const namespace = resolveNamespace(args);
const messages = args.slice(args[0] === "-s" ? 2 : 0);
const params = ["commit", "-m"];

if (!messages.length && namespace) {
  // open edit mode with namespace
  params.push(`${type}(${namespace}): `, "-e");
} else if (!messages.length && !namespace) {
  // open edit mode without namespace
  params.push(`${type}: `, "-e");
} else if (namespace) {
  // commit with namespace
  params.push(`${type}(${namespace}): ${messages.join("\n\n")}`);
} else {
  // commit without namespace
  params.push(`${type}: ${messages.join("\n\n")}`);
}

execFileSync("git", params, { stdio: "inherit" });
