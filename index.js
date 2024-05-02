const express = require('express');
const {ObjectId} = require('mongodb');
const app = express()

const logs = [];
const log = {};
const getUsers = [];

app.use(express.static('./public'));
app.use(express.urlencoded({extended:false}));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',(req,res)=>{
    const {username} = req.body;
    log["username"] = username;
    log["count"] = 0;
    log["log"] = [];
    log["_id"] = (new ObjectId()).toString();
    getUsers.push({"username" : log["username"], "_id" : log["_id"], "__v" : 0});
    logs.push({"username" : log["username"], "_id" : log["_id"],log : []});
    res.json({
        "username" : log["username"]
        , "_id" : log["_id"]
    });
});

app.get('/api/users',(req,res)=>{
    res.json(getUsers);
});

app.post('/api/users/:_id/exercises',(req,res)=>{
    const {_id,description,duration} = req.body;
    var {date} = req.body;
    if(!(log["_id"] === _id.toString()) || !description || isNaN(duration)){
        return res.status(500).send("Invalid ID or missing description/duration");
    }
    let exerciseDate = new Date();
    if (date) {
        exerciseDate = new Date(date);
        // Check if the provided date is valid
        if (isNaN(exerciseDate.getTime())) {
            return res.status(500).send("Invalid date");
        }
    }
        exerciseDate = exerciseDate.toDateString();

        log["log"].push({description : description, duration : Number(duration), date : exerciseDate});
        log["count"] = log["log"].length

        const logsIdx = logs.findIndex(log => log._id === _id);
        const arr = [{description : description, duration : Number(duration), date : exerciseDate}];
        logs[logsIdx]["log"].push(...arr);
        logs[logsIdx]["count"]=logs[logsIdx]["log"].length;

        const queryParams = {
            _id : log["_id"],
            username : log["username"],
            description : log["log"][0]["description"],
            duration: log["log"][0]["duration"],
            date : log["log"][0]["date"]
        };
        res.json(queryParams);
    });

app.get('/api/users/:_id/logs',(req,res)=>{
    const {_id} = req.params;
    const {limit,from,to} = req.query;

    const qlog = logs.filter(loger => loger["_id"] === _id);

    if(qlog){
        let filteredLogs = qlog[0]["log"];

        if (from && to) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log["date"]);
                return logDate >= new Date(from) && logDate <= new Date(to);
            });
        }

        if (limit) {
            filteredLogs = filteredLogs.slice(0, parseInt(limit));
        }


        res.json({
            username: qlog[0]["username"],
            _id: qlog[0]["_id"],
            count: filteredLogs.length,
            log: filteredLogs
        });
    }
    else{
        res.status(500).send("error Invalid Id or Query");
    }
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
});
