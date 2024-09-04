import mongoose from 'mongoose';

const connectDb = async () => {

    console.log(process.env.CONNECTION_STRING);
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database connection established", connect.connection.host, connect.connection.name);
    } catch (error) {
        console.error("Error connecting to the database", error.message);
        // Handle the error or notify
    }
};

export default connectDb
