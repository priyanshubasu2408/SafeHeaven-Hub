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

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.get("/public/login.html", (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
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

        res.redirect('/public/index.html'); // Redirect to index.html upon successful registration
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/public/login', bodyParser.urlencoded({ extended: false }), async (req,res)=>{
    const email1=req.body.email;
    const password1 = req.body.password;
    
    console.log("Username:", email1);
    console.log("Password:", password1);

    User.findOne({ email:email1, password:password1 })
        .then(newUser => {
            if (newUser) {
                res.redirect('/public/index.html');
            } else {
                res.status(401).send('Invalid username or password');
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        });
})

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
