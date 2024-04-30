const express = require('express');
const {ObjectId} = require('mongodb');
const app = express()

const logs = []
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
    res.json({
        "username" : log["username"]
        , "_id" : log["_id"]
    });
});

app.get('/api/users',(req,res)=>{
    console.log(log);
    res.json(getUsers);
});

app.post('/api/users/:_id/exercises',(req,res)=>{
    const {_id,description,duration} = req.body;
    var {date} = req.body;
    if((log["_id"] === _id.toString()) && description && !isNaN(duration)){
        if(!date){
            date = new Date();
        }else{
            date = new Date(date);
        }
        date = date.toDateString();
        log["log"].push({description : description, duration : Number(duration), date : date});
        log["count"] = log["log"].length
        res.json({
            username : log["username"]
            , description : log["log"][0]["description"]
            , duration: log["log"][0]["duration"]
            , date : log["log"][0]["date"],_id : log["_id"]
        });
    }
    else{
        res.status(404).send("Inavlid ID or missing description/duration");
    }
})

app.get('/api/users/:_id/logs',(req,res)=>{
    const {_id} = req.params;
    const {limit,from,to} = req.query;

    const qlog = logs.filter(log => log._id === _id);

    if(qlog){
        let filteredLogs = userLog.log;
        if (from && to) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= new Date(from) && logDate <= new Date(to);
            });
        }

        if (limit) {
            filteredLogs = filteredLogs.slice(0, parseInt(limit, 10));
        }
        const count = filteredLogs.length;

        res.json({
            username: userLog.username,
            _id: userLog._id,
            count: count,
            log: filteredLogs
        });
    }
    else{
        res.status(404).send("error Invalid Id or Query");
    }
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
});
