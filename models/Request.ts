import db from '../config/arango';

interface Filters {
  [key: string]: { operator: string, value: any } | string;
}

interface Sort {
  by: string[];
  method: string;
}

interface Select {
  [key: string]: number;
}

interface RequestData {
  _id?: string;
  _key?: string;
  [key: string]: any;
}

const collections = {
  User: "users",
  Token: "tokens"
};

export default class Request {
    _id?: string;
    _key?: string;
    [key: string]: any;

    constructor(data: RequestData) {
        this._id = data._id;
        this._key = data._key;
    }

    async save(): Promise<RequestData> {
        return new Promise((resolve, reject) => {
        const coll = collections[this.constructor.name];
        const collection = db.collection(coll);
        const data = this;
        const d = new Date();
        data.created_at = d.toISOString();
        data.updated_at = d.toISOString();
        const doc = data;
        collection.save(doc).then(meta => {
            resolve(Object.assign(data, meta));
        }).catch(err => {
            reject(err);
        });
        });
    }

    async get({ filters, removed, sort, limit, select }): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const collectionName = this.constructor.name;
                const collection = collections[collectionName];
                let query = `FOR i IN ${collection} FILTER `;
                if (filters && Object.keys(filters).length !== 0) {
                const filterKeys = Object.keys(filters);
                for (const f of filterKeys) {
                    let operator = typeof filters[f] === "object" ? filters[f].operator : "==";
                    let value = filters[f] = typeof filters[f] === "object" ? filters[f].value : filters[f];
                    if (f === "_key" || f === "_id" || (typeof filters[f] === "string" && operator !== "IN")) {
                    query += `i.${f} ${operator} "${value}"`;
                    } else {
                    query += `${value} ${operator} i.${f}`;
                    }
                    if (filterKeys.indexOf(f) < filterKeys.length - 1) {
                    query += ` && `;
                    }
                }
                query += ` && i.isremoved != true`;
                } else {
                query += `i.isremoved != true`;
                }
                if (sort) {
                query += ` SORT `;
                for (let s = 0; s < sort.by.length; s++) {
                    if (s === sort.by.length - 1) {
                    query += `i.${sort.by[s]} `;
                    } else {
                    query += `i.${sort.by[s]}, `;
                    }
                }
                query += `${sort.method}`;
                }
                if (limit) {
                query += ` LIMIT ${limit}`;
                }
                if (select) {
                query += ` RETURN ${select}`;
                } else {
                query += ` RETURN i`;
                }
                await db.query(query).then((cursor) => {
                    cursor.all().then((data) => {
                        resolve(data);
                    });
                });
            } catch (err) {
                reject(err);
            }
        });
    }
    async getOne({ filters, removed, select }: { filters: any, removed: boolean, select?: boolean}): Promise<any> {
        return new Promise(async (resolve, reject) => {
          const constructor = require(`../classes/${this.constructor.name}`);
          const req = new constructor({})
          req.get({filters: filters, removed: removed, select: select, collection: collections[this.constructor.name]}).then(data => {
            resolve(data[0])
          }).catch((e: any) => {
            reject(e)
          })
        })
    }
    async update(filters: any, data: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
          const coll = collections[this.constructor.name]
          const d = new Date()
          const data1 = JSON.stringify({...data, updated_at: d.toISOString()})
          try {
            let query = `FOR i IN ${coll} FILTER `
            const filterKeys = Object.keys(filters)
            for (const f of filterKeys) {
              let operator = typeof filters[f] == "object" ? filters[f].operator : "=="
              filters[f] = typeof filters[f] == "object" ? filters[f].value : filters[f]
              if (f == "_key" || f == "_id" || (typeof filters[f] == "string" && operator != "IN")) {
                query += `i.${f} ${operator} "${filters[f]}"`
              } else {
                query += `${filters[f]} ${operator} i.${f} `
              }
              if (filterKeys.indexOf(f) < filterKeys.length - 1) {
                query += ` && `
              }
            }
            query += filterKeys.length ? ` && i.isremoved != true` : ` i.isremoved != true`
            query += ` UPDATE i WITH ${data1} in ${coll} RETURN MERGE(i, ${data1})`
            await db.query(query).then((cursor) => {
              cursor.all()
                .then(vals => {
                  resolve(vals[0])
                }).catch(e => {
                  reject(e)
                })
            });
          } catch(e) {
            reject(e.message)
          }
        })
    }
    async query(query: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (query) {
                await db.query(query).then((cursor) => {
                cursor.all()
                    .then(vals => {
                    resolve(vals)
                    }).catch(e => {
                    reject(e)
                    })
                });
            } else {
                reject('Query is required')
            }
        });
    }
      
    async delete(id: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const coll = collections[this.constructor.name]
            const collection = db.collection(coll);
            const d = new Date
            const data = { isremoved: true, updated_at: d.toISOString() }
            await collection.update(id, data).then(meta => 
                    resolve(Object.assign(data, meta))
            ).catch(e => {
                    reject(e)
            })
        });
    }
}
