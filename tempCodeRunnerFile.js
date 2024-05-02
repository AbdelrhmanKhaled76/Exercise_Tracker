app.post('/api/users/:_id/exercises',(req,res)=>{
    const {_id,description,duration} = req.body;
    var {date} = req.body;