//Server for POSTING products info & pet selection page info and rendering invoive page and pet selection page
//Based on server in Assignment1 examples, Lab 12/13

var express = require('express');
var app = express();
myParser = require("body-parser");
var fs = require('fs');
//loads json data
var products = require('./product_data.json');

/*recomended to put in all server code checks to see if we get all the right things
app.all('*', function (request, response, next) {
  console.log(request.method + ' to path ' + request.path);
  next();
});*/

app.use(myParser.urlencoded({ extended: true }));

//makes sure quantity info is not blank based on lab 13/Assignment1 examples
app.post("/process_invoice_page", function (request, response, next) {
  let POST = request.body;
  if (typeof POST['purchase_submit'] == 'undefined') {
    console.log('No purchase form data');
    next();
  }
  console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));

  var contents = fs.readFileSync('./views/invoice_page.template', 'utf8');
  response.send(eval('`' + contents + '`')); // render template string

  //displays invoice page using loop and POST using info from selection page and external products info
  function display_invoice_table_rows() {
      subtotal = 0;
      str = '';
      for (i = 0; i < products.length; i++) {
          num_puppies = 0;
          if(typeof POST[`quantity${i}`] != 'undefined') {
            num_puppies = POST[`quantity${i}`];
          }
          if (num_puppies > 0) {
              // product row
              extended_price =num_puppies * products[i].price
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
      if (subtotal <= 50) {
          shipping = 2;
      }
      else if (subtotal <= 100) {
          shipping = 5;
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

//Displays pet selection product page using loop and linked external product info
function display_pet_page() {
  str = '';
  for (i = 0; i < products.length; i++) {
      str += `
          <section class="item">
              <h2>${products[i].color}</h2>
              <p>$${products[i].price}</p>
              <label id="quantity${i}_label"}">Quantity</label>
              <input type="text" placeholder="0" name="quantity${i}" 
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





  /*function isNonNegInt(q, returnErrors = false) {
    errors = [];
    if (Number(q) !== q) { errors.push('Not a number!'); }
    else {
      if (q < 0) errors.push('Negative value!');
      if (parseInt(q) != q) errors.push('Not a integer!');
    }
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
  }

  //takes product/quantity form info and syncs it with invoice
  function process_quantity_form(POST, response) {
    if (typeof POST['purchase_submit_button'] != 'undefined') {
      var contents = fs.readFileSync('./invoice_page.html', 'utf8');
      receipt = '';
      for (i in products) {
        let q = POST[`quantity_textbox${i}`];
        let model = products[i]['color'];
        let model_price = products[i]['price'];
        if (isNonNegInt(q)) {
          receipt += eval('`' + contents + '`'); // render template string
        } else {
          receipt += `<h3><font color="red">${q} is not a valid quantity for ${model}!</font></h3>`;
        }
      }
      response.send(receipt);
      response.end();
    }
  }*/
