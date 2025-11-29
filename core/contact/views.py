from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,permissions
from .serializers import ContactMessageSerializer
from .email import send_contact_email

class ContactMessageCreateView(APIView):
    permission_classes = [permissions.AllowAny]


    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            contact_message = serializer.save()
            # send mail to admin mail
            send_contact_email(
                name=contact_message.name,
                email=contact_message.email,
                subject=contact_message.subject,
                message=contact_message.message
            )
            
            return Response(
                {"message": "Message received"}, 
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
