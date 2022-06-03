const express = require('express');
const app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const mongoURL = "mongodb+srv://test:test123@cluster0.87fy1.mongodb.net/digital_box?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const cors = require('cors');
let port = process.env.PORT || 3000;
var db;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to DigitalBox API')
})

app.get('/category',(req,res) => {
    db.collection('categories').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

app.get('/brand',(req,res) => {
    let categoryId = req.query.category;
    let query = {};
    if(categoryId){
        query = {category_id: categoryId};
    }
    db.collection('brands').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

app.get('/products',(req,res) => {
    let categoryId = Number(req.query.category);
    let brandId = req.query.brand;
    let query = {};
    if(categoryId && brandId){
        query = {"category_id": categoryId,"brand_id": brandId};
    } else if(categoryId){
        query = {category_id: categoryId};
    } else if(brandId){
        query = {brand_id: brandId};
    }
    db.collection('products').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

app.get('/productDetails/:id', (req, res) => {
    let productId = Number(req.params.id);
    db.collection('products').find({id:productId}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})
app.get('/filter/:id',(req,res) => {
    let categoryId = Number(req.params.id);
    let query = {category_id: categoryId};
    let sort = {};
    let brandId = req.query.brand;
    let lcost = req.query.lcost;
    let hcost = req.query.hcost;
    let skip= 0;
    let limit= 1000000000000000;
    if(req.query.skip && req.query.limit){
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }
    if(req.query.sort){
        sort = {pricing: req.query.sort};
    }
    if(brandId){
        query = {category_id: categoryId, brand_id: brandId}
    } else if(lcost&&hcost) {
        query = {$and: [{pricing:{$gt:lcost,$lt:hcost}}], category_id: categoryId};
    }
    db.collection('products').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

app.post('/placeOrder',(req,res) => {
    db.collection('orders').insert(req.body,(err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

app.get('/orders',(req,res) => {
    db.collection('orders').find().toArray((err,result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.put('/updateOrder/:id',(req, res) =>{
    let oid = mongo.ObjectId(req.params.id);
    db.collection('orders').updateOne(
        {_id: oid},
        {$set:{
            "status": req.body.status ? req.body.status: "Pending",
            "orderId": req.body.orderId,
            "date": req.body.date,
            "bank": req.body.bank
        }},(err,result) =>{
            if (err) throw err;
            res.send(`Status Updated to ${req.body.status}`);
        }
    )
})

app.delete('/deleteOrder',(req,res) =>{
    db.collection('orders').remove({},(err,result) =>{
        if (err) throw err;
        res.send('Order Removed');
    })
})

app.post('/cart',(req, res) => {
    db.collection('products').find({id: {$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

app.post('/wishlist',(req, res) => {
    db.collection('products').find({id: {$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

MongoClient.connect(mongoURL, (err,client) => {
    if (err) console.log("Error While Connecting");
    db = client.db('digital_box');
    app.listen(port,() =>{
        console.log(`Listening to ${port}`);
    })
})