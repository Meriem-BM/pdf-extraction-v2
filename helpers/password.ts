import { FirebaseScrypt } from 'firebase-scrypt';

const firebaseParameter = {
  memCost: 14,
  rounds: 8,
  saltSeparator: 'Bw==',
  signerKey: 'ZBPjP19Xo02lGV6dzQKkb47/nREVwrXt6sLx+mnMlDwPXRy/QKlH867JSAX/E5jZok47J24Gkg+vv1CXu/qgAQ==',
};

const scrypt = new FirebaseScrypt(firebaseParameter);

interface PasswordResult {
  password: string;
  salt: string;
}

const passwordHelper = {
  salt: (): string => {
    const allCapsAlpha = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];
    const allUniqueChars = [...'~!@#$%^&*()_+-=[]\\{}|;:\',./<>?'];
    const allNumbers = [...'0123456789'];

    const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha, ...allUniqueChars];

    return Array(10)
      .fill(base)
      .map((x) => {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join('');
  },

  hash: (password: string): Promise<PasswordResult> => {
    return new Promise((resolve, reject) => {
      const salt = passwordHelper.salt();
      scrypt
        .hash(password, salt)
        .then((result) => {
          return resolve({ password: result, salt: salt });
        })
        .catch((e) => {
          return reject({
            status: 400,
            message: 'Problem while hashing',
          });
        });
    });
  },

  verify: (password: string, hash: string, salt: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      scrypt
        .verify(password, salt, hash)
        .then((isValid) => {
          return resolve(isValid);
        })
        .catch((e) => {
          return reject(e);
        });
    });
  },
};

export default passwordHelper;
