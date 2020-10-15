day = 8;
month = "Aug";
year = 2013;

step1 = year % 100;
step2 = parseInt(step1/4);
step3 = step2 + 13;
if (month == "Jan") {
    step5 = step3 + day;
} else {
    switch(month) {
        case "Jan":
            step4 = 1; break;
            case "Feb":
                step4 = 3; break;
                case "Mar":
                    step4 = 3; break;
                case "Apr":
                    step4 = 6; break;
                    case "May":
                        step4 = 1; break;
                        case "Jun":
                            step4 = 4; break;
                            case "Jul":
                                step4 = 6; break;
                            case "Aug":
                                step4 = 2; break;
                                case "Sept":
                                    step4 = 5; break;
                                    case "Oct":
                                        step4 = 0; break;
                                        case "Nov":
                                            step4 = 3; break;
                                        case "Dec":
                                            step4 = 5; break;
    }
    step6 = step4 +step3;
    step7 = step6 +3;
}
step8 = (typeof step5 != 'undefined') ? step5 : step7;

//Leap Year Check
isLeapYear = ((year % 4 ==0) && (year % 100 != 0) && (year % 400 == 0)); 

if (parseInt(year / 100) == 19) {
    //1900s
    if (isLeapYear) {
        if (month == "Jan" || month == "Feb") {
            step9 = step8 - 1;
        }
    }
}
else {
 //2000s
 if (isLeapYear) {
    if(month == "Jan" || month == "Feb") {
        step9 = step8 - 2;
    } else {
        step9 = step8 - 1;
    }
} else {
    step9 = step8 - 1;
}
}
step10 = step9 % 7;
if(step10 == 0) {
    DOW = "Sunday";
}
if(step10 == 1) {
    DOW = "Monday";
}
if(step10 == 2) {
    DOW = "Tuesday";
}
if(step10 == 3) {
    DOW = "Wednesday";
}
if(step10 == 4) {
    DOW = "Thursday";
}
if(step10 == 5) {
    DOW = "Friday";
}
if(step10 == 6) {
    DOW = "Saturday";
}


console.log(DOW);