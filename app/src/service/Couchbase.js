import couchbase from 'couchbase';

const loadCollection = async () => {
  const cluster = await couchbase.connect('couchbase://signature-couchbase-db', {
    username: 'user',
    password: 'test1234',
  });
  // Select main bucket
  const bucket = cluster.bucket('main');
  // Retrieve default collection for this service
  return bucket.defaultCollection();
};

export default function CouchbaseService() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const attempt = async () => {
      attempts++;
      try {
        const collection = await loadCollection();
        resolve(collection);
      } catch (e) {
        console.error("Received Error loading couchbase client", e);
        if (attempts < 5) {
          console.log(`\n ===== Retrying Couchbase Client ====== \n =====        in 3 seconds       ====== \n`);
          setTimeout(attempt, 3000);
        } else {
          reject(e);
        }
      }
    }
    attempt();
  });
};
