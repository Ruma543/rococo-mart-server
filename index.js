const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hybcmzi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });

    const productCollection = client.db('productDB').collection('product');
    const brandCollection = client.db('productDB').collection('brand');
    const cardCollection = client.db('productDB').collection('card');

    app.get('/products/:brand', async (req, res) => {
      const brand = req.params.brand;
      const cursor = productCollection.find({ brand });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/brands', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get('/products/sProduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.put('/products/sProduct/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const product = {
        $set: {
          brand: updateProduct.brand,
          type: updateProduct.type,
          name: updateProduct.name,
          description: updateProduct.description,
          price: updateProduct.price,
          rating: updateProduct.rating,
          image: updateProduct.image,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
    });

    app.get('/cards', async (req, res) => {
      const cursor = cardCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post('/cards', async (req, res) => {
      const newCard = req.body;
      console.log(newCard);
      const result = await cardCollection.insertOne(newCard);
      res.send(result);
    });

    app.patch('/cards', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          email: user.email,
        },
      };
      const result = await cardCollection.updateOne(filter, options, updateDoc);
      res.send(result);
    });

    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('My Rococo Mart server is running');
});

app.listen(port, () => {
  console.log(`My Rococo Mart server is running, ${port}`);
});
