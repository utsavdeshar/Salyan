
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
    $("#todayDate").text(bsDate)
}
catch (err) {
    // alert(err)
    console.log("invalid date")
}