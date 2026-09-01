import langNames from "../lang-names.json";
import chromeJson from "./chrome.json";
import consular from "./fields/consular.json";
import find from "./fields/find.json";
import kerung from "./fields/kerung.json";
import safe from "./fields/safe.json";
import trek from "./fields/trek.json";
import form from "./form.json";
import pages from "./pages.json";
import paper from "./paper.json";

const chrome = {
   ...chromeJson,
   langPicker: langNames,
};

const fields = {
   kerung,
   trek,
   find,
   consular,
   safe,
};

const catalog = {
   chrome,
   pages,
   form,
   paper,
   fields,
};

export default catalog;
