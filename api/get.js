const express=require('express');
const router=express.Router();

class GetContent
{
  getData()
  {
    router.get(('/'),(req,res)=>{
      res.json({
        message:"GET Method"
      });
      res.end("HEllo");
    });
  }
  postData()
  {
    router.post('/',(req,res)=>{
      res.send("POST Method Successfully");
    });
  }

}
module.exports=router;
var g=new GetContent();
g.getData();
g.postData();
