import csv
import numpy as np
import os
import pandas as pd
import re
import sklearn
import time
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import sys
np.set_printoptions(threshold=sys.maxsize)

pd.set_option('display.max_rows', 500) #display options
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)
pd.set_option('display.max_colwidth', -1)

"""
===========
DESCRIPTION
===========
1. Reads in all of the courses descriptions
2. Converts to bag of words of all courses
3. Takes in user input of courses
4. Loops through with KNN similarity metric to find 
similar courses
"""
os.chdir(r'C:\Users\Work\Documents\CS411\Final Project\back\postgres')
data = pd.read_csv('classes.csv')
data['text'] = data['courseName'] + " " + data['description']
data_fa19 = data.loc[(data['year'] == 2019)&(data['semester'] == 'FA')]
data_sp19 = data.loc[(data['year'] == 2019)&(data['semester'] == 'SP')]

def bag_of_words(data,maxdf,mindf):
    cv = CountVectorizer(stop_words='english',max_df = maxdf,min_df = mindf,
                         preprocessor=lambda x: re.sub(r'\d+', 'NUM', x.lower()))
    fit = cv.fit(data.values.astype('U'))
    transformed = cv.transform(data.values.astype('U'))
    return transformed,cv
maxdf = 0.15
mindf = 0.0
bag_fa19,cv1 = bag_of_words(data_fa19['text'],maxdf,mindf)
bag_sp19,cv2 = bag_of_words(data_sp19['text'],maxdf,mindf)
###TESTING BAG OF WORDS###
def analyze_words(text,cv): #Function to analyze word frequencies to curate for stop words
    sum_words = text.sum(axis=0)
    words_freq = [(word, sum_words[0, idx]) for word, idx in cv.vocabulary_.items()]
    words_freq =sorted(words_freq, key = lambda x: x[1], reverse=True)
    print(words_freq[0:20])
#analyze_words(bag_fa19,cv1)
#analyze_words(bag_sp19,cv2)

def KNN(bagWords,course_desc,num): #find bag of words cosine similarity with cosine
    nb = NearestNeighbors(metric = 'cosine')
    nb.fit(bagWords)
    return nb.kneighbors(course_desc,num)

# user_index = [618,458,1475,1476,1484,1488,1517,1816,1830,1506] #Testing some interesting courses
user_index = [int(i) for i in sys.argv[1].split(',')]
# print(user_index)
user_courses = data.iloc[user_index]
user_joined = user_courses['text'].str.cat(sep=' ')
bag_user_fa19 = cv1.transform([user_joined]) 
bag_user_sp19 = cv2.transform([user_joined]) 

def recommender(all,user,index,num,term,start):
    duplicates = []
    for i in index:
        duplicates.append(str(data['subject'].iloc[i]) + str(data['course'].iloc[i]))
    recommend = []
    nearest = KNN(all,user,500)
    nbr = 0
    while len(recommend) < num:
        i = nearest[1][0][nbr]
        course = str(data['subject'].iloc[i+start]) + str(data['course'].iloc[i+start])
        if course in duplicates:
            nbr += 1
        else:
            recommend.append(i+start)
            nbr +=1
    # print('for {} here are some recommended courses:'.format(term))
    # for i in recommend:
    #     #print(data[['subject','course','description']].iloc[i+start])
    #     print(i+start)
    return recommend

recs_fa19 = recommender(bag_fa19,bag_user_fa19,user_index,20,'Fall 2019',6317) #add 6317 for fall because thats where data starts
recs_sp19 = recommender(bag_sp19,bag_user_sp19,user_index,20,'Spring 2019',0)
recs_fa19 = [int(i+1) for i in recs_fa19]
recs_sp19 = [int(i+1) for i in recs_sp19]
import json
ret = {'fa19':recs_fa19,'sp19':recs_sp19}
# print(ret)
print(json.dumps(ret))