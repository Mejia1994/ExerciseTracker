const express = require('express');
const router = express.Router();
const usersModel = require("./MongoDB");

router.get("/", async function (req, res) {
    let response = await usersModel.find();
    let users = response.map(user => ({_id: user._id, username: user.username}));

    res.json(users);
});

router.post("/", async function (req, res) {
    let {username} = req.body;
    let [{_id}] = await usersModel.insertMany({username, exercises: []});

    res.json({username, _id});
});

const exercisesMiddleWare = function (req, res, next) {
    let {description, duration, date} = req.body;

    if (!description || !duration) {
        res.status(500).send('Something broke!');
        return false;
    }

    if (!date || date === "") {
        req.body.date = new Date().toISOString().slice(0, 10);
    }

    next();
}

router.post("/:_id/exercises", exercisesMiddleWare, async function (req, res) {

    let {exercises, _id, username} = await usersModel.findOne({_id: req.params._id});
    let exercise = {
        description: req.body.description, duration: parseInt(req.body.duration), date: req.body.date
    }

    exercises.push(exercise);
    let response = await usersModel.updateOne({_id: req.params._id}, {exercises});

    if (!response.ok) {
        res.status(500).send('Something broke!');
        return false;
    }

    res.json({
        _id, username, ...exercise, "date": new Date(`${exercise.date} 00:00:00`).toDateString()
    });
});

router.get("/:id/logs", async function (req, res) {
    let {_id, username, exercises} = await usersModel.findOne({_id: req.params.id});

    res.json({
        _id, username, count: exercises.length, log: queryUserExercises(req.query, exercises)
    });
});

const queryUserExercises = function ({from, to, limit}, [...exercises]) {

    if (from) {
        exercises = exercises.filter(({date}) => new Date(date) >= new Date(from));
    }

    if (to) {
        exercises = exercises.filter(({date}) => new Date(date) <= new Date(to));
    }

    if (limit) {
        exercises = exercises.slice(0, limit);
    }

    return exercises.map(({duration, description, date}) => ({
        duration, description, "date": new Date(`${date} 00:00:00`).toDateString()
    }));
}

module.exports = router;