import { Database } from "arangojs";

const db = new Database({
    url: process.env.DB_LINK!,
    databaseName: process.env.DB_NAME!,
    auth: {
        username: process.env.DB_USER!,
        password: process.env.DB_PWD!,
    },
});

export default db;
