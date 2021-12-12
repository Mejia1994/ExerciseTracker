const mongoose = require("mongoose");
const {Schema, model} = mongoose;

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const usersSchema = new Schema({
    username: {type: String, required: true},
    exercises: [{description: {type: String}, duration: {type: Number}, date: {type: String, required: false}}]
}, {collection: 'users'})

const usersModel = model("users", usersSchema)

module.exports = usersModel;