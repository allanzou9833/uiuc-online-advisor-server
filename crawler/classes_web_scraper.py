import requests
import sys
import json
import xml.etree.ElementTree as ET
import time
import csv

baseURL = 'https://courses.illinois.edu/cisapp/explorer/schedule'
#semesters = ['spring', 'summer', 'fall', 'winter']
semesters = ['fall']

deptDct = {}
coursesDct = {}

# (year, semester, subject, course, courseName, description, crn, section, credits, status)
classes = [['year', 'semester', 'subject', 'course', 'courseName', 'description', 'crn', 'section', 'credits', 'status']]


def getYear():
    URL = baseURL + '.xml'
    page = requests.get(URL)
    page.raw.decode_content = True
    # tree = ET.parse(page.content)
    # root = tree.getroot()
    tree = ET.fromstring(page.content)
    years = []
    for child in tree.iter('calendarYear'):
        years.append(child.attrib['id'])
    return years

def getSubjects(years):
    print('Getting subjects...')
    nextURLs = []
    for year in years:
        for semester in semesters:
            if year > 2015 or (year == 2015 and (semester == 'fall' or semester == 'winter')):
                URL = f'{baseURL}/{year}/{semester}.xml'
                page = requests.get(URL)
                page.raw.decode_content = True
                if page.status_code != 200:
                    print(f'{page}\n{URL}, error')
                else:
                    tree = ET.fromstring(page.content)

                    for child in tree.iter('subject'):
                        subject = child.attrib['id']
                        subName = child.text
                        if subject not in deptDct:
                            deptDct[subject] = subName
                        #print(child.attrib['id'], child.text)
                        nextURL = child.attrib['href']
                        #print(year, semester, subject)
                        nextURLs.append((year, semester, subject))
                        #getCourses(year, semester, nextURL)

    return nextURLs

def getCourses(subjects):
    print('Getting courses...')
    nextURLs = []
    for item in subjects:
        (year, sem, sub) = item
        URL = f'{baseURL}/{year}/{sem}/{sub}.xml'

        page = requests.get(URL)
        page.raw.decode_content = True
        if page.status_code != 200:
            print(f'{page}\n{URL}, error')
        else:
            tree = ET.fromstring(page.content)
            for child in tree.iter('course'):
                course = child.attrib['id']
                courseName = child.text

                if (sub, course) in coursesDct:
                    coursesDct[(sub, course)].add(courseName)
                else:
                    coursesDct[(sub,course)] = set([courseName])

                nextURLs.append((year, sem, sub, course))
                #print(child.attrib['id'], child.text)
    return nextURLs

def getSections(courses):
    print('Getting sections...')
    total = 0
    count = 1
    start = time.time()
    for item in courses:
        (year, sem, sub, course) = item
        URL = f'{baseURL}/{year}/{sem}/{sub}/{course}.xml'

        page = requests.get(URL)
        page.raw.decode_content = True
        if page.status_code != 200:
            print(f'{page}\n{URL}, error')
        else:
            tree = ET.fromstring(page.content)

            description = tree.find('description').text if tree.find('description') != None else None

            credits = tree.find('creditHours').text if tree.find('creditHours') != None else None


            sections = []
            for child in tree.iter('section'):
                section = child.attrib['id']
                sectionName = child.text
                sections.append((section, sectionName))
                total += 1

            for s in sections:
                newURL = f'{baseURL}/{year}/{sem}/{sub}/{course}/{s[0]}.xml'
                sectionPage = requests.get(newURL)
                if sectionPage.status_code != 200:
                    print(f'{sectionPage}\n{newURL}, error {sectionPage.status_code}')
                else:
                    sectionPage.raw.decode_content = True
                    sectionTree = ET.fromstring(sectionPage.content)

                    sectionElem = sectionTree.find('meetings').find('meeting').find('type')

                    sectionType = sectionElem.text if sectionElem != None else None

                    if 'lecture' in sectionType.lower() or 'study' in sectionType.lower():
                        courseNameElem = sectionTree.find('parents').find('course')
                        statusElem = sectionTree.find('enrollmentStatus')

                        courseName = courseNameElem.text if courseNameElem != None else None
                        status = statusElem.text if statusElem != None else None

                        classes.append([year, sem, sub, course, courseName, description, s[0], s[1], credits, status])
            if total >= 100 * count:
                print(f'Currently at {year} {sem} {sub} {course}, total is {total}, time elapsed: {time.time() - start}')
                #print(year, sem, sub, course, total, time.time() - start)
                count += 1
    return total

def main(argv):
    years = [2019]#, 2018, 2017, 2016, 2015]
    start = time.time()

    # subjects = getSubjects(years)
    # print(f'Number of subjects to search: {len(subjects)}')
    # print(f'Time elapsed: {time.time() - start}')

    # courses = getCourses(subjects)
    # print(f'Number of courses to search: {len(courses)}')
    # print(f'Time elapsed: {time.time() - start}')
    # subjects.clear()

    # with open('2019fallcourses.csv', 'w') as f:
    #     wr = csv.writer(f)
    #     wr.writerows(courses)

    with open('courses.csv', 'r') as f:
    #with open('2019fallcourses.csv', 'r') as f:
        rd = csv.reader(f)
        courses = list(rd)
    print(f'Number of courses to search: {len(courses)}')
    print(f'Time elapsed: {time.time() - start}')
    sections = getSections(courses)
    print(f'Number of sections to search: {sections}')
    print(f'Time elapsed: {time.time() - start}')
    courses.clear()

    print(time.time() - start)

    with open('classes.csv', 'w') as f:
        wr = csv.writer(f)
        wr.writerows(classes)

if __name__ == "__main__":
    main(sys.argv)

