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
    if(!username){
        res.status(400).send("Error : Username not found");
    }
    logs.push({"username" : username, "_id" : (new ObjectId()).toString() ,"count": 0 ,"log" : []});    
    const getUsers = logs.map(el=>{
        return { "username" : el["username"], "_id" : el["_id"]};
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
const { _id } = req.params;
const { description, duration } = req.body;
let { date } = req.body;
const user = logs.find(user => user._id === _id);
    if(!description || isNaN(duration) || !duration){
        return res.status(404).send("Invalid ID or missing description/duration");
    }
    if (!user) {
        return res.status(404).send("Error: User not found");
    }
    if (!date) {
        date = new Date().toDateString();
    } else {
        date = new Date(date).toDateString();
    }

        const filteredLogsIdx = logs.findIndex(el=>{
            return el["_id"] === _id.toString();
        });
        
        user.log.push({ description, duration: parseInt(duration), date });
        user.count++;

        res.json({
        _id: user._id,
        username: user.username,
        date,
        duration: parseInt(duration),
        description
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