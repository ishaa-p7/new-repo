const express=require('express');
const cors=require('cors');
const mongoose=require("mongoose");
const User=require('./models/User');
const bcrypt=require('bcryptjs');
const app=express();
const  jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');

const salt=bcrypt.genSaltSync(10);
const secret='adfbijcnidjnvsjfnfonsdfmsivsfvn';

app.use(cors({credentials:true,origin:'http://localhost:5173/'}));
app.use(express.json());
app.use(cookieParser());


mongoose.connect('mongodb+srv://blog:blogapp7@cluster7.9isolbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7');

app.post('/api/register',async (req,res)=>{
    const {username,password}=req.body;
    try{
   const userDoc= await User.create({
    username,
    password:bcrypt.hashSync(password,salt),
});
    res.json(userDoc);
    }
    catch(e){
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/api/login',async (req,res)=>{
const {username,password}=req.body;
const userDoc= await User.findOne({username});
const passOk = bcrypt.compareSync(password,userDoc.password);
if(passOk){
    //logged in
jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
if(err) throw err;
res.cookie('token',token).json('ok');
});

//res.json()
}
else{
    res.status(400).json('wrong credentials');
}
})

app.get('/api/profile',(req,res)=>{
    const {token}=req.cookies;
jwt.verify(token,secret,{},(err,info)=>{
    if(err) throw err;
    res.json(info);
});
});

app.post('/api/logout',(req,res)=>{
    res.cookie('token','').json('ok');
})

app.listen(4000);

//mongodb+srv://blog:blogapp7@cluster7.9isolbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7
//blogapp7 