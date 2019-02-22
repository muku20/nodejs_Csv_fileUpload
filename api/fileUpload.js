const express=require('express');
const router=express.Router();
const path=require('path');
const upload = require("express-fileupload");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
const fs= require('fs');
const csv=require('fast-csv');
const alert=require('alert-node');
var len;
const mysql=require('mysql');
const config=require('./config');
var con;var tname;

class Upload
{
    getFile()
    {
      //Getting the Html file
      router.get("/",(req, res)=> {
      fs.createReadStream('./public/index.html').pipe(res);});

      //Getting the Javascript file
      router.get("/index.js",(req, res)=> {
      fs.createReadStream('./public/index.js').pipe(res);});
    }
    postFile()
    {
      var _this= this;
      router.use(upload({
        useTempFiles : true,
        tempFileDir : '/tmp/',
      //  limits: { fileSize: 50 * 1024 * 1024 },
        createParentPath :true,
      //  abortOnLimit :true,
        parseNested : true
      }));
      router.post('/',(req,res)=>{
        if(req.files)
        {
        console.log("-------------1",req.files);
        var file = req.files.inputfile;//file object
        var filename = file.name;
        console.log("-------------2",filename);//file name
        file.mv("./Temp/" + filename, function (err) {
        if (err) {
        res.redirect('http://127.0.0.1:3000/file')
        } else {
          alert('File Uploaded Successfully to Server');
          res.redirect('http://127.0.0.1:3000/file');
        console.log("-----------------3:File Uploaded");}});

        _this.parseCsv(filename);
        }
      });
     }
     //-------------------------------------------------------Parsing CSV file in server....................................
     parseCsv(filename)
     {
       var _this=this;var datatype=new Array();var colname= new Array();var tempArray=new Array();
          csv.fromPath('./Temp/' + filename).on("data", function(data){
          len=data.length;

          for(var i=0;i<len;i++)
          {
              tempArray.push(data[i]);
          }
          })
            .on("end", function(){
              for(var i=0;i<len;i++)
              {
                colname.push(tempArray[i]);
              }
              for(var i=len;i<2*len;i++)
              {
                if(tempArray[i].charAt(2)=='/' || tempArray[i].charAt(1)=='/')
                {
                  datatype.push('date');
                }
                else if(isNaN(tempArray[i]))
                {
                  datatype.push('VARCHAR(100)');
                }
                else {
                  datatype.push('INT(100)');
                }
              }

              _this.createSchema(filename,colname,datatype,tempArray);

            });
    }
//----------------------------------------------------Creating Connection in mySQl Database..........................
      connectDb()
      {
        con = mysql.createConnection({
          host: config.host,
          user: config.user,
          password: config.password,
        });
      }
//---------------------------------------------------Creating Schema in mySQl Database......................
     createSchema(filename,colname,datatype,tempArray)
     {
       var _this=this;
       con.connect(function(err) {
        if (err) throw err;
        console.log("--------------4:Server Connected Mysql Database!");
       //Table  Name------------------------------------------------
       tname=filename.replace('.csv','');
       global.tname=tname;
       console.log("Table Name:" + tname);
       //creating tabel----------------------------------------------
       var crtable='CREATE TABLE IF NOT EXISTS '+ tname + '('
       if(colname.length>1){
       for(var i=0;i<colname.length-1;i++)
       {
         crtable +=colname[i]+'  '+datatype[i]+ ','
       }
       crtable +=colname[i]+'  '+datatype[i]+ ')';
        }
        else{
          crtable +=colname[i]+'  '+datatype[i]+ ')';
        }
        //Query for create Table ------------------------------
       con.query(crtable, function(err, results, fields,next) {
       if (err) {
       console.log(err.message);
       console.log("sql query error");
      }  else
      {
        console.log('-------------3:Table created ');
      }
    });
      //Query for inserting Data into created table Schema---------------------
      _this.insertData(tname,tempArray);
    });

     }
// Inserting Data into Mysql table-----------------------------------------------------------
     insertData(tname,tempArray)
     {
       var count=0;
       console.log(tempArray.length);
       //console.log(tempArray);
       var load='insert into '+ tname+ ' values' + '('
       for(var i=len;i<tempArray.length-1;i++)
       {
         if(count<len-1)
         {
           //----------------------------------------
           if(tempArray[i].charAt(2)=='/' || tempArray[i].charAt(1)=='/')
           {
             load+= tempArray[i]  + ','
           }
           else if(isNaN(tempArray[i]))
           {
             load+= "\'" + tempArray[i] + "\'" + ','
           }
           else if(tempArray[i]=='')
           {
             load+= 'NULL' + ',';
           }
           else {
             load+= tempArray[i]  + ','
           }
           //-------------------------------------------
           //load+= "\'" + tempArray[i] + "\'" + ','
           count++;
         }
         else if(count==len-1)
         {
           //----------------------------------------
           if(tempArray[i].charAt(2)=='/' || tempArray[i].charAt(1)=='/')
           {
             load+=  tempArray[i]  + '),(';
           }
           else if(isNaN(tempArray[i]))
           {
             load+= "\'" + tempArray[i] + "\'" + '),(';
           }
           else if(tempArray[i]=='')
           {
             load+= 'NULL' + '),(';
           }
           else {
             load+=tempArray[i] + '),(';
           }
           //-------------------------------------------

           //load+=tempArray[i] + '),(';
           count=0;
         }
       }
       //----------------------------------------
       if(tempArray[i].charAt(2)=='/' || tempArray[i].charAt(1)=='/')
       {
         load+=  tempArray[i]  + ')'
       }
       else if(isNaN(tempArray[i]))
       {
         load+= "\'" + tempArray[i] + "\'" + ')'
       }
       else if(tempArray[i]=='')
       {
         load+= 'NULL' + ')';
       }
       else {
         load+=tempArray[i] + ')';
       }
       //-------------------------------------------
       //load+=tempArray[i] + ')';

       con.query(load,function(err, results) {
       if (err) {
       console.log(err.message);
       }
       console.log('-----------------5:Csv Data inserted ');
     });

     }

//------------------------------------------------------------------------------------------------
}

var u=new Upload();
u.getFile();
u.postFile();
u.connectDb();
module.exports=router;
