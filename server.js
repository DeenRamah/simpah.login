if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config
}


const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('methodOverride')

const initializePassport = require('./passport-config')
const { methods } = require('expres')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id ===id)
)


const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.user(methodOverride('_method'))


app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})


app.get('/login',checknotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
app.post('/login',  checknotAuthenticated,passport.authenticate('local'),{
    successRedirect: '/',
    failureRedirect: '/login',
    failureRedirect: true
})

app.get('/register',checknotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})
app.post('/register', checknotAuthenticated,async(req, res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),//unique identifier
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')//when successfull take them to login
    }catch{
        res.redirect('/register')// direct them back tpo register if a problem occurs
    }
})


app.delete('/logout', (req, res) =>{
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticted()) {
        return next() // if the user is authenticated then continue with th process
    }

    res.redirect('/login')
}

function checknotAuthenticated(req, res, next){
    if(req.isAuthenticted()){
        return res.redirect('/')
    }
    next()
}

app.listen(3000)