class CSVFile {


   sendReq(url)
   {
        var xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        document.getElementById("print").innerHTML = this.responseText;
        }};
        xhttp.open("POST", url, true);
        xhttp.send();
    }

    validateLogin()
    {
      var userid=document.getElementById("userid");
      var pass=document.getElementById("fi");
      document.write("----------1:" + userid);
      console.log("----------2" +pass);

    }
}
var c = new CSVFile();
c.validateLogin();
