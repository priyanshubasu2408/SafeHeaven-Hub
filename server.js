const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); // Import path for file operations
require('dotenv').config();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public')); 
app.use(express.static('public/assets')); 
app.use(express.static('public/assets/js')); 
app.use(express.static('public/assets/css')); 
app.use(express.static('public/assets/images')); 


const PORT = process.env.PORT;
const mongourl = process.env.MONGO_URL;

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


// routes 

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get("/signin", (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + '/public/about.html');
});

app.get("/contact", (req, res) => {
    res.sendFile(__dirname + '/public/contact.html');
});

app.get("/404", (req, res) => {
    res.sendFile(__dirname + '/public/404.html');
});

app.use((req, res, next) => {
    res.redirect('/');
});



mongoose.connect(mongourl)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    filePath: {
        type: String
    }
});

const User = mongoose.model('User', userSchema);

app.post('/register', upload.single('file'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const file = req.file;

        const newUser = new User({ name, email, password });
        
        if (file) {
            newUser.filePath = file.path;
        }

        await newUser.save();

        res.redirect('/signin'); 
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            // Redirect to the home page upon successful login
            res.redirect('/');
        } else {
            // If no user found, redirect to the login page with an error message
            res.redirect('/404');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
