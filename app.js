const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
var session = require('express-session');
var crypto = require('crypto');
app.use(session({ secret: 'kjvznevjn', cookie: { maxAge: 60000 }}))

app.use(express.urlencoded({ extended: true }));
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'monsite',
    debug    :  false
});


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/about", (req, res) => {
  res.render("about", { title: "A propos", message: "Page a propos de ce site" });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/connect", (req, res) => {
  if(req.session.views <= 1) {
    res.render("connect");
  } else {
    res.redirect('/login');
  }
 
});

router.post("/login", (req, res) => {
  let request= "SELECT * FROM site_user where name= ? and password= ?"
  result = crypto.createHash('md5').update(req.body.psw).digest("hex");
  pool.query(request, [req.body.uname, result],(err, data) => {
    if(err) {
      console.error(err);
      res.render("login", {errorMessage:"Erreur interne, reassayer ultérieurement..."});
      return;
    }
    if( data.length > 0){
    	if (req.session.views) {
		    req.session.views++
        res.redirect('/connect');
		} else {
		    req.session.views = 1
        res.redirect('/connect');
		}
    }else{
      res.render("login", {errorMessage:"nom d'utilisateur ou mot de pass incorrect"});
    }
  });
});

app.use("/", router);
app.listen(process.env.port || 3000, '0.0.0.0');

console.log("Running at Port 3000");