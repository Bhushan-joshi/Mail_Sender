const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const checkExpire = (req) => {
	// 0 */2 * * *
	// 60000*60*2
	const baseDir = 'images'
	const moveTo = 'util/expired'
	fs.readdir(baseDir, (err, files) => {
		if (err) {
			console.log(err);
		}
		files.forEach((file, index) => {
			const fileDate = file.split('-');
			if (Date.now() - fileDate[0] >60000*60*2) {
				const f = path.basename(file)
				const dest = path.resolve(moveTo, f);
				fs.rename(`D:\\Projects\\Javascript\\web\\internship\\images\\${file}`, dest, (err) => {
					if (err) console.log(err);
					else console.log('moved');
				})
			}
		})
	})

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.email,
			pass: process.env.pass,
		},
	})
	fs.readdir('util\\expired',(err,files)=>{
		console.log(files.length);
		if(files.length<0){
			return null;
		}
		files.forEach((file,index)=>{
			if(err) console.log(err);
		else{
			transporter.sendMail({
				from: process.env.email,
				to:req.Email,
				subject: "Images after 2 hours",
				attachments:[
					{   // filename and content type is derived from path
						path: `util\\expired\\${file}`
					},
				]
			}).then(()=>{
				console.log('mail send');
				fs.unlink(`util\\expired\\${file}`,(err)=>{
					if(err)console.log(err);
					else console.log('deleted');
					return null;
				})
			})
		}
		})
	})
	

}

module.exports = checkExpire