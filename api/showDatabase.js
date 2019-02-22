const express=require('express');
const mysql=require('mysql');
const router=express.Router();
const config=require('./config');
var con;
class Database{

        connectDb()
        {
          con = mysql.createConnection({
          host: config.host,
          user: config.user,
          password: config.password,
          });

        }
        postData()
        {
          router.post('/',(req,res)=>{
            con.connect(function(err) {
              if (err) throw err;
              console.log("Server Connected Mysql Database!");

              var sel='select * from events ' //+ tname;
              con.query(sel,function(err,results){
                if(err) throw err;
                else
                console.log("---------------5:Table Send to client");
                res.send(results);
              })
            });
          });
        }


}
module.exports=router;
var d=new Database();
d.connectDb();
d.postData();
