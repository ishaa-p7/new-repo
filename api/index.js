const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post =require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer=require('multer');
const path=require('path');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs=require('fs');
const uploadOnCloudinary = require('./cloudinary')

require('dotenv').config()

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET_KEY;

app.use(express.static(path.join(__dirname , 'dist')))

app.use(cors({ credentials: true, origin: 'http://localhost:5173/' }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URL);

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    }
    catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        //logged in
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json(
                {
                    id:userDoc._id,
                   username,

                }
            );
        });

        //res.json()
    }
    else {
        res.status(400).json('wrong credentials');
    }
})

app.get('/api/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, secret, {}, (err, info) => {
            if (err) throw err;
            res.json(info);
        });
    }
    else {
        res.status(400).json({ msg: "no token in cookie" })
    }
});

app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads')
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

app.post('/api/post',upload.single('file'),async (req,res)=>{
 //  const {originalname,path}=req.file;
  //const parts = originalname.split('.');
  //const ext=parts[parts.length-1];
  //const newPath=path+'.'+ext;
  //fs.renameSync(path,newPath);
  const { token } = req.cookies;
if(token){
  jwt.verify(token, secret, {},async (err, info) => {
    if (err) throw err;

    const filePath = path.join(__dirname , `uploads/${req.file.originalname}`)
    const response = await uploadOnCloudinary(filePath)

    const {title,summary,content}=req.body;
 const postDoc=await Post.create({
title,
summary,
content,
cover:response.url,
author:info.id,
  });
  res.json(postDoc);
});
}
else {
    res.status(400).json({ msg: "no token in cookie" })
}
});

app.put('/api/post',upload.single('file'), async (req,res) => {
   // let newPath = null;
    //if (req.file) {
     // const {originalname,path} = req.file;
      //const parts = originalname.split('.');
      //const ext = parts[parts.length - 1];
      //newPath = path+'.'+ext;
      //fs.renameSync(path, newPath);
    //}
    const {token} = req.cookies; 
  if(token){
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
     // await postDoc.update({
       // title,
        //summary,
        //content,
        //cover: newPath ? newPath : postDoc.cover,
      //});
      let newCover = postDoc.cover;
      if(req.file){
          const filePath = path.join(__dirname , `uploads/${req.file.originalname}`)
          const response = await uploadOnCloudinary(filePath)     
          newCover = response.url       
      }

      const updateFields = {
        title,
        summary,
        content,
        cover: newCover,
    };

    await Post.updateOne({ _id: id }, updateFields);
    res.json(postDoc)
    });
}
else {
    res.status(400).json({ msg: "no token in cookie" })
}
  });


app.get('/api/post',async (req,res)=>{
    res.json
    (await Post.find()
    .populate('author',['username'])
    .sort({createdAt:-1})
    .limit(20)
);
})

app.get('/api/post/:id',async(req,res)=>{
const {id}=req.params;
const postDoc=await Post.findById(id).populate('author',['username']);
res.json(postDoc);
})

app.use('*' , (req , res)=>{
    res.sendFile(path.join(__dirname , 'dist' , 'index.html'))//This is the preferred way
})


app.listen(4000);

//mongodb+srv://blog:blogapp7@cluster7.9isolbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7
//blogapp7 