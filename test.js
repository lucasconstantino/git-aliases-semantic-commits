const { readFileSync, writeFileSync } = require("fs");
const { dirSync, setGracefulCleanup } = require("tmp");
const { exec } = require("shelljs");

setGracefulCleanup();

const options = { cwd: __dirname, fatal: true, silent: true };

let result;
let tmp;
let dir;
let simple;
let monorepo;

beforeEach(() => {
  result = undefined;
  tmp = dirSync();
  dir = `${tmp.name}`;
  simple = `${dir}/simple`;
  monorepo = `${dir}/monorepo`;

  // just in case...
  exec(`rm -Rf ./examples/simple/node_modules`, options);
  exec(`rm -Rf ./examples/monorepo/node_modules`, options);
  exec("yarn cache clean git-aliases-semantic-commits");

  exec(`cp -Rf ./examples/simple/ ${simple}`, options);
  exec(`cp -Rf ./examples/monorepo/ ${monorepo}`, options);

  exec(`cd ${simple}; git init`, options);
  exec(`cd ${monorepo}; git init`, options);
});

const install = example => {
  result = exec(
    `cd ${example}; INIT_CWD=${example} yarn add --dev ${__dirname}`,
    options
  );
};

describe("simple", () => {
  beforeEach(() => install(simple));

  it("should install git aliases", () => {
    expect(result.code).toBe(0);

    // check config setup
    const config = readFileSync(`${simple}/.git/config`).toString();
    expect(config).toContain("[alias]");
    expect(config).toContain(
      "chore = !node_modules/git-aliases-semantic-commits/git-aliases/chore"
    );
  });

  it("should be possible to use 'chore' alias", () => {
    const execOptions = { ...options, cwd: simple };

    result = exec("git add .; git chore 'initial'", execOptions);
    expect(result.code).toBe(0);

    result = exec("git --no-pager log -1 --pretty=%B", execOptions);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("chore: initial");
  });

  it("should be possible to use 'feat' alias", () => {
    const execOptions = { ...options, cwd: simple };

    result = exec("git add .; git feat 'initial'", execOptions);
    expect(result.code).toBe(0);

    result = exec("git --no-pager log -1 --pretty=%B", execOptions);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("feat: initial");
  });

  it("should be possible to use namespacing", () => {
    const execOptions = { ...options, cwd: simple };

    result = exec("git add .; git chore -s namespace 'initial'", execOptions);
    expect(result.code).toBe(0);

    result = exec("git --no-pager log -1 --pretty=%B", execOptions);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("chore(namespace): initial");
  });
});
