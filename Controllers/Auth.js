const User = require('../Models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.getLogin = (req, res) => {
	res.render('auth/login', {
		title: "Login"
	});
}

exports.getRegister = (req, res) => {
	res.render('auth/register', {
		title: "Register"
	});
}

exports.postRegister = (req, res) => {
	const { Email, password, password2 } = req.body;
	User.findOne({ Email: Email }).then(user => {
		if (user) {
			return res.redirect('/auth/register/');
		}
		if (password !== password2) {
			return res.redirect('/auth/register/');
		}
		const auth = crypto.randomBytes(32).toString('hex');
		const salt = crypto.randomBytes(32).toString('hex');
		const hash = crypto.pbkdf2Sync(password, salt, 10, 32, 'sha256').toString('hex');
		const newUser = new User({
			Email: Email,
			salt: salt,
			hash: hash,
			activationToken: auth,
			activationTokenCreatedOn: (Date.now() + 300000).toString(),
		})
		newUser.save().then(() => {
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.email,
					pass: process.env.pass,
				},
			});

			transporter.sendMail({
				from: process.env.email,
				to: Email,
				subject: "Account Activation",
				html: `Please follow following link to activate your account <br>
					127.0.0.1:3000/activate/${auth}`
			}).then(() => {
				console.log('mail send');
				res.redirect('http://127.0.0.1:3000/signin')
			}).catch((error) => {
				console.log(error);
			})
		})
	})

}
exports.postLogin = (req, res) => {
	const { Email, password } = req.body;
	User.findOne({ Email: Email })
		.then(user => {
			if (!user.activated) {
				res.redirect('/auth/login')
			}
			const salt = user.salt;
			const hash = crypto.pbkdf2Sync(password, salt, 10, 32, 'sha256').toString('hex');
			if (hash === user.hash) {
				req.session.user = user;
				req.session.isLoggedin = true;
				req.session.save(err => {
					res.redirect('/');
				});
			} else {
				res.redirect('/auth/login');
			}
		})
}

exports.ActivateAccount = (req, res) => {
	const token = req.params.id;
	User.findOne({ activationToken: token }).then(user => {
		if (user.activationTokenCreatedOn > Date.now().toString()) {
			user.activated = true;
			user.activationToken = undefined;
			user.activationTokenCreatedOn = undefined;
		} else {
			user.activationTokenCreatedOn = undefined;
			user.activationToken = undefined;
			user.activate = false;
		}
		user.save();
	}).catch(err => {
		console.log(err);
	})
	res.redirect('http://127.0.0.1:3000/signin')
}