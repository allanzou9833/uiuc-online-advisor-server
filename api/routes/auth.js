const jwt       = require('jsonwebtoken'),
      passport  = require('../passport')
      response = require('../helper').response;;

module.exports = (router) => {
  const loginRoute = router.route('/login');
  const registerRoute = router.route('/register');

  loginRoute.post((req, res) => {
    passport.authenticate('local', {session: false}, 
    (err, user, info) => {
      if(err || !user)
        res.status(400).json({
          message: 'Something went wrong',
          user: user
        })
      else {
        const { id, username, name } = user;
        const payload = {
          id,
          username,
          name
        }
        req.login(payload, {session: false}, (err) => {
          if(err) 
            response(res, err, 400)

          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
          response(res, { token })
        })
      }
    })(req, res);
  })

  registerRoute.post((req, res) => {
    passport.authenticate('local-signup', {session: false}, 
    (err, user, info) => {
      if(err || !user)
        res.status(400).json({
          message: 'Something went wrong',
          user: user
        });
      else {
        const { id, username, name } = user;
        const payload = {
          id,
          username,
          name
        }
        req.login(payload, {session: false}, (err) => {
          if(err)
            response(res, err, 400)

          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
          response(res, { token })
        })
      }
    })(req, res);
  })

  return router;
}