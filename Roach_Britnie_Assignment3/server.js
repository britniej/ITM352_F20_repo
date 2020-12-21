//Server for POSTING products info & pet selection page info and rendering invoive page and pet selection page
//Based on server in Assignment1 examples, Lab 12/13

var express = require('express');
var app = express();
var nodemailer = require('nodemailer');

myParser = require("body-parser");
var fs = require('fs');
const { join } = require('path');
var products_data = require('./product_data.json'); //loads json data onto products variable for use in loops in invoice & product page
const user_filename = 'user_data.json'; //links variable to json data
var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
const users_reg_data = JSON.parse(data); //parse JSON to object
var username;
var user_email;

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
app.use(session({
  secret: "ITM352 rocks!",
  resave: true, //saves the session
  saveUninitialized: false, //deletes or forgets session when it is done
  httpOnly: false, //doesnt allow access of cookies 
  secure: true, //only uses cookies in HTTPS
  ephemeral: true //this deletes this cookie when browser is closed 
}));

app.use(myParser.urlencoded({ extended: true }));
app.use(myParser.json()); //parses POST data into JSON
var username;//creates variable for personalization after login


//Code based on optional class advise given by Prof. Port to Daphne Oh 
app.all('*', function (request, response, next) {
  console.log(request.sessionID);
  console.log(request.method + ' to ' + request.path);
  if (!request.session.cart) { // if is undefined or null = false
    request.session.cart = {}; //initializes empty cart/session

    console.log(request.session.cart);
  }
  next();
})

//Response to quantity data being entered on store form
app.post("/process_update_cart", function (request, response, next) {
  console.log(request.session.cart);
  var POST = request.body;
  console.log(POST); //checks quantities 
  return_data = {};

  //loop through post.quantity & check if qtys are nonnegint if not errors in return_data

  //if qty is valid put into session 
  request.session.cart[POST.products_key] = POST.quantity;
  request.session.save();
  return_data['status'] = "cart updated!";

  console.log(request.session.cart);
  response.json(return_data); //shows alert with cart status 

});

//Microservice based off optional class help he gave to Daphne Oh
//This service helps the product pages update_cart function to fetch the products data
app.post("/get_products_data", function (request, response) {
  response.json(products_data);
});


// Assignment 3 example code, Ex 1
app.post("/get_cart", function (request, response) {
  response.json(request.session.cart);
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
    //No submit and stay on page until validation passes
  }
});

//Response to cart being requested
app.get("/login_to_cart", function (request, response) {
  //makes sure cart is not empty & redirects to login page before viewing cart
  //if (request.session.cart.length > 0) {
  console.log('cart not empty');
  var contents = fs.readFileSync('./views/Login.template', 'utf8');
  response.send(eval('`' + contents + '`'));
  // render template string
  //add else code for empty cart
});


app.post("/process_login_to_cart", function (request, response) {
  POST = request.body;
  const user_filename = 'user_data.json'; //links variable to json data
  var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
  const users_reg_data = JSON.parse(data); //parse JSON to objectconst users_reg_data = JSON.parse(data); //parse JSON to object
  console.log(users_reg_data);

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

  //display cart if onsubmit login validation passes
  if (login_val(POST) == true) {
    //var pup_cart = request.session.cart;
    console.log(`${request.session.cart} ${request.session.cart.length}`);

    //displays invoice page using loop and POST using info from selection page and external products info based on assignment1 examples
    request.session.username = POST.uname;
    username = request.session.username;

    console.log()
    subtotal = 0;
    var pup_cart = request.session.cart;
    var products = products_data;
    var display_invoice_table_rows = '';

    //function display_invoice_table_rows() {
    for (products_key in pup_cart) {
      products = products_data[products_key];

      for (i = 0; i < pup_cart[products_key].length; i++) {
        num_puppies = pup_cart[products_key][i]; //using the session data 

        if (num_puppies > 0) {
          // product row
          extended_price = num_puppies * products[i].price;
          subtotal += extended_price;
          display_invoice_table_rows += (`
  <tr>
    <td width="40%">${products[i].color}</td>
    <td align="center" width="10%">${num_puppies}</td>
    <td width="35%">\$${products[i].price}</td>
    <td width="15%">\$${extended_price}</td>
  </tr>
  `);
        }
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

    console.log('cart not empty');

    var contents = fs.readFileSync('./views/cart.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
  }
});

app.get("/checkout", function (request, response) {
  const user_filename = 'user_data.json'; //links variable to json data
  var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
  const users_reg_data = JSON.parse(data); //parse JSON to objectconst users_reg_data = JSON.parse(data); //parse JSON to object
  console.log(users_reg_data);

  //displays invoice page using loop and POST using info from selection page and external products info based on assignment1 examples
  subtotal = 0;
  var pup_cart = request.session.cart;
  var products = products_data;
  var display_invoice_table_rows = '';

  //function display_invoice_table_rows() {
  for (products_key in pup_cart) {
    products = products_data[products_key];

    for (i = 0; i < pup_cart[products_key].length; i++) {
      num_puppies = pup_cart[products_key][i]; //using the session data 

      if (num_puppies > 0) {
        // product row
        extended_price = num_puppies * products[i].price;
        subtotal += extended_price;
        display_invoice_table_rows += (`
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

  console.log('cart not empty');

  var contents = fs.readFileSync('./views/invoice.template', 'utf8');
  response.send(eval('`' + contents + '`')); // render template string

  console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));


  //Setting up mail server on UH server based off from ASSIGNMENT 3 examples from DPORT && JOJO LAU
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      //send if even invalid
      rejectUnauthorized: false
    }
  });

  var user_email = users_reg_data[username].email; // Link user email from reg data 


  // Sends invoice to user's email from my unimportant email address
  var mailOptions = {
    from: 'britniej@hawaii,edu',
    to: user_email,
    subject: 'Invoice from your purchase at FRENCHIE PARADISE',
    html: `
    <table border="2">
    <tbody>
      <tr>
        <th style="text-align: center;" width="40%">French Bulldog Puppy Color</th>
        <th style="text-align: center;" width="10%">Quantity</th>
        <th style="text-align: center;" width="35%">Price Per Puppy</th>
        <th style="text-align: center;" width="15%">Bundle price</th>
      </tr>

       </tr>
              <!-- calls on function from server to display invoice (reference server)-->

        ${display_invoice_table_rows}
      <tr>
        <td colspan="4" width="100%">&nbsp;</td>
      </tr>
      <tr>
        <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
        <td width="54%">$
          ${subtotal}
        </td>
      </tr>
      <tr>
        <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @
            ${(100 * tax_rate)}%</span></td>
        <td width="54%">\$${tax.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="text-align: center;" colspan="3" width="67%">Shipping</span></td>
        <td width="54%">\$${shipping.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
        <td width="54%"><strong>\$${total.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>`}

  //} else {
  //console.log('cart empty');
  //add code for alert cart empty
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






