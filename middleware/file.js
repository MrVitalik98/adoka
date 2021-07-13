const multer = require('multer');

const storage = multer.memoryStorage({
   destination(req, file, cb){
      cb(null, '');
   },
   // filename(req, file, cb){
   //    cb(null, new Date().toISOString() + file.originalname);
   // }
})

const imagesTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
   if(imagesTypes.includes(file.mimetype)){
      cb(null, true);
   }else{
      cb(null, false);
   }
}

module.exports = multer({
   storage, fileFilter,
   limits:{
      fileSize: 1024 * 1024 * 3
   }
})


