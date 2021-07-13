const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');
const myAccountRoutes = require('./routes/myaccount');
const accountRoutes = require('./routes/account');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const addRoutes = require('./routes/add');
const editRoutes = require('./routes/edit');
const settingsRoutes = require('./routes/settings');
const chatRoutes = require('./routes/chat');
const chatroomRoutes = require('./routes/chatroom');
const sessionMiddleware = require('./middleware/session');
const userMiddleware = require('./middleware/user');
const error404 = require('./middleware/404');
const fileMiddleware = require('./middleware/file');
const Chat = require('./models/chat');
const keys = require('./keys');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const store = new MongoStore({
    collection:'sessions',
    uri:keys.MONGO_URI
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



        // socket.on('disconnect', () => {
        //     console.log('disconnect user');
        // })
    })




app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static(path.join(__dirname,'images')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.set('view engine', 'hbs');
app.set('views', 'hbs');
app.engine('hbs', exphbs({
    layoutsDir:'hbs/layouts',
    defaultLayout:'layout',
    extname:'hbs',
    handlebars:allowInsecurePrototypeAccess(handlebars)
}));




app.use(session({
    secret:keys.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    store
}))


app.use(fileMiddleware.single('avatar'));
app.use(flash());
app.use(csrf());
app.use(helmet());
app.use(compression());
app.use(sessionMiddleware);
app.use(userMiddleware);



app.use('/auth', authRoutes);
app.use('/courses', coursesRoutes);
app.use('/myaccount', myAccountRoutes);
app.use('/account', accountRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/add', addRoutes);
app.use('/edit', editRoutes);
app.use('/chats', chatRoutes);
app.use('/chatroom', chatroomRoutes);
app.use('/settings', settingsRoutes);
app.use('/', homeRoutes);
app.use(error404);


const PORT = process.env.PORT || 3000;

async function start(){
    await mongoose.connect(keys.MONGO_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useFindAndModify:false
    })

    http.listen(PORT, () => {
        console.log('Server has been started...');
    })
}

start();
