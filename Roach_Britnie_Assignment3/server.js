//Server for POSTING products info & pet selection page info and rendering invoive page and pet selection page
//Based on server in Assignment1 examples, Lab 12/13

var express = require('express');
var app = express();
myParser = require("body-parser");
var fs = require('fs');
const { join } = require('path');
var products_data = require('./product_data.json'); //loads json data onto products variable for use in loops in invoice & product page
var quantity_data; // creates global variable to later pass in POST quantity data 
const user_filename = 'user_data.json'; //links variable to json data
var data = fs.readFileSync(user_filename, 'utf-8'); //var linked to contents of json file
const users_reg_data = JSON.parse(data); //parse JSON to object

var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
app.use(session({ secret: "ITM352 rocks!" }));

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

var display_invoice_table_rows;
app.get("/cart", function (request, response) {
  //var pup_cart = request.session.cart;
  console.log(`${request.session.cart} ${request.session.cart.length}`);



    console.log('cart not empty');
    var contents = fs.readFileSync('./views/cart.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));

    //displays invoice page using loop and POST using info from selection page and external products info based on assignment1 examples
    var username = POST.uname;
    subtotal = 0;
    var pup_cart = request.session.cart;


    function display_invoice_table_rows() {
    for (products_key in pup_cart) {

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
    }}
  //} else {
    //console.log('cart empty');
    //add code for alert cart empty
  }
);


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
      pup_cart = request.session.cart;
      products = products_data[products_key]; var username = POST.uname;
      subtotal = 0;
      str = '';
      for (i = 0; i < products.length; i++) {
        //num_puppies = 0;
        //if (typeof POST[`quantity${i}`] != 'undefined') {
        num_puppies = pup_cart[products_key][`quantity${i}`]; //using the session data 

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
    }
  } else {
    console.log('invoice fail');
    return false;
  }
});

app.get("/checkout", function (request, response) {
  // Generate HTML invoice string
  var invoice_str = `Thank you for your order!<table border><th>Quantity</th><th>Item</th>`;
  var shopping_cart = request.session.cart;
  for (product_key in products_data) {
    for (i = 0; i < products_data[product_key].length; i++) {
      if (typeof shopping_cart[product_key] == 'undefined') continue;
      qty = shopping_cart[product_key][i];
      if (qty > 0) {
        invoice_str += `<tr><td>${qty}</td><td>${products_data[product_key][i].name}</td><tr>`;
      }
    }
  }
  invoice_str += '</table>';
  // Set up mail server. Only will work on UH Network due to security restrictions
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  var user_email = 'phoney@mt2015.com';
  var mailOptions = {
    from: 'phoney_store@bogus.com',
    to: user_email,
    subject: 'Your phoney invoice',
    html: invoice_str
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      invoice_str += '<br>There was an error and your invoice could not be emailed :(';
    } else {
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
    }
    response.send(invoice_str);
  });

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






