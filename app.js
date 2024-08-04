const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema } = require("./schema.js");

const uri = "mongodb+srv://arpitghorpade930:MVJMNe7CvJMCdtNX@cluster0.1qiqk01.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const listingsCollection = client.db("wanderlust").collection("listings");
  const allListings = await listingsCollection.find({}).toArray();
  res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listingsCollection = client.db("wanderlust").collection("listings");
  const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
  res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
  const listingsCollection = client.db("wanderlust").collection("listings");
  const newListing = req.body.listing;
  await listingsCollection.insertOne(newListing);
  res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listingsCollection = client.db("wanderlust").collection("listings");
  const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
  res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listingsCollection = client.db("wanderlust").collection("listings");
  await listingsCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body.listing });
  res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listingsCollection = client.db("wanderlust").collection("listings");
  await listingsCollection.deleteOne({ _id: new ObjectId(id) });
  res.redirect("/listings");
}));

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(3000, () => {
  console.log("server is listening to port 3000");
});
