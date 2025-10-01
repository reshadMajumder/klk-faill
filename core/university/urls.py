
from django.urls import path
from .views import UniversityListView, DepartmentListView, UniversityDepartmentsView
urlpatterns = [     

    path('universities/', UniversityListView.as_view(), name='university-list'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('universities/<str:university_id>/departments/', UniversityDepartmentsView.as_view(), name='university-departments'),

    ]