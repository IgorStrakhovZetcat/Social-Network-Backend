import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation, commentCreateValidation } from './validations.js';
import {checkAuth, handleValidationErrors} from './utils/index.js';
import {PostController, UserController, CommentController, FriendsController} from './controllers/index.js'
import { MONGODB_URL } from './mongoDB/url.js';



mongoose.connect(MONGODB_URL)
.then(() => console.log('DB ok'))
.catch((err) => console.log('DB error', err))

const app = express();

  
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    },
})


const upload = multer({ storage }).single('image')

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.get('/auth/me', checkAuth, UserController.getMe)
app.get('/users', checkAuth, UserController.getAll)

app.post('/upload/avatar', upload, (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.post('/upload', checkAuth, upload, (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
})

app.get('/tags', PostController.getLastTags)

app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)


app.get('/comments', CommentController.getAll)
app.post('/comments', checkAuth, commentCreateValidation, handleValidationErrors, CommentController.create)
app.patch('/comments/:id', checkAuth, commentCreateValidation, handleValidationErrors, CommentController.update)
app.delete('/comments/:id', checkAuth, CommentController.remove)

app.post('/friends', checkAuth, FriendsController.create)
app.get('/friends', checkAuth, FriendsController.getAll)
app.patch('/friends/:id', checkAuth, FriendsController.addFriend)

app.listen(4444, (err) => {
    if(err){
        return console.log(err)
    }
    console.log('Servre ok')
});


