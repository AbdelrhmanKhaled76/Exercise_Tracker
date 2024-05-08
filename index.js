const express = require('express');
const {ObjectId} = require('mongodb');
const app = express()

const logs = [];

app.use(express.static('./public'));
app.use(express.urlencoded({extended:false}));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',(req,res)=>{
    const {username} = req.body;
    logs.push({"username" : username, "_id" : (new ObjectId()).toString() ,"count": 0 ,"log" : []});    
    const getUsers = logs.map(el=>{
        return {"_id" : el["_id"], "username" : el["username"]};
    });
    const thisUser = getUsers.filter(el=>{
        return el["username"] === username;
    });
    res.json(
        thisUser[0]
    );
});

app.get('/api/users',(req,res)=>{
    const getUsers = logs.map(el=>{
        return {"_id" : el["_id"], "username" : el["username"]};
    });
    res.json(getUsers);
});

app.post('/api/users/:_id/exercises',(req,res)=>{
    const {_id,description,duration} = req.body;
    let {date} = req.body;
    const filteredUser = logs.filter(el=>{
        return el["_id"] === _id.toString();
    });
    if(!description || isNaN(duration) || !duration){
        return res.status(500).send("Invalid ID or missing description/duration");
    }
    if(!Boolean(filteredUser[0])){
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

        const filteredLogsIdx = logs.findIndex(el=>{
            return el["_id"] === _id.toString();
        });
        console.log(filteredLogsIdx);
        
        logs[filteredLogsIdx]["log"].push({"date" : exerciseDate, "duration" : duration, "description" : description});
        logs[filteredLogsIdx]["count"] = logs[filteredLogsIdx]["log"].length;

        res.json({
            _id : logs[filteredLogsIdx]["_id"],
            username : logs[filteredLogsIdx]["username"],
            date : exerciseDate,
            duration: duration,
            description : description
        });
    });

app.get('/api/users/:_id/logs',(req,res)=>{
    const {_id} = req.params;
    const {limit,from,to} = req.query;

    const qlog = logs.filter(loger => loger["_id"] === _id.toString());

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