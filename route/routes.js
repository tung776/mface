module.exports = function(app, passport , obj){
    var routeAdmin = require('./admin.js');
    routeAdmin(app, passport , obj);			
    var routeFront = require('./front.js');
    routeFront(app, passport, obj);	
    app.get('*', (req, res)=>{ res.status(404).send('không tìm thấy trang'); });
}