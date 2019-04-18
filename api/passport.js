const passport      = require('passport'),
      localStrategy = require('passport-local').Strategy,
      passportJWT   = require('passport-jwt'),
      bcrypt				= require('bcrypt'),
      db            = require('./db');

const jwtStrategy   = passportJWT.Strategy,
      ExtractJWT    = passportJWT.ExtractJwt;

passport.use('local-signup', new localStrategy({ passReqToCallback: true },
  (req, username, password, done) => {
    let newUser = { 
      username: username,
      name: req.body.name,
      pw_hash: ''
    };
    
    (async () => {
      newUser.pw_hash = await bcrypt.hash(password, 10);
      
      const sql = ` INSERT INTO users (name, username, pw_hash) 
                    VALUES ($1, $2, $3)
                    RETURNING id, username, name;`;
      const { rows } = await db.query(sql, [newUser.name, newUser.username, newUser.pw_hash]);
      
      return done(null, rows[0]);
    })().catch(err => done(err))
  }
))

passport.use(new localStrategy(
  (username, password, done) => {
    (async () => {
      const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if(await bcrypt.compare(password, rows[0].pw_hash)){
        const { id, username, name } = rows[0]
        const user = { id, username, name }
        return done(null, user);
      }
      else  
        return done(null, false);

    })().catch(err => done(err))
  }
))

passport.use(new jwtStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, 
  async (jwtPayload, done) => {
    try {
      return done(null, jwtPayload.id)
    }
    catch(err){
      return done(err)
    }
  }
))

module.exports = passport;