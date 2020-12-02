//Server for POSTING products info & pet selection page info and rendering invoive page and pet selection page
//Based on server in Assignment1 examples, Lab 12/13

var express = require('express');
var app = express();
myParser = require("body-parser");
var fs = require('fs');
const { join } = require('path');
var products = require('./product_data.json'); //loads json data onto products variable for use in loops in invoice & product page
var quantity_data; // creates global variable to later pass in POST quantity data 
const user_filename = 'user_data.json'; //links variable to json data
var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
const users_reg_data = JSON.parse(data); //parse JSON to object
app.use(myParser.urlencoded({ extended: true }));
var username;//creates variable for personalization after login


app.get("/petstore", function (_request, response) {
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

  //validation set onsubmit function of so form will only submit and redirect if all quantities ARE VALID
  function qty_validation(POST) {
    valid_qty = true;
    invalid_qty = false; //setting up variables and assuming no invalid qtys

    // Validates that form has valid quantities
    for (i = 0; i < products.length; i++) {
      num_puppies = POST[`quantity${i}`];


      //makes sure no invalid qtys with help for empty form from JOJO LAU
      if (!isNonNegInt(num_puppies) || POST.quantity0 == '' && POST.quantity1 == '' && POST.quantity2 == '' && POST.quantity3 == '' && POST.quantity4 == '' && POST.quantity5 == '') {
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

  //if valid qtys will redirect to login or it will stay on product page and the page will show how to fix and error location
  if (qty_validation(POST) == true) {
    console.log('val success');
    quantity_data = POST; //Links valid quantity data to variable for later use
    var contents = fs.readFileSync('./views/Login.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
  }
});

app.get("/register", function (_request, response) {
  var contents = fs.readFileSync('./views/Registration.template', 'utf8');
  response.send(eval('`' + contents + '`')); // render template string
});

//unfinished!
// process a simple register form
app.post("/process_reg", function (request, response) {
  POST = request.body;
  console.log(request.body);
  var fname = request.body.fname;
  var uname = request.body.uname;
  var psw = request.body.psw;
  var psw_repeat = request.body.psw_repeat;
  var email = request.body.email;
  errors = []; //assume no errors 

  function reg_validation() {
    // Name validation
    function fname_val(fname) {

      if (fname > 30) {
        console.log("Name should be under 30 characters & only contain letters");
        return false;
      } else {
        return true;
      }
    }


    // Username validation
    function val_uname(uname) {
      if (typeof users_reg_data[uname] != 'undefined') {
        console.log('This username is already taken');//checks that username does not exist
      } else
        //check with that username correct format 
        if ((/^[0-9a-zA-Z]{4,30}$/).test(uname) == false) {
          console.log('Username must be between 4-10 characters & must contain letters and numbers only');
        } else {

          return true;
        }
    }


    // Password validation
    function val_psw(psw) {
      if (psw.length < 6) {
        console.log('Password needs a minimum of 6 characters');
      } else {
        return true;
      }
    }

    function val_psw_repeat(psw_repeat) {
      if (psw_repeat !== psw) {
        console.log('Password does not match initial password entry, please try again.')
        return false;
      } else {
        return true;
      }
    }


    // Email validation
    function val_email(email) {
      if ((/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/).test(email) == true) {
        return true;
      } else {
        console.log('Please enter a valid password. Example: jane@gmail.com');
      }
    }


    if (fname_val(fname) && val_uname(uname) && val_psw(psw) && val_psw_repeat(psw_repeat) && val_email(email)) {
      console.log('reg val success');
      return true
    }
    else {
      console.log('reg fail');
      return false;
    }
  }


  //if validation passes save new user & direct to login
  if (reg_validation(POST) == true) {
    ///adds new user data
    console.log(users_reg_data);
    username = uname; //takes info for new object from body
    users_reg_data[username] = {};
    users_reg_data[username].fullname = fname;
    users_reg_data[username].password = psw;
    users_reg_data[username].email = email;
    //write updated object 
    let reg_data = JSON.stringify(users_reg_data) //convert obj to string
    console.log(reg_data); //outputs new string from JSON
    fs.writeFileSync(user_filename, reg_data); //overwrite JSON with new data
    console.log(users_reg_data);

    //if valid send to login page
    var contents = fs.readFileSync('./views/Login.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

  } else {
    console.log('REG FAILED');
    //add code to return errors
  }
});




//makes sure quantity info is not blank based on lab 13/Assignment1 examples
//change to login also unfinished
app.post("/process_login", function (request, response, next) {
    POST = request.body;
    const user_filename = 'user_data.json'; //links variable to json data
    var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
    const users_reg_data = JSON.parse(data); //parse JSON to objectconst users_reg_data = JSON.parse(data); //parse JSON to object
    console.log(quantity_data);
    console.log(users_reg_data);
    console.log(request.body.psw);
    //var login_uname = request.body.uname;
    //function to validate password matches registration data

     //function to enable submit on login page ONSUBMIT function for the login form
     function login_val() {
     

   //validate username exists
      if (typeof users_reg_data[request.body.uname] != 'undefined') {
        console.log('uname success');
        var username = request.body.uname; //links variable to username after validation
        //if username exists then moves on to validate password
        if (request.body.psw == users_reg_data[request.body.uname].password) {
          console.log('psw success');
          return true;
        } else {
          console.log('psw fail');
          return false;
        }
      } else {
        console.log('uname fail');
        return false;
      }
    }

    //display invoice if onsubmit validation passes
    if (login_val(POST) == true) {
      var contents = fs.readFileSync('./views/invoice_page.template', 'utf8');
      response.send(eval('`' + contents + '`')); // render template string

      console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));

      //displays invoice page using loop and POST using info from selection page and external products info based on assignment1 examples
      function display_invoice_table_rows() {
        var username = POST.uname;
        subtotal = 0;
        str = '';
        for (i = 0; i < products.length; i++) {
          //num_puppies = 0;
          //if (typeof POST[`quantity${i}`] != 'undefined') {
          num_puppies = quantity_data[`quantity${i}`]; //using the global variable linked to users valid quantity data earlier

          if (num_puppies > 0) {
            // product row
            extended_price = num_puppies * products[i].price;
            subtotal += extended_price;
            str += (`
    <tr>
    <h3>Thank you, ${username} for your purchase! Please await an email with your invoice, as well as our shipping & care instructions.</h3>
      <td width="40%">${products[i].color}</td>
      <td align="center" width="10%">${num_puppies}</td>
      <td width="35%">\$${products[i].price}</td>
      <td width="15%">\$${extended_price}</td>
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
      } } else {
      console.log('invoice fail');
      return false;
    }
  });


//creates middleware that handles get requests in document root
app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here


// function making sure only valid positive quantities are used
//code based on code from labs and assignment1 examples
function isNonNegInt(q, return_errors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) console.log('<font color="red">Please enter number value!</font>'); // Check if string is a number value
  else if (q < 0) console.log('<font color="red">Please put positive number!</font>'); // Check if it is non-negative
  else if (parseInt(q) != q) console.log('<font color="red">Please put number value!</font>'); // Check that it is an integer
  return return_errors ? errors : ((errors.length > 0) ? false : true);
}






