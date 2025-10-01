from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import University,Department
from .serializers import UniversitySerializer,DepartmentSerializer
# Create your views here.



class UniversityListView(APIView):
    """
    API endpoint to list all universities.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, id=None):
        if id:
            try:
                university = University.objects.get(id=id)
                serializer = UniversitySerializer(university)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except University.DoesNotExist:
                return Response({"error": "University not found."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            universities = University.objects.all()
            serializer = UniversitySerializer(universities, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self, request):
        serializer = UniversitySerializer(data=request.data)
        if serializer.is_valid():
            university = serializer.save()
            return Response(UniversitySerializer(university).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DepartmentListView(APIView):
    """
    API endpoint to list all departments.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if id:
            try:
                department = Department.objects.get(id=id)
                serializer = DepartmentSerializer(department)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Department.DoesNotExist:
                return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            departments = Department.objects.all().prefetch_related('university')
            serializer = DepartmentSerializer(departments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            department = serializer.save()
            return Response(DepartmentSerializer(department).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  




class UniversityDepartmentsView(APIView):
    """
    API endpoint to get departments of a specific university.
    Create departments for a specific university
    """
    permission_classes = [permissions.AllowAny]


    def get(self, request, university_id):
        try:
            university = University.objects.get(id=university_id)
            departments = university.departments.all()
            serializer = DepartmentSerializer(departments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except University.DoesNotExist:
            return Response({"error": "University not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, university_id):
        try:
            university = University.objects.get(id=university_id)
            serializer = DepartmentSerializer(data=request.data, many=True)  # ✅ allow multiple departments
            if serializer.is_valid():
                departments = serializer.save()
                university.departments.add(*departments)  # ✅ attach them to university
                return Response(
                    DepartmentSerializer(departments, many=True).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except University.DoesNotExist:
            return Response({"error": "University not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

