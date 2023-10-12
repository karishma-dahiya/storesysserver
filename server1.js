let { data } = require('./data.js');
let express = require('express');
let app = express();
app.use(express.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

const port = 3002;

app.listen(port, () => console.log(`Server is listening on port ${port}`));



let fs = require('fs');
let fname = 'data.json';



//  SHOPS

app.get('/shops', function (req, res) {
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            res.send(dataArr.shops);
        }
    });
});
app.post('/shops', function (req, res) {
    let shop = req.body;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let maxid = dataArr.shops.reduce(
                (acc, curr) => (curr.shopId > acc ? curr.shopId : acc),
                0);
            //console.log(maxid);
            let newID = maxid + 1;
            let newItem = { ...shop, shopId: newID }
            dataArr.shops.push(newItem);
            let data1 = JSON.stringify(dataArr);
            fs.writeFile(fname, data1, function (err) {
                if (err) res.status(404).send(err);
                else res.send('Shop added');
            });
        }
    });
})

//PRODUCTS

app.get('/products', function (req, res) {
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            res.send(dataArr.products);
        }
    });
});
app.post('/products', function (req, res) {
    let newdata = req.body;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let maxid = dataArr.products.reduce(
                (acc, curr) => (curr.productId > acc ? curr.productId : acc),
                0);
            let newID = maxid + 1;
            let newItem = { ...newdata, productId: newID }
            dataArr.products.push(newItem);
            let data1 = JSON.stringify(dataArr);
            fs.writeFile(fname, data1, function (err) {
                if (err) res.status(404).send(err);
                else res.send('Product added');
            });
        }
    });
})
app.put('/products/:id', function (req, res) {
    let body = req.body;
    let id = +req.params.id;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let ind = dataArr.products.findIndex((a) => a.productId === id);
            if (ind >= 0) {
                let updated = { ...dataArr.products[ind], ...body };
                dataArr.products[ind] = updated;
                let data1 = JSON.stringify(dataArr);
                fs.writeFile(fname, data1, function (err) {
                    if (err) res.status(404).send(err);
                    else res.send("UPDATED");
                });
            }
            else res.status(404).send(`No product found with the id: ${id}`);  
        }
    });
});

// PURCHASES

app.get('/purchases', function (req, res) {
    let { shop, product, sort } = req.query;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let purchases = dataArr.purchases;
            if (shop) {
                purchases = purchases.filter((a) => a.shopId === +shop);
            }
            if (product) {
                let values = product.split(',');
                purchases = purchases.filter((a) => values.find((b)=>+b===a.productid));
            }
            if (sort === 'QtyAsc') {
                purchases.sort((a, b) => a.quantity - b.quantity);
            }
            if (sort === 'QtyDesc') {
                purchases.sort((a, b) => b.quantity - a.quantity);
            }
            if (sort === 'ValueAsc') {
                purchases.sort((a, b) => (a.quantity*a.price) - (b.quantity * b.price));
            }
            if (sort === 'ValueDesc') {
                purchases.sort((a, b) => (b.quantity*b.price) - (a.quantity * a.price));
            }
            res.send(purchases);
        }
    });
});
app.get('/purchases/shops/:id', function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let purchases = dataArr.purchases.filter((a) => a.shopId === id);
            res.send(purchases);
        }
    });
});
app.get('/totalPurchase/shop/:id', function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let purchases = dataArr.purchases.filter((a) => a.shopId === id);
            let totalPurchase = [];
            let purchase = purchases.map((pur) => {
                let { purchaseId,productid,shopId, quantity, price } = pur;
                let amount = price * quantity;
                let newProd = {
                    shopId: shopId,
                    productId:productid,
                    totalAmount: amount,
                    totalQty: quantity
                };
                let findInd = totalPurchase.findIndex((a) => a.productId === productid);
                if (findInd >= 0) {
                    totalPurchase[findInd].totalAmount += amount;
                    totalPurchase[findInd].totalQty += quantity;
                } else {
                    totalPurchase.push(newProd);
                }
                return;
            });
            res.send(totalPurchase);
        }
    });
});
app.get('/purchases/products/:id', function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let purchases = dataArr.purchases.filter((a) => a.productid === id);
            res.send(purchases);
        }
    });
});
app.get('/totalPurchase/product/:id', function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, 'utf8', function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let dataArr = JSON.parse(data);
            let purchases = dataArr.purchases.filter((a) => a.productid === id);
            let totalPurchase = [];
            let purchase = purchases.map((pur) => {
                let { purchaseId,productid,shopId, quantity, price } = pur;
                let amount = price * quantity;
                let newProd = {
                    shopId: shopId,
                    productId:productid,
                    totalAmount: amount,
                    totalQty: quantity,
                   
                };
                let findInd = totalPurchase.findIndex((a) => a.shopId === shopId);
                if (findInd >= 0) {
                    totalPurchase[findInd].totalAmount += amount;
                    totalPurchase[findInd].totalQty += quantity;
                } else {
                    totalPurchase.push(newProd);
                }
                return;
            });
            res.send(totalPurchase);
        }
    });
});

app.get('/resetData', function (req, res) {
    let newdata = JSON.stringify(data);
    fs.writeFile(fname, newdata, function (err) {
        if (err) res.status(404).send(err);
        else res.send('Data in file is reset');
    });
});
