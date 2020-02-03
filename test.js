const { readFileSync } = require("fs");
const { dirSync, setGracefulCleanup } = require("tmp");
const { exec } = require("shelljs");
// const package = require("./examples/package.json");

setGracefulCleanup();

const options = { cwd: __dirname, fatal: true, silent: true };
// const directPackageStr = JSON.stringify(directPackage, null, 2);

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
  it("should install git aliases", () => {
    install(simple);
    expect(result.code).toBe(0);

    // check config setup
    const config = readFileSync(`${simple}/.git/config`).toString();
    expect(config).toContain("[alias]");
    expect(config).toContain(
      "chore = !node_modules/git-aliases-semantic-commits/git-aliases/chore"
    );
  });

  it("should have git aliases available", () => {
    install(simple);

    result = exec("git add .; git chore 'initial'", {
      ...options,
      cwd: simple
    });
    expect(result.code).toBe(0);

    result = exec("git --no-pager log -1 --pretty=%B", {
      ...options,
      cwd: simple
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("chore: initial");
  });
});
