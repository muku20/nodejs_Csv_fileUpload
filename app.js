const express=require('express');
const morgan=require('morgan');
const app=express();

const addUser=require('./api/addUser');
const fileUploadRoute=require('./api/fileUpload');
const databaseRoute=require('./api/showDatabase');
const get=require('./api/get');

class appp{

    apihandle()
    {
      app.use(morgan('dev'));

      //Handle Requests by Clients
      app.use('/',addUser);
      app.use('/file',fileUploadRoute);
      app.use('/show',databaseRoute);
      app.use('/get',get);

    }
}
module.exports=app;
var a=new appp();
a.apihandle();
