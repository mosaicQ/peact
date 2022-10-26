import { renderPDF } from "peact";

import Layout from "./components/Layout";
import Text from "./components/Text";

renderPDF(
  Layout({
    content: [
      Text({ text: "Welcome To Peact" }),
      Text({ text: "Hello World!" }),
    ],
  }),
  {
    path: "./out/output.pdf",
  }
);
