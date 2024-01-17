import "./style/index.css";
import { title } from "./src/title";
import { list } from "./src/list";
import { printVersion } from "./src/app";

printVersion();

document.querySelector("#app").innerHTML = `
  <div id="title">Hello ${title}!</div>
  <div>${list}</div>
`;
