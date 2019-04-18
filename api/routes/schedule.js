const db        = require('../db'),
      passport  = require('../passport'),
      response  = require('../helper').response;

async function processSchedules(rows, plural=true) {
  let ret;
  if(plural){
    ret = [];
    for(const obj of rows){
      const s = await ret.findIndex(e => e.id === obj.schedule_id)
      if(s === -1) {
        ret.push({
          'id': obj.schedule_id,
          'name': obj.name,
          'classes': [{
            'class_id': obj.class_id,
            'course_num': obj.course_num,
            'subject': obj.subject
          }]
        })
      }
      else {
        ret[s].classes.push({
          'class_id': obj.class_id,
          'course_num': obj.course_num,
          'subject': obj.subject
        })
      }
    }
  }
  else {
    ret = false
    for(const obj of rows){
      if(!ret) {
        ret = {
          'id': obj.schedule_id,
          'name': obj.name,
          'classes': [obj.class_id]
        }
      }
      else {
        ret.classes.push(obj.class_id)
      }
    }
  }
  return ret;
}
    
module.exports = (router) => {
  const schedulesRoute = router.route('/schedules');

  schedulesRoute.get(passport.authenticate('jwt', {session: false}), 
    (req, res) => {
      const { user } = req;
      const sql = ` SELECT  sc.schedule_id, 
                            schedules.name, 
                            sc.class_id, 
                            classes.subject,
                            classes.course_num 
                    FROM    schedule_classes AS sc 
                    INNER JOIN schedules 
                      ON sc.schedule_id = schedules.id 
                    INNER JOIN classes 
                      ON sc.class_id = classes.id 
                    WHERE sc.schedule_id 
                      IN (
                        SELECT id 
                        FROM schedules 
                        WHERE user_id=$1);`;
      (async () => {
        const { rows } = await db.query(sql, [user]);
        const schedules = await processSchedules(rows);
        response(res, schedules);
      })().catch(e => {console.log(e);response(res, null, 500)})
    }
  )

  schedulesRoute.post(passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const { name, classes } = req.body;
      const { user } = req;
      let sql = ` INSERT INTO schedules (name, user_id) 
                    VALUES ($1, $2) 
                    RETURNING id;`;
      (async () => {
        const { rows } = await db.query(sql, [name, user]);
        const schedule_id = rows[0].id;
        for(const id of classes){
          sql = ` INSERT INTO schedule_classes (schedule_id, class_id) 
                  VALUES ($1, $2);`;
          await db.query(sql, [schedule_id, id]);
        }
        response(res, undefined, 201);
      })().catch(e => {console.log(e);response(res, null, 500)})
    }
  )

  const scheduleRoute = router.route('/schedules/:id');
  // TODO: Check schedule belongs to user
  scheduleRoute.get(passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const sql = ` SELECT  sc.schedule_id, 
                            schedules.name, 
                            sc.class_id
                    FROM    schedule_classes AS sc
                    INNER JOIN schedules 
                      ON sc.schedule_id = schedules.id
                    INNER JOIN classes 
                      ON sc.class_id = classes.id
                    WHERE sc.schedule_id = $1;`;
      (async () => {
        const { rows } = await db.query(sql, [req.params.id]);
        const schedule = await processSchedules(rows, false);
        response(res, schedule);
      })().catch(e => response(res, null, 500))
    }
  )

  scheduleRoute.put(passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const { name, classes } = req.body;

      let sql = 'DELETE FROM schedule_classes WHERE schedule_id=$1;';
      (async () => {
        await db.query(sql, [req.params.id]);

        for(const id of classes){
          sql = ` INSERT INTO schedule_classes (schedule_id, class_id) 
                  VALUES ($1, $2);`;
          await db.query(sql, [req.params.id, id]);
        }

        sql = 'UPDATE schedules SET name=$1 WHERE id=$2;';
        await db.query(sql, [name, req.params.id]);

        response(res, null);
      })().catch(e => response(res, null, 500))
    }
  )

  scheduleRoute.delete(passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const sql = 'DELETE FROM schedules WHERE id=$1;';
      (async () => {
        await db.query(sql, [req.params.id]);
        response(res, null);
      })().catch(e => response(res, null, 500))
    }
  )
  return router;
}