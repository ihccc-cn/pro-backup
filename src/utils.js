import fs from "fs";
import path from "path";
import yaml from "yaml";

export function travel(pathname, callback) {
  const files = fs.readdirSync(pathname);
  for (let i = 0; i < files.length; i++) {
    const subPathname = path.join(pathname, files[i]);
    const stats = fs.statSync(subPathname);
    const name = path.basename(subPathname);
    if (stats.isDirectory()) {
      const doNext = callback({
        name,
        isDirectory: true,
        pathname: subPathname,
        dirname: pathname,
      });
      if (doNext === false) continue;
      travel(subPathname, callback);
    } else {
      callback({
        name,
        isDirectory: false,
        pathname: subPathname,
        dirname: pathname,
      });
    }
  }
}

export function readBackupYaml(pathname) {
  const file = fs.readFileSync(pathname, "utf8");
  return yaml.parse(file);
}

export function parseYaml(data, env) {
  const files = [];
  Object.entries(data).forEach(([filename, mapping]) => {
    if (env in mapping) files.push([filename, mapping[env]]);
  });
  return files;
}

export function collectEnvFiles(pathname, rules) {
  const files = [];
  travel(pathname, (file) => {
    let matchEnv = null;
    for (let index = 0; index < rules.length; index++) {
      if (checkFilename(rules[index], file.name)) {
        matchEnv = rules[index];
        break;
      }
    }
    if (matchEnv) {
      files.push({
        main: delEnv(file.pathname, matchEnv[1]),
        target: file.pathname,
      });
    }
    return false;
  });
  return files;
}

export function checkFilename(array, name) {
  let count = 0;
  for (let index = 0; index < array.length; index++) {
    if (name.indexOf(array[index]) > -1) count++;
  }
  return array.length === count;
}

export function genEnvFile(env) {
  const envReg = new RegExp("(\\.|^)" + env + "(\\.|$)");

  return function (filename) {
    return envReg.test(filename);
  };
}

export function delEnv(filename, env) {
  return filename
    .split(".")
    .filter((n) => n !== env)
    .join(".");
}
