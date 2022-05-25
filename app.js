if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
   }
   const express = require('express');
   const path = require('path');
   const mongoose = require('mongoose');
   const ejsMate = require('ejs-mate');
   const session = require('express-session');
   const flash = require('connect-flash');
   const joi = require('joi');
   
   const ExpressError = require('./utils/ExpressError')
   const methodOverride = require('method-override');
   const passport = require('passport');
   const LocalStrategy = require('passport-local');
   const User = require('./models/user');
   const helmet = require('helmet');
   const Campground = require('./models/campgrounds');
   const Review = require('./models/review')
   //const Joi = require('joi');
   
   const mongoSanitize = require('express-mongo-sanitize');
   
   const userRoutes = require('./routes/users');
   const campgroundRoutes = require('./routes/campgrounds');
   const reviewRoutes = require('./routes/reviews');
   //const dbUrl = process.env.DB_URL;
   
   mongoose.connect('mongodb://localhost:27017/yelp-camp', {
       useNewUrlParser : true,
       useUnifiedTopology : true,
       
   });
   
   const db = mongoose.connection;
   db.on('error',console.error.bind(console,'connection error:'))
   db.once('open',() =>{
       console.log('Database Connected');
   });
   
   const app = express();
   
   app.engine('ejs',ejsMate);
   app.set('view engine','ejs');
   app.set('views',path.join(__dirname,'views'))
   app.use(express.urlencoded({extended:true}))
   app.use(methodOverride('_method'));
   app.use(express.static(path.join(__dirname,'public')));
   app.use(mongoSanitize());
   const sessionConfig = {
   name:'session',    
   secret:'thisshouldbeabettersecret!',
   resave:false,
   saveUninitialized:true,
   cookie:{
       httpOnly: true,
       expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
       maxAge: 1000 * 60 * 60 * 24 * 7,
   }
   }

   app.use(session(sessionConfig))
   app.use(flash())
  //app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js',
    'https://res.cloudinary.com/dn8qjgpkk/',
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
   ' https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
   'https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css',
   'https://res.cloudinary.com/dn8qjgpkk/',
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    'https://res.cloudinary.com/dn8qjgpkk/',
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dn8qjgpkk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ['https://res.cloudinary.com/dn8qjgpkk/'],
            childSrc:['blob:'],
        },
    })
);
   app.use(passport.initialize());
   app.use(passport.session());
   passport.use(new LocalStrategy(User.authenticate()));
   
   passport.serializeUser(User.serializeUser());
   passport.deserializeUser(User.deserializeUser());
   
   app.use((req,res,next)=>{
       res.locals.currentUser = req.user;
      res.locals.success = req.flash('success');
      res.locals.error = req.flash('error');
      next();
   })
   
   app.get('/fakeUser',async(req,res)=>{
       const user = new User({email:'sujay@gmail.com',username:'sujayy'})
       const newUser = await User.register(user,'chicken');
       res.send(newUser);
   })
   app.use('/',userRoutes)
   app.use('/campgrounds',campgroundRoutes)
   app.use('/campgrounds/:id/reviews',reviewRoutes)
   app.get('/',(req,res)=>{
       res.render('campgrounds/home');
   })

//copyied till 148
   app.get('/results', async(req, res) =>{
    const {search_query} = req.query
    const campgrounds = await Campground.find( {title: {$regex: search_query, $options: "i"} })
    res.render('search', {campgrounds, search_query})
})
   
   
   app.all('*',(req,res,next)=>{
       next(new ExpressError('Page not Found',404))
   })
   app.use((err,req,res,next)=>{
       const {statusCode = 500,message = 'something went wrong'} = err;
       res.status(statusCode).render('campgrounds/error',{err});
       
   })
   app.listen('3000',()=>{console.log("Listening on port 3000");})