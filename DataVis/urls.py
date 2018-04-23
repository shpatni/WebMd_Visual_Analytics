"""DataVis URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from DataVis.views import MainPageView, pie_chart_data, get_questions_by_topic

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', MainPageView.as_view()),
    url(r'^pie_chart_data/$', pie_chart_data, name='pie_chart', ),
    url(r'^questionsByTopic/$', get_questions_by_topic, name='questionsByTopic', ),
]
