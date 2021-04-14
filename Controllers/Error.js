exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        title: 'pageNotFound', 
    });
};

exports.get500 = (error,req, res, next) => {
    res.status(500).render('500', { 
        title: 'Server Error', 
    });
};