const {
  DocumentAnalysisClient,
  AzureKeyCredential,
} = require("@azure/ai-form-recognizer");
import { PrebuiltReadModel } from "../prebuilt/prebuilt-read";

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
    PrebuiltReadModel,
    readStream,
    {
      onProgress: ({ status }) => {
        console.log(`status: ${status}`);
      },
    }
  );
  const pages = await poller.pollUntilDone();
  res.send(pages);
});

export default app;
