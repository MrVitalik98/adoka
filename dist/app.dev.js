"use strict";

var express = require('express');

var path = require('path');

var exphbs = require('express-handlebars');

var csrf = require('csurf');

var flash = require('connect-flash');

var helmet = require('helmet');

var compression = require('compression');

var mongoose = require('mongoose');

var session = require('express-session');

var MongoStore = require('connect-mongodb-session')(session);

var handlebars = require('handlebars');

var _require = require('@handlebars/allow-prototype-access'),
    allowInsecurePrototypeAccess = _require.allowInsecurePrototypeAccess;

var homeRoutes = require('./routes/home');

var coursesRoutes = require('./routes/courses');

var authRoutes = require('./routes/auth');

var accountRoutes = require('./routes/account');

var cartRoutes = require('./routes/cart');

var ordersRoutes = require('./routes/orders');

var addRoutes = require('./routes/add');

var editRoutes = require('./routes/edit');

var settingsRoutes = require('./routes/settings');

var sessionMiddleware = require('./middleware/session');

var userMiddleware = require('./middleware/user');

var error404 = require('./middleware/404');

var fileMiddleware = require('./middleware/file');

var keys = require('./keys');

var app = express();
var store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGO_URI
});
app.use(express["static"](path.join(__dirname, '/public')));
app.use(express["static"](path.join(__dirname, 'images'))); // app.use('../',express.static(path.join(__dirname,'images')));

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.set('view engine', 'hbs');
app.set('views', 'hbs');
app.engine('hbs', exphbs({
  layoutsDir: 'hbs/layouts',
  defaultLayout: 'layout',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(handlebars)
}));
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(fileMiddleware.single('avatar'));
app.use(flash());
app.use(csrf());
app.use(helmet());
app.use(compression());
app.use(sessionMiddleware);
app.use(userMiddleware);
app.use('/auth', authRoutes);
app.use('/courses', coursesRoutes);
app.use('/account', accountRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/add', addRoutes);
app.use('/edit', editRoutes);
app.use('/settings', settingsRoutes);
app.use('/', homeRoutes);
app.use(error404);
var PORT = process.env.PORT || 3000;

function start() {
  return regeneratorRuntime.async(function start$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(mongoose.connect(keys.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
          }));

        case 2:
          app.listen(PORT, function () {
            console.log('Server has been started...');
          });

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}

start();