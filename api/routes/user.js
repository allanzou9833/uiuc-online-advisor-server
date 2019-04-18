const db       = require('../db'),
      response = require('../helper').response;

module.exports = (router) => {
  const userRoute = router.route('/user/:id');

  userRoute.get((req, res) => {
    const sql = 'SELECT username, name FROM users WHERE id = $1;';

    (async () => {
      const { rows } = await db.query(sql, [req.params.id]);
      response(res, rows[0]);
    })().catch(err => response(res, null, 500))
  })

  return router;
}