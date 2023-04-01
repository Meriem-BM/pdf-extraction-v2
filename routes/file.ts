const {
  DocumentAnalysisClient,
  AzureKeyCredential,
} = require("@azure/ai-form-recognizer");
import { PrebuiltLayoutModel } from "../prebuilt/prebuilt-layout";

import express from "express";
const app = express();

const fs = require("fs");

const endpoint = "https://meriamdev.cognitiveservices.azure.com/";
const apiKey = "e5ae59449db04d149d75af6d48e4247c";
const path = "./inputs/2c4f34286c830955a5c43062b1c86d08.pdf";

const client = new DocumentAnalysisClient(
  endpoint,
  new AzureKeyCredential(apiKey)
);

const readStream = fs.createReadStream(path);

app.get("/list-data", async (req: any, res: any) => {
  const poller = await client.beginAnalyzeDocument(
    PrebuiltLayoutModel,
    readStream,
    {
      onProgress: ({ status }) => {
        console.log(`status: ${status}`);
      },
    }
  );
  const { tables } = await poller.pollUntilDone();

  const TABLE_NUMBER = 1;
  const outputJSON: Array<any> = [];
  const tableKeys = tables[TABLE_NUMBER].cells.filter((e: any) => {
    return e.rowIndex == 0;
  });

  if (tables[TABLE_NUMBER].rowCount) {
    for (
      let i = tables[TABLE_NUMBER].columnCount;
      i < tables[1].cells.length;
      i += tables[TABLE_NUMBER].columnCount
    ) {
      const obj = {};
      let columnCount = tables[TABLE_NUMBER].columnCount;
      while (columnCount) {
        obj[
          tableKeys.find(
            (e: any) =>
              e.columnIndex ==
              tables[TABLE_NUMBER].cells[i + columnCount - 1].columnIndex
          ).content
        ] = tables[TABLE_NUMBER].cells[i + columnCount - 1].content;
        columnCount--;
      }
      outputJSON.push(obj);
    }
  }
  res.status(200).send(outputJSON);
});

export default app;
