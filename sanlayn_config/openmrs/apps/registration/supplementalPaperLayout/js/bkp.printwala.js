
try {
    var todayDate = $("#todayDate").text()
    splitedAD = todayDate.split("/");

    // alert(splitedAD[2])
    adYear = parseInt(splitedAD[2])
    adMonth =parseInt(splitedAD[1])
    adDate = parseInt(splitedAD[0])

    convertedDate = calendarFunctions.getBsDateByAdDate(adYear, adMonth, adDate)
    bsDate = convertedDate.bsYear + "-" + convertedDate.bsMonth + "-" + convertedDate.bsDate
    // alert(bsDate)
    $("#todayDate").text(bsDate+" "+new Date().toLocaleTimeString())
    


    var dept = $("#deptId").text();
    var nhis= $("#nhisID").text();
    try{
      nhisID= nhis.split("(")[0].split(" ")[1]
      
      charge=0
      // alert(charge + dept+nhisID)
      if(nhisID === null || nhisID == '')
      {
        $("#nhisID").text("NHIS:");
      }
      else{
        if(dept=="OPD")
        {
          charge = 50;
        }
        if(dept=="Emergency")
        {
          charge = 100;
        }
        
      $("#chargeID").text(charge);
      }

    }
    catch (err) {
      $("#nhisID").text("NHIS:");
      // alert(err)
      console.log("invalid data")
  }
   
      /*var qr;
      //var identifierID = $('#identiferID').text();   //jquery bata DOM tanyo ani teha bata Text tanyo ani tyo identifierID assign garyo ani tyo value ma haldiyo
			//(function() {
        //            qr = new QRious({
          //          element: document.getElementById('qr-code'),
                    size: 70,
                    value: identifierID
                });
           })();
}*/

 var bar=$('#awbno').text();
      (function() {
 JsBarcode("#barc",bar, {
       format: "code39",
       textAlign: "center",
       textPosition: "bottom",
       lineColor: "#191717",
       width:1,
       height:39,
       displayValue: false,
     
 });
    })();
}    


catch (err) {
    // alert(err)
    console.log("invalid date")
}

 
