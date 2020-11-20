//Server for POSTING products info & pet selection page info and rendering invoive page and pet selection page
//Based on server in Assignment1 examples, Lab 12/13

var express = require('express');
var app = express();
myParser = require("body-parser");
var fs = require('fs');
//loads json data onto products variable for use in loops in invoice & product page
var products = require('./product_data.json');
var quantity_data; // creates global variable to later pass in POST quantity data 
const user_filename = 'user_data.json'; //links variable to json data
var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
var users_reg_data = JSON.parse(data); //parse JSON to object
app.use(myParser.urlencoded({ extended: true }));

app.get("/petstore", function (request, response) {
  var contents = fs.readFileSync('./views/FrenchieParadise_ProductPage.template', 'utf8'); //links var to store template
  response.send(eval('`' + contents + '`')); // render template string

  //Displays pet selection product page using loop and linked external product info based on labs & examples
  function display_pet_page() {
    str = '';
    for (i = 0; i < products.length; i++) {
      str += `
          <section class="pups">
              <h2>${products[i].color}</h2>
              <p>$${products[i].price}</p>
              <label id="quantity${i}_label"}">Quantity</label>
              <input type="text" placeholder="# of Puppies" name="quantity${i}" 
              onkeyup="checkQuantityTextbox(this);">
              <img src="./images/${products[i].image}">
          </section>
      `;
    }
    return str;
  }
});

//Response to quantity data being entered on store form
app.post("/process_form", function (request, response) {
  var POST = request.body;
  console.log(POST); //checks quantities 

  function qty_validation(POST) {
    valid_qty = true;
    invalid_qty = false;

    // Validates that form has valid quantities
    for (i = 0; i < products.length; i++) {
      num_puppies = POST[`quantity${i}`];

      //still not sure how to make sure it wont send empty form

      //makes sure no invalid qtys
      if (!isNonNegInt(num_puppies)) {
        console.log('invalid');
        invalid_qty = true;
      }


      if (isNonNegInt(num_puppies) && num_puppies > 0); {
        console.log('valid');
        valid_qty = true;
      }
    }
    // If there is only valid qtys validation function will return true & submit will go through
    if (valid_qty && !invalid_qty) {
      console.log('success');
      return true;
    }
  }

  //if valid qtys will redirect to login
  if (qty_validation(POST) == true) {
    console.log('val success');
    quantity_data = POST; //Links valid quantity data to variable for later use
    var contents = fs.readFileSync('./views/login.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
  }
});

/*app.post("/process_login", function (request, response) {
  console.log(request.body);//console shows what they typed in
  POST = request.body
  quantity_data = POST[]
  //Process login form POST and redirect to logged in page if ok, back to login page if not
  if (typeof users_reg_data[request.body.username] != 'undefined') {
    if (request.body.password == users_reg_data[request.body.username].password) //checks pword in reg data matches what they typed
    {
      response.send(`thank you for logging in,  ${request.body.username}`);
    } else {
      response.send(`hey ${request.body.username} doesnt match our info for you!`);
    }
  } else {
    response.send(` Hey ${request.body.passsword} does not exist`);
  }
});*/


app.get("/register", function (request, response) {
  var contents = fs.readFileSync('./views/Registration.template', 'utf8');
  response.send(eval('`' + contents + '`')); // render template string
});

//unfinished!
// process a simple register form
app.post("/process_reg", function (request, response) {

  if (typeof users_reg_data[request.body.username] == 'undefined') //checks is username exists 
  {
    console.log(request.body.password);
    console.log(request.body.repeat_password);
    if (request.body.password == request.body.repeat_password) {//checks pword & repeat are the same

      //class version of 4A
      ///add new user data
      username = request.body.username; //takes info for new object from body
      users_reg_data[username] = {};
      users_reg_data[username].password = request.body.password;
      users_reg_data[username].email = request.body.email;
      //write updated object 
      let reg_data = JSON.stringify(users_reg_data) //convert obj to string
      console.log(reg_data); //outputs new string from JSON
      fs.writeFileSync(user_filename, reg_data); //overwrite JSON with new data
      response.redirect("/login");//redirects to login if all is valid
    } else {
      response.redirect("/register"); //reloads register page if pwords dont match
    }
  } else {
    response.redirect("/register"); //reloads reg if username exists
  }


});

//makes sure quantity info is not blank based on lab 13/Assignment1 examples
//change to login also unfinished
app.post("/process_login", function (request, response, next) {
  POST = request.body;
  console.log(quantity_data);
  if (typeof POST['purchase_submit_button'] == 'undefined') {
    alertstr = `<script> alert("Error! You need to select a item or enter valid quantities");
                        window.history.back() </script>`;

    response.send(alertstr);
  }
  console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));

  var contents = fs.readFileSync('./views/invoice_page.template', 'utf8');
  response.send(eval('`' + contents + '`')); // render template string

  //displays invoice page using loop and POST using info from selection page and external products info based on assignment1 examples
  function display_invoice_table_rows() {
    //assume we start with 0 quantity for number of puppies
    subtotal = 0;
    str = '';
    for (i = 0; i < products.length; i++) {
      num_puppies = 0;
      if (typeof POST[`quantity${i}`] != 'undefined') {
        num_puppies = POST[`quantity${i}`];
      }
      if (num_puppies > 0) {
        // product row
        extended_price = num_puppies * products[i].price;
        subtotal += extended_price;
        str += (`
    <tr>
      <td width="43%">${products[i].color}</td>
      <td align="center" width="11%">${num_puppies}</td>
      <td width="13%">\$${products[i].price}</td>
      <td width="54%">\$${extended_price}</td>
    </tr>
    `);
      }
    }


    // Compute tax
    tax_rate = 0.0575;
    tax = tax_rate * subtotal;

    // Compute shipping
    if (subtotal <= 1000) {
      shipping = 50;
    }
    else if (subtotal <= 3000) {
      shipping = 300;
    }
    else {
      shipping = 0.05 * subtotal; // 5% of subtotal
    }

    // Compute grand total
    total = subtotal + tax + shipping;

    return str;
  }
}


);





