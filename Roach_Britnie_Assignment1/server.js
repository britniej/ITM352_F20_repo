//Server for POSTING products info & pet selection page info and rendering invoive page and pet selection page
//Based on server in Assignment1 examples, Lab 12/13

var express = require('express');
var app = express();
myParser = require("body-parser");
var fs = require('fs');
//loads json data onto products variable for use in loops in invoice & product page
var products = require('./product_data.json');

app.use(myParser.urlencoded({ extended: true }));


//makes sure quantity info is not blank based on lab 13/Assignment1 examples
app.post("/process_invoice_page", function (request, response, next) {
  let POST = request.body;
  if (typeof POST['purchase_submit_button'] == 'undefined') {
    console.log('No purchase form data');
    next();
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
        extended_price = num_puppies * products[i].price
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

});
app.get("/petstore", function (request, response) {
  var contents = fs.readFileSync('./views/FrenchieParadise_ProductPage.template', 'utf8');
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


//creates middleware that handles get requests in document root
app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here



