const { readFileSync, writeFileSync } = require("fs");
const { dirSync, setGracefulCleanup } = require("tmp");
const { exec } = require("shelljs");
// const package = require("./examples/package.json");

setGracefulCleanup();

const options = { cwd: __dirname, fatal: true, silent: true };
// const directPackageStr = JSON.stringify(directPackage, null, 2);

// let result;
let tmp;
let dir;

beforeEach(() => {
  result = undefined;
  tmp = dirSync();
  dir = `${tmp.name}/`;

  // just in case...
  exec(`rm -Rf ./example/node_modules`, options);

  exec(`cp -Rf ./example/ ${dir}`, options);
  exec(`cd ${dir}; git init`, options);
});

describe("yarn", () => {
  const install = () => {
    result = exec(
      `cd ${dir}; INIT_CWD=${dir} yarn add --dev ${__dirname}`,
      options
    );
  };

  it("should install git aliases", () => {
    install();
    expect(result.code).toBe(0);

    // check config setup
    const config = readFileSync(`${dir}/.git/config`).toString();
    expect(config).toContain("[alias]");
    expect(config).toContain(
      "chore = !node_modules/git-aliases-semantic-commits/git-aliases/chore"
    );
  });

  it("should have git aliases available", () => {
    install();

    result = exec("git add .; git chore 'initial'", { ...options, cwd: dir });
    expect(result.code).toBe(0);

    result = exec("git --no-pager log -1 --pretty=%B", {
      ...options,
      cwd: dir
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("chore: initial");
  });
});
