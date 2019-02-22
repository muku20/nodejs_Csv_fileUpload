const http=require("http");
const app=require('./app');
const hostname='127.0.0.1';
const port=3000;

class server
{
    createserver(){
      var server=http.createServer(app);
      server.listen(port);
      console.log(`Server running at http://${hostname}:${port}/`);
    }

}
var s=new server();
s.createserver();
