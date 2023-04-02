const {
  DocumentAnalysisClient,
  AzureKeyCredential,
} = require("@azure/ai-form-recognizer");

import { PrebuiltLayoutModel } from "../prebuilt/prebuilt-layout";
import express from "express";
import fs from "fs";

const app = express();
const endpoint = process.env.AZURE_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_RECOGNIZER_API_KEY;

if (!endpoint || !apiKey) {
  console.error("Missing required environment variables.");
  process.exit(1);
}
console.log(endpoint, apiKey);

const client = new DocumentAnalysisClient(
  endpoint,
  new AzureKeyCredential(apiKey)
);

app.get("/list-data", async (req: any, res: any) => {
  try {
    const path = "./inputs/2c4f34286c830955a5c43062b1c86d08.pdf";
    const readStream = fs.createReadStream(path);
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

    const tableNumber = req.query.tableNumber || 1;
    const outputJSON: Array<any> = [];
    const tableKeys = tables[tableNumber].cells.filter((e: any) => {
      return e.rowIndex == 0;
    });

    if (tables[tableNumber].rowCount) {
      for (
        let i = tables[tableNumber].columnCount;
        i < tables[tableNumber].cells.length;
        i += tables[tableNumber].columnCount
      ) {
        const rowObject = {};
        let columnCount = tables[tableNumber].columnCount;
        while (columnCount) {
          rowObject[
            tableKeys.find(
              (e: any) =>
                e.columnIndex ==
                tables[tableNumber].cells[i + columnCount - 1].columnIndex
            ).content
          ] = tables[tableNumber].cells[i + columnCount - 1].content;
          columnCount--;
        }
        outputJSON.push(rowObject);
      }
    }
    res.status(200).send(outputJSON);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/tables", async (req: any, res: any) => {
//   const readStream = fs.createReadStream(
//     "./inputs/2c4f34286c830955a5c43062b1c86d08.pdf"
//   );
//   const poller = await client.beginAnalyzeDocument(
//     PrebuiltLayoutModel,
//     readStream
//   );
//   const { tables, forms } = await poller.pollUntilDone();

//   forms.forEach((form: any) => {
//     form.tables?.forEach((table: any) => {
//       tables.push(table);
//     });
//   });

//   const outputJSON: Array<any> = [];

//   tables.forEach((table: any) => {
//     const tableKeys = table.cells.filter((cell: any) => {
//       return cell.rowIndex === 0;
//     });

//     const rows: Array<any> = [];

//     for (
//       let i = table.columnCount;
//       i < table.cells.length;
//       i += table.columnCount
//     ) {
//       const row = {};
//       let columnCount = table.columnCount;
//       while (columnCount) {
//         row[
//           tableKeys.find(
//             (cell: any) =>
//               cell.columnIndex === table.cells[i + columnCount - 1].columnIndex
//           ).content
//         ] = table.cells[i + columnCount - 1].content;
//         columnCount--;
//       }
//       rows.push(row);
//     }

//     outputJSON.push({ tableName: table.name, rows });
//   });

//   res.status(200).send(outputJSON);
// });

app.get("/tables", async (req: any, res: any) => {
  const readStream = fs.createReadStream(
    "./inputs/2c4f34286c830955a5c43062b1c86d08.pdf"
  );
  const poller = await client.beginAnalyzeDocument(
    PrebuiltLayoutModel,
    readStream
  );
  const { tables } = await poller.pollUntilDone();

  const outputJSON: Array<any> = [];

  tables.forEach((table: any) => {
    const tableKeys = table.cells.filter((cell) => {
      return cell.rowIndex === 0;
    });

    const rows: Array<any> = [];

    // Loop through all the cells in the table, even if they span multiple pages
    for (let i = 0; i < table.cells.length; i++) {
      const cell = table.cells[i];

      if (cell.rowIndex === 0) {
        // This is a header cell, so we don't need to add it to our output rows
        continue;
      }

      // Check if the current cell is in the same row as the previous cell
      if (cell.rowIndex === table.cells[i - 1].rowIndex) {
        // If it is, then add the current cell's value to the previous row object
        const lastRow: Array<any> = rows[rows.length - 1];
        const columnName = tableKeys.find(
          (cell: any) => cell.columnIndex === cell.columnIndex
        )?.content;
        lastRow[columnName] = (lastRow[columnName] ?? "") + cell.content;
      } else {
        // If it's a new row, then create a new row object and add it to our output rows
        const row = {};
        const columnName = tableKeys.find(
          (cell: any) => cell.columnIndex === cell.columnIndex
        )?.content;
        row[columnName] = cell.content;
        rows.push(row);
      }
    }

    outputJSON.push({ tableName: table.name, rows });
  });

  res.status(200).send(outputJSON);
});

export default app;
