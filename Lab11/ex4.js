function isNonNegInt(val, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(val) != val) errors.push('Not a number!');
    // Check if string is a number value
    if (val < 0) errors.push('Negative value!');
    if (parseInt(val) != val) errors.push('Not an integer!');
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
  }
//parts array for errors
var age = 30;
var name = "Britnie";
attributes = name + ";" + (age + 0.5) + ";" + (0.5 - age);
parts = attributes.split(';');

//for (i in parts) {
    //console.log(`${parts[i]} is non neg int ${isNonNegInt(parts[i], true).join("**")}` );

function callback(part,i){
    console.log(`${parts[i]} is non neg int ${isNonNegInt(parts, true).join("***")}` );
}
parts.forEach(function (item,i) (console.log( (typeof item == 'string' && item.length > 0)?true:false ));
    

  