const mysql=require('mysql');
const express=require('express');
const router=express.Router();
const config=require('./config');
const fs= require('fs');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var path=require('path');
var con;
class addUser
{
    getUser()
    {
      //GET user login UI
      router.get("/",(req, res)=> {
     fs.createReadStream('./public/login.html').pipe(res);});
      //Getting the Javascript file
      router.get("/index.js",(req, res)=> {
      fs.createReadStream('./public/index.js').pipe(res);});
    }
    postUser()
    {
      router.post("/",(req,res)=>{
        if(!req.body)
        {
          console.log("------------------3 : " + req.body);
          console.log("-------------------4 : " + req.params.userid);

        }
          res.redirect('http://127.0.0.1:3000/');

      //  module.exports=tname;
      //  console.log("This Is Gloabal:" + tname);

      })

    }
    connectDB()
    {
      //Database connection
      con = mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      });

    }
    databaseCreation()
    {
      //database creation for storing user info,everry one have unique id
      con.connect(function(err){
          if(err) throw err;

          var databasecreate='create database UserLoginInfo' ;
          con.query(databasecreate,function(err,results){
          if(err) throw err;
          console.log("Database created for storing user info");
        });

        var storeUser='insert into UserTable Values('

        ')' ;
        con.query(storeUser,function(err,results){
        if(err) throw err;
        console.log("User stored");
      });

      });

    }

    databaseUsers()
    {
      //Database creation for each user using unique user id
      var user='create database ' + db ;
      con.query(user,function(err,results){
        if(err) throw err;
        console.log("Database created for the user who logged in");
      });
    }


}
module.exports=router;
var a=new addUser();
a.getUser();
a.connectDB();
a.postUser();
