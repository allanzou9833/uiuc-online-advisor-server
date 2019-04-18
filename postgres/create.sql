CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL ,
  username VARCHAR(100) UNIQUE NOT NULL,
  pw_hash VARCHAR(100) NOT NULL
);

-- CREATE TABLE departments (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   abbr VARCHAR(5) NOT NULL
-- );

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- CREATE TABLE classes (
--   crn INTEGER NOT NULL,
--   dept_id INTEGER REFERENCES departments(id) ON DELETE RESTRICT,
--   description VARCHAR(100)  NOT NULL,
--   course_num INTEGER  NOT NULL,
--   title VARCHAR(100)  NOT NULL,
--   semester VARCHAR(2)  NOT NULL,
--   year INTEGER  NOT NULL,
--   csv_index INTEGER PRIMARY KEY
-- );

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  semester VARCHAR(2) NOT NULL,
  subject VARCHAR(4) NOT NULL,
  course_num INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(1400) NOT NULL,
  crn INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL
);


CREATE TABLE schedule_classes (
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id),
  PRIMARY KEY(schedule_id, class_id)
);