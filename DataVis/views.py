from django.views.generic import TemplateView
import pandas as pd
import os
from django.http import HttpResponse
import json

pie_chart_data_csv = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "data/dateFiltered.csv")
)
df_result = pd.read_csv(pie_chart_data_csv, parse_dates=['questionPostDate'])

questions_by_topic = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "data/questionsByTopic.txt")
)
df_questions = json.load(open(questions_by_topic))


print("done..")

class MainPageView(TemplateView):
    template_name = 'webmddashboard.html'

def pie_chart_data(request):

    if "start_date" not in request.GET:
        start_date = '2010-03-25'
    else:
        start_date = request.GET["start_date"]

    if "end_date" not in request.GET:
        end_date = '2014-12-10'
    else:
        end_date = request.GET["end_date"]

    print(start_date, end_date)
    mask = (df_result['questionPostDate'] > start_date) & (df_result['questionPostDate'] <= end_date)
    df_r = pd.DataFrame(df_result[mask].groupby(['topicName']).sum().reset_index())
    df_r = df_r[['topicName', '0']]
    df_r = df_r.sort_values(by=['0'], ascending=False)[:10]
    result = []
    for i in range(len(df_r)):
        d = {}
        obj = df_r.iloc[i]
        d["topic"] = str(obj.topicName)
        d["topicCount"] = int(obj['0'])

        """
        "topic": "Weight",
        "topicCount": 357
        """

        result.append(d)
    return HttpResponse(json.dumps(result), content_type='json')


def get_questions_by_topic(request):
    topicId = request.GET["topicId"]
    result = df_questions[topicId]
    return HttpResponse(json.dumps(result), content_type='json')