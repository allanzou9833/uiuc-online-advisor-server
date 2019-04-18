const db       = require('../db'),
      response = require('../helper').response;
    
module.exports = (router) => {
  const classesRoute = router.route('/classes');

  classesRoute.get((req, res) => {
    let sql;
    if(req.query.unique){
      sql = ` SELECT  c.subject, c.course_num, c.title, MIN(c.id) as id
              FROM    classes c, 
                      (SELECT DISTINCT subject, course_num, title 
                      FROM classes ORDER BY subject, course_num, title) a
              WHERE c.subject = a.subject 
                AND c.course_num = a.course_num 
                AND c.title = a.title
              GROUP BY c.subject, c.course_num, c.title
              ORDER BY c.subject, c.course_num, c.title;`;
    }
    else {
      sql = ` SELECT  subject, 
                      course_num, 
                      MIN(id) as id,
                      title,
                      semester,
                      year
              FROM  classes
              GROUP BY subject, course_num, title, semester, year
              ORDER BY year DESC, semester, subject, course_num, title;`;
    }
    (async () => {
      const { rows } = await db.query(sql);
      // let str = JSON.stringify(rows).replace(/\"abbr\":/g, "\"dept\":");
      // const json = JSON.parse(str);
      response(res, rows);
    })().catch(e => response(res, null, 500))

    const classRoute = router.route('/classes/:id');

    classRoute.get((req, res) => {
      const sql = ` SELECT  subject,
                            course_num,
                            title,
                            description,
                            status
                    FROM classes
                    WHERE id = $1;`;
      (async () => {
        const { rows } = await db.query(sql, [req.params.id])
        response(res, rows[0]);
      })().catch(e => response(res, null, 500))
    })
  })

  return router;
}