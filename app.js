var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    app = express();


// == App Configuration Start ==


// Mongo Connection 
// Enter Correct <password>
mongoose.connect('mongodb+srv://admin:admin@cluster0-yiufi.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})


// Passport Serialization Statements.
passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((obj,done)=>{
    done(null,obj);
});

// Express Session Inititalization.
app.use(require("express-session")({
    secret: 'i am root',
    resave: true,
    saveUninitialized: true
}));

// Passport Configuration.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Misc. Configuration
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// == App Configuration End ==

// == Production Routes Start ==

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    if(req.user != null) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
        today = yyyy+'-'+mm+'-'+dd;
        console.log(today)
        res.render('home', {user: req.user, today: today})
    } else {
        res.redirect('login')
    }

});

app.post('/make_appointment', (req, res) => {
    // TODO: Implement interaction between the scheduling form and the scheduling backend. 
    // Should adhere to the admin's schedule. 
})

app.get('/admin', (req, res) => {
    // render admin login page
    if(req.user == null) {
        res.redirect('/')
    } else {
        if(req.user.admin){
            res.render('admin')
        } else {
            res.redirect('/')
        }
    }
}) 

// == Production Routes End ==

// == Authorization Routes Start ==

// Checks if there is user logged in. If no, render signup form. If yes, redirect to home.
app.get('/signup', (req, res) => {
    if(req.user == null){
        return res.render('signup', {user: req.user});
    } else { res.redirect('/') }
})

app.post('/signup', (req, res) => {
    var newUser = new User(
        {
            username: req.body.username, 
            email: req.body.email,
        });
    User.register(newUser, req.body.password ,(err, user) => {
        if(err){
            console.log(err);
            return res.render('signup', {user: req.user});
        }
        passport.authenticate('local')(req, res, ()=> {
            res.redirect('/');
        });
    });
});

// Checks if there is user logged in. If no, render login form. If yes, redirect to home.
app.get('/login', (req, res) => {
    if(req.user == null){
        return res.render('login', {user: req.user})
    } else { res.redirect('/') }
})

app.post('/login', passport.authenticate('local',{successRedirect: "/", failureRedirect: "/failed"}),
  function(req, res, next){
});

// Logs user out then redirects to home page.
app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})


// == Authorization Routes End ==

// == Test Route Start ==

app.get('/test', (req, res) => {
    res.send('Test text');
});

// == Test Route End ==

var port = 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})