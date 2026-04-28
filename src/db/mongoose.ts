import {connect} from 'mongoose';

const databaseURL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/hospital';

try {
  await connect(databaseURL)
  console.log('Connection to MongoDB server established');
} catch (error) {
  console.log('Unnable to connect to MongoDB server');
}

