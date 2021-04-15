const Router=require('express').Router();
const homeController=require('../Controllers/home')
const isAuth=require('../util/isAuth')

Router.get('/',isAuth,homeController.getHome);
Router.post('/upload',homeController.postFile);


module.exports=Router;