//jshint esversion:6
const ROOM_ID = "83a356a2-756f-45a6-9408-51e5ae8eba19"

const mongoose = require("mongoose");
const express = require("express");
const path = require("path")
require('dotenv').config();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const multer = require("multer");
var fs = require('fs');

const crypto = require('crypto'); // Import NodeJS's Crypto Module

const { Decimal128, Double } = require('mongodb');
const { info } = require("console");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public/img"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    Role: String
  });
const informationSchema = new mongoose.Schema({
    ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    Name: String,
    Address: String,
    tin: Number,
    gmail: String, 
    adhaarNumber: Number,
    about: String,
    imagename: String,
    Rating: Number
  });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const information = new mongoose.model("information", informationSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(express.static("public/img"));

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/img");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("image");

app.get("/", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      information.find({}, function (err, doctor) {
        if (err){
          console.log(err);
        }
        else{
          res.render("home", {loggedIn: 1, page: 1, doctor: doctor});
        }
      });
    }
    else if(req.user.Role=="Doctor"){
      information.find({}, function (err, doctor) {
        if (err){
          console.log(err);
        }
        else{
          res.render("home", {loggedIn: 2, page: 1, doctor: doctor});
        }
      });
    }
    else{
      information.find({}, function (err, doctor) {
        if (err){
          console.log(err);
        }
        else{
          res.render("home", {loggedIn: 3, page: 1, doctor: doctor});
        }
      });
    }
  } 
  else{
    information.find({}, function (err, doctor) {
      if (err){
        console.log(err);
      }
      else{
        res.render("home", {loggedIn: 0, page: 1, doctor: doctor});
      }
    });
  }
});

app.get("/login", function(req, res){
  if (!(req.isAuthenticated())){
    res.render("login", {loggedIn: 0, page: 5});
  } 
});

app.get("/register", function(req, res){
  if (!(req.isAuthenticated())){
    res.render("register", {loggedIn: 0, page: 4});
  } 
});

app.get("/about", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      res.render("about", {loggedIn: 1, page: 2});
    }
    else if(req.user.Role=="Doctor"){
      res.render("about", {loggedIn: 2, page: 2});
    }
    else{
      res.render("about", {loggedIn: 3, page: 2});
    }
  } 
  else{
    res.render("about", {loggedIn: 0, page: 2});
  }
});

app.get("/feature", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      res.render("feature", {loggedIn: 1, page: 6});
    }
    else if(req.user.Role=="Doctor"){
      res.render("feature", {loggedIn: 2, page: 6});
    }
    else{
      res.render("feature", {loggedIn: 3, page: 6});
    }
  } 
  else{
    res.render("feature", {loggedIn: 0, page: 6});
  }
});

app.get("/team", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      information.find({}, function (err, doctor) {
        if (err){
          console.log(err);
        }
        else{
          res.render("team", {loggedIn: 1, page: 7, doctor: doctor});
        }
      }); 
    }
    else if(req.user.Role=="Doctor"){
      information.find({}, function (err, doctor) {
        if (err){
          console.log(err);
        }
        else{
          res.render("team", {loggedIn: 2, page: 7, doctor: doctor});
        }
      }); 
    }
    else{
      information.find({}, function (err, doctor) {
        if (err){
          console.log(err);
        }
        else{
          res.render("team", {loggedIn: 3, page: 7, doctor: doctor});
        }
      }); 
    }
  } 
  else{
    information.find({}, function (err, doctor) {
      if (err){
        console.log(err);
      }
      else{
        res.render("team", {loggedIn: 0, page: 7, doctor: doctor});
      }
    }); 
  }
});

app.get("/detail", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      res.render("detail", {loggedIn: 1, page: 8});
    }
    else if(req.user.Role=="Doctor"){
      res.render("detail", {loggedIn: 2, page: 8});
    }
    else{
      res.render("detail", {loggedIn: 3, page: 8});
    }
  } 
  else{
    res.render("detail", {loggedIn: 0, page: 8});
  }
});