//creates middleware that handles get requests in document root
app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here


// function making sure only valid positive quantities are used
//code based on code from labs and assignment1 examples
function isNonNegInt(q, return_errors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errors.push('<font color="red">Please enter number value!</font>'); // Check if string is a number value
  else if (q < 0) errors.push('<font color="red">Please put positive number!</font>'); // Check if it is non-negative
  else if (parseInt(q) != q) errors.push('<font color="red">Please put number value!</font>'); // Check that it is an integer
  return return_errors ? errors : ((errors.length > 0) ? false : true);
}





/*
//registration form validation function to catch errors and throw different error messages
function reg_validation() {
  var message, x;
  message = document.getElementById("email_err");
  message.innerHTML = "";
  x = document.getElementById("email").value;
  try {
    if (x == "") throw "empty";
    if (isNaN(x)) throw "not a number";
    x = Number(x);
    if (x < 5) throw "too low";
    if (x > 10) throw "too high";
  }
  catch (err) {
    message.innerHTML = "Input is " + err;

    //form val from W3 js php example
    function formValidation() {
      var uid = document.registration.userid;
      var passid = document.registration.passid;
      var uname = document.registration.username;
      var uadd = document.registration.address;
      var ucountry = document.registration.country;
      var uzip = document.registration.zip;
      var uemail = document.registration.email;
      var umsex = document.registration.msex;
      var ufsex = document.registration.fsex; if (userid_validation(uid, 5, 12)) {
        if (passid_validation(passid, 7, 12)) {
          if (allLetter(uname)) {
            if (alphanumeric(uadd)) {
              if (countryselect(ucountry)) {
                if (allnumeric(uzip)) {
                  if (ValidateEmail(uemail)) {
                    if (validsex(umsex, ufsex)) {
                    }
                  }
                }
              }
            }
          }
        }
      }
      return false;

    } function userid_validation(uid, mx, my) {
      var uid_len = uid.value.length;
      if (uid_len == 0 || uid_len >= my || uid_len < mx) {
        alert("User Id should not be empty / length be between " + mx + " to " + my);
        uid.focus();
        return false;
      }
      return true;
    }
    function passid_validation(passid, mx, my) {
      var passid_len = passid.value.length;
      if (passid_len == 0 || passid_len >= my || passid_len < mx) {
        alert("Password should not be empty / length be between " + mx + " to " + my);
        passid.focus();
        return false;
      }
      return true;
    }
    function allLetter(uname) {
      var letters = /^[A-Za-z]+$/;
      if (uname.value.match(letters)) {
        return true;
      }
      else {
        alert('Username must have alphabet characters only');
        uname.focus();
        return false;
      }
    }
    function alphanumeric(uadd) {
      var letters = /^[0-9a-zA-Z]+$/;
      if (uadd.value.match(letters)) {
        return true;
      }
      else {
        alert('User address must have alphanumeric characters only');
        uadd.focus();
        return false;
      }
    }
    function countryselect(ucountry) {
      if (ucountry.value == "Default") {
        alert('Select your country from the list');
        ucountry.focus();
        return false;
      }
      else {
        return true;
      }
    }
    function allnumeric(uzip) {
      var numbers = /^[0-9]+$/;
      if (uzip.value.match(numbers)) {
        return true;
      }
      else {
        alert('ZIP code must have numeric characters only');
        uzip.focus();
        return false;
      }
    }
    function ValidateEmail(uemail) {
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (uemail.value.match(mailformat)) {
        return true;
      }
      else {
        alert("You have entered an invalid email address!");
        uemail.focus();
        return false;
      }
    } function validsex(umsex, ufsex) {
      x = 0;

      if (umsex.checked) {
        x++;
      } if (ufsex.checked) {
        x++;
      }
      if (x == 0) {
        alert('Select Male/Female');
        umsex.focus();
        return false;
      }
      else {
        alert('Form Succesfully Submitted');
        window.location.reload()
        return true;
      }
    }*/
