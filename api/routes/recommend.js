const spawn     = require('child_process').spawn,
      response  = require('../helper').response,
      passport  = require('../passport'),
      db        = require('../db');

module.exports = (router) => {
  const recommendsRoute = router.route('/recommend');

  recommendsRoute.get(passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const { user } = req;
      let sql = ` SELECT sc.class_id
                  FROM schedule_classes sc, schedules s
                  WHERE sc.schedule_id = s.id AND s.user_id = 1;`;
      const query = {
        text: sql,
        // values: [user],
        rowMode: 'array'
      };
      (async () => {
        const { rows } = await db.query(query);
        const arr = [...rows]
        const pyProg = spawn('python', ['bagOfWords.py', `${arr}`]);
        let result = '';

        pyProg.stdout.on('data', (ret) => {
          result += ret.toString();
          // console.log(result)
        })

        pyProg.stdout.on('end', async () => {
            const recs = JSON.parse(result);
            sql = ` SELECT subject, course_num, title, MIN(id) as id
                    FROM classes
                    WHERE id = ANY($1::int[])
                    GROUP BY subject, course_num, title
                    ORDER BY subject, course_num, title;`;
            const rows1 = await db.query(sql, [recs.fa19])
            const rows2 = await db.query(sql, [recs.sp19])
            const ret = {
              fa19: rows1.rows,
              sp19: rows2.rows
            }
            response(res, ret);
        })
        
        pyProg.stderr.on('data', (data) => {
          response(res, null, 500)
        })
  
        // pyProg.on('close', (code) => {
        //   console.log(`child process exited with code ${code}`);
        // })
      })().catch(e => {console.log(e); response(res, null, 500)})
    }
  )

  const recommendRoute = router.route('/recommend/:id');

  recommendRoute.get((req, res) => {
    const pyProg = spawn('python', ['bagOfWords.py', `${req.params.id}`]);
    let result = '';

    pyProg.stdout.on('data', (ret) => {
      result += ret.toString();
    })

    pyProg.stdout.on('end', async () => {
        const recs = JSON.parse(result);
        sql = ` SELECT subject, course_num, title, MIN(id) as id
                FROM classes
                WHERE id = ANY($1::int[])
                GROUP BY subject, course_num, title
                ORDER BY subject, course_num, title;`;
        const rows1 = await db.query(sql, [recs.fa19])
        const rows2 = await db.query(sql, [recs.sp19])
        const ret = {
          fa19: rows1.rows,
          sp19: rows2.rows
        }
        response(res, ret);
    })
    
    pyProg.stderr.on('data', (data) => {
      response(res, null, 500)
    })

    // pyProg.on('close', (code) => {
    //   console.log(`child process exited with code ${code}`);
    // })
  })

  return router;
}