import csv
import requests
import xml.etree.ElementTree as ET
import time
import sys
import psycopg2

baseURL = 'https://courses.illinois.edu/cisapp/explorer/schedule'
tenMin = 10 * 60


def getCourses():
    with open('classes.csv', 'r') as f:
        rd = csv.reader(f)
        classes = list(rd)
    # year,semester,subject,course,courseName,description,crn,section,credits,status
    print(type(classes[1]))
    classesfall2019 = [[x[2], x[3], x[6]] for x in classes if x[0] == '2019' and x[1] == "fall"]

    with open('classes2019.csv', 'w') as f:
        wr = csv.writer(f)
        wr.writerows(classesfall2019)

def crawl(file):
    with open(file, 'r') as f:
        rd = csv.reader(f)
        classes = list(rd)
    classes = [tuple(x) for x in classes]
    removed = set()
    #print(len(classes))
    conn = psycopg2.connect(host="postgres", dbname="mytestdb", user="testusr", password="password")
    cur = conn.cursor()
    year = 2019
    semester = 'FA'

    # comment this out after node image done
    cur.execute("UPDATE classes SET status=%s WHERE year=%s AND semester=%s;", ('bleh', year, semester))
    conn.commit()
    ##############
    while True:
        start = time.time()
        for idx, val in enumerate(classes):
            subject, course, crn = val
            if val not in removed:
                URL = f'{baseURL}/{year}/fall/{subject}/{course}/{crn}.xml'

                page = requests.get(URL)
                page.raw.decode_content = True
                if page.status_code != 200:
                    #print(f'{page}\n{URL}, error')
                    removed.add((subject, course, crn))
                else:
                    tree = ET.fromstring(page.content)
                    statusElem = tree.find('enrollmentStatus')
                    status = statusElem.text if statusElem != None else None

                    cur.execute("UPDATE classes SET status=%s WHERE year=%s AND semester=%s AND crn=%s;", (status, year, semester, crn))

                    conn.commit()

        #print(f'time elapsed: {time.time() - start}')
        for item in removed:
            classes.remove(item)
        removed = set()
        elapsed = time.time() - start

        # sleep for difference between ten minutes and elapsed
        # if process took more than 10 min, then sleep for 1 minute
        sleep = tenMin - elapsed if elapsed < tenMin else tenMin/10

        # whole thing takes around 5 - 6 minutes
        time.sleep(sleep) # sleep for 5 minutes

def main(argv):
    #getCourses()
    crawl(argv[1])

if __name__ == "__main__":
    main(sys.argv)