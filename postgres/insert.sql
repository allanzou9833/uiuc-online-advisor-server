COPY classes(year, semester, subject, course_num, title, description, crn, status) FROM '/data/classes.csv' DELIMITER ',' CSV HEADER FORCE NOT NULL description;

-- INSERT INTO users (name, username, pw_hash) VALUES ('Allan Zou', 'azou12', 'asldkfja'), ('Chuck Wong', 'cwong29', 'q32njf2jo2fn');

-- INSERT INTO departments (name, abbr) VALUES ('Computer Science', 'CS'),('Math', 'MATH'), 
-- ('Physics', 'PHYS'), ('Electrical & Computer Engineering', 'ECE');

-- INSERT INTO requirements (id, name) VALUES (1, 'Humanities');

-- INSERT INTO majors (id, name, deptid) VALUES (1, 'CS', 1);
-- INSERT INTO classes (crn, dept_id, course_num, title, credits, semester, year)
-- VALUES (50094, 1, 173, '', 3, 'SP', 19), (65120, 1, 126, '', 3, 'SP', 19), (46060, 2, 241, '', 4, 'SP', 19), (35801, 3, 211, '', 4, 'SP', 19), 
-- (48199, 1, 461, '', 4, 'SP', 19), (32505, 4, 210, '', 4, 'SP', 19), (61629, 4, 220, '', 4, 'SP', 19);

-- INSERT INTO professors (id, deptid, firstname, lastname) VALUES (1, 1, 'Ryan', 'Bailey');

-- INSERT INTO majorRequirements (majorid, requirementid) VALUES (1, 1);

-- INSERT INTO classRequirements (classcrn, requirementid) VALUES (690274, 1);

-- INSERT INTO teaches (profid, classcrn, semester, year) VALUES (1, 690274, 'FA', 2018);
-- INSERT INTO schedules (name, user_id) VALUES ('FA19', 1), ('chucksched',2);
-- INSERT INTO schedule_classes (schedule_id, class_crn) VALUES (1, 50094), (1, 65120), (1, 46060), (1, 35801),
-- (2, 32505), (2, 61629), (2, 46060), (2, 35801);