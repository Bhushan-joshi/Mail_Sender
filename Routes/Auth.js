const Router = require('express').Router();
const AuthController = require('../Controllers/Auth');

Router.get('/login',AuthController.getLogin);
Router.post('/login',AuthController.postLogin)

Router.get('/register',AuthController.getRegister);
Router.post('/register',AuthController.postRegister);

Router.get('/activate/:id',AuthController.ActivateAccount)


module.exports=Router;