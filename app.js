const express = require('express');
const path = require('path');
const morgan = require('morgan')
const exphbs = require('express-handlebars');
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const cookieParser = require('cookie-parser')
const compression = require('compression');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const sessionMiddleware = require('./middleware/session');
const userMiddleware = require('./middleware/user');
const error404 = require('./middleware/404');
const fileMiddleware = require('./middleware/file');
const Chat = require('./models/chat');
const http = require('http')
const app = express();

const server = http.Server(app)

const io = require('socket.io')(server);


require('dotenv').config()


const store = new MongoStore({
    collection:'sessions',
    uri:process.env.MONGO_URI
})


io.on('connection', socket => {
    socket.on('send_message', async data => {
        socket.join(data.chatId)

        let chat = await Chat.findById(data.chatId);
        await chat.addMessage(data.userId, data.message, new Date());
        let message = await chat.findMessageID(data.userId);

        io.to(data.chatId).emit('send_message', {...data, messageID: message._id});
    })

    socket.on('delete_message', async data => {
        socket.join(data.chatId);

        let chat = await Chat.findById(data.chatId);
        await chat.deleteMessage(data.messageID);

        io.to(data.chatId).emit('delete_message', data);
    })
})


app.use(express.json());
app.use(morgan('dev'))
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static(path.join(__dirname,'images')));


app.set('view engine', 'hbs');
app.set('views', 'hbs');
app.engine('hbs', exphbs({
    layoutsDir:'hbs/layouts',
    defaultLayout:'layout',
    extname:'hbs',
    handlebars:allowInsecurePrototypeAccess(handlebars)
}));


app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    store
}))


app.use(fileMiddleware.single('avatar'));
app.use(flash());
app.use(cookieParser());
app.use(csrf());
app.use(helmet());
app.use(compression());
app.use(sessionMiddleware);
app.use(userMiddleware);


app.use('/auth', require('./routes/auth'));
app.use('/courses', require('./routes/courses'));
app.use('/myaccount', require('./routes/myaccount'));
app.use('/account', require('./routes/account'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/add', require('./routes/add'));
app.use('/edit', require('./routes/edit'));
app.use('/chats', require('./routes/chat'));
app.use('/chatroom', require('./routes/chatroom'));
app.use('/settings', require('./routes/settings'));
app.use('/', require('./routes/home'));
app.use(error404);


const PORT = process.env.PORT || 8080;

async function start(){
    mongoose.connect(process.env.MONGO_URI)

    server.listen(PORT, () => {
        console.log(`Server has been running on port ${PORT}`);
    })
}

start();
