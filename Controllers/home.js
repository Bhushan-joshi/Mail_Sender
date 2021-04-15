const User=require('../Models/User')
exports.getHome=(req,res)=>{
	res.render('home', {
		title: "Home",
		Email:req.user.Email
	});
}

exports.postFile=(req,res)=>{
	const file=req.file;
	if(!file){
        return res.redirect('/admin/add-product');
    }
    const imageURL=req.file.path;
	User.findOne({_id:req.user._id}).then(user=>{
		const filesarray=[...user.Files];
		filesarray.push(imageURL);
		user.Files=filesarray
		user.save().then(()=>{
			res.redirect('/');
		})
	})
}