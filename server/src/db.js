import mongoose from 'mongoose';

// اتصال مُخزَّن مؤقتاً: على Vercel تُعاد استعمال الدالة بين الطلبات، فلا نفتح اتصالاً جديداً في كل طلب.
let cached = globalThis.__mongooseConn;
if (!cached) cached = globalThis.__mongooseConn = { promise: null };

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not set (انسخ .env.example إلى .env)');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .then(() => { console.log('MongoDB connected'); return mongoose.connection; })
      .catch((err) => { cached.promise = null; throw err; });
  }
  return cached.promise;
}