app.get("/questionnaire", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      res.render("questionnaire", {loggedIn: 1, page: 11});
    }
  } 
  else{
    res.redirect("/");
  }
});

app.get("/Review/:id", async function(req, res){
  id_product = req.params.id;
  let doctor = await information.find({_id: req.params.id})
  if(doctor.length!=0){
    if (req.isAuthenticated()){
      if(req.user.Role=="Patient"){
        res.render("Review", {product: doctor[0], page: 13, loggedIn: 1});
      }
      else{
        res.redirect("/");
      }
    } 
    else {
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/");
  }
});

app.get("/course", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Patient"){
      res.render("course", {loggedIn: 1, page: 3});
    }
    else if(req.user.Role=="Doctor"){
      res.render("course", {loggedIn: 2, page: 3});
    }
    else{
      res.render("course", {loggedIn: 3, page: 3});
    }
  } 
  else {
    res.redirect("/login");
  }
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    ID=req.user.id;
    User.findById(req.user.id, function(err, foundUser){
        if (err){console.log(err);}
        else{
          if(foundUser){
              res.redirect("/");
          }
        }
    });
  }else{
    res.redirect("/login");
  }
});

app.get("/doctor", function(req, res){
  if (req.isAuthenticated()){
    let found=0;
    let array=[];
    if(req.user.Role=="Doctor"){
        information.find({ ID: ID}, function (err, foundUser) {
        if (err){
            console.log(err);
        }
        else{
          if(foundUser.length!=0){
            found=1;
            array.push(foundUser[0].Name);
            array.push(foundUser[0].Address);
            array.push(foundUser[0].tin);
            array.push(foundUser[0].gmail);
            array.push(foundUser[0].adhaarNumber);
            array.push(foundUser[0].imagename);
            array.push(foundUser[0].about);
            console.log(foundUser[0]);
          }
          res.render("doctor", {loggedIn: 2, page: 9, found: found, array: array});
        }});
    }
      else{
      res.redirect("/");
  }
  }else{
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});

app.post('/login', function(req, res, next) {
  console.log('Login page')
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  passport.authenticate('local', function(err, user, info) {
  if (err) { return next(err); }
  if (!user) { return res.redirect('/login'); }
  req.logIn(user, function(err) {
    if (err) { return next(err); }
    return res.redirect('/secrets');
  });
})(req, res, next);
});

app.post("/register", function(req, res){
  console.log(req.body.Role);
  User.register({username: req.body.username, Role: req.body.Role}, req.body.password, function(err, user){
      if (err) {console.log(err);res.redirect("/register");}
      else{passport.authenticate("local")(req, res, function(){res.redirect("/secrets");});
    }
  });
});

app.post("/doctor", upload, function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Doctor"){
      var name, update;
      if(req.file!=null){
        name=req.file.filename;
        update = { $set: 
          { 
            ID: ID,
            Name: req.body.username,
            Address: req.body.Address,
            tin: req.body.TIN,
            gmail: req.body.email, 
            adhaarNumber: req.body.Adhaar,
            about: req.body.self,
            imagename: name,
            Rating: 5
          }};
      }
      else{
        update = { $set: 
          { 
            ID: ID,
            Name: req.body.username,
            Address: req.body.Address,
            tin: req.body.TIN,
            gmail: req.body.email, 
            adhaarNumber: req.body.Adhaar,
            about: req.body.self,
          }};
      }
      var query = { ID: ID};
      var options = { upsert: true };
      information.updateOne(query, update, options, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
      res.redirect("/");
    }
    else{
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login");
  }
});

app.post('/video-call', (req, res) => {
  if(req.isAuthenticated()){
    const room_url = 'https://localhost:4000/' + ROOM_ID
    res.redirect(room_url)
  }  
});

app.get('/activities', function(req, res) {

  if(req.isAuthenticated()){
    const activityId = req.query.activityId;
    res.render('activity', { activityId : activityId, page : 3, loggedIn : 1 })
  }
  else {
    res.redirect("/login");
  }
 
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
  console.log("Go to http://localhost:3000")
});
