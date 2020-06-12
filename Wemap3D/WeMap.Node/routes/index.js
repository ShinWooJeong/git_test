
/*
 * GET home page.
 */

exports.index = function(req, res) {

	console.log('------------init      req.session-----------' );
	console.log(req.session);

	console.log('------------init     req.cookies-----------' );
	console.log(req.cookies);
	console.log('res.render  index.jade');
	res.render('index', { title: 'Express' });
};
