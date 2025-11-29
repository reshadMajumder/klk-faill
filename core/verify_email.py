import os
import django
from unittest.mock import patch

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.test_settings')
django.setup()

from rest_framework.test import APIRequestFactory
from contact.views import ContactMessageCreateView
from contact.models import ContactMessage

def test_email_sending():
    factory = APIRequestFactory()
    view = ContactMessageCreateView.as_view()
    
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "general",
        "message": "This is a test message."
    }
    
    request = factory.post('/contact/', data, format='json')
    
    with patch('contact.views.send_contact_email') as mock_send_email, \
         patch('contact.views.ContactMessageSerializer') as MockSerializer:
        
        # Configure the mock serializer
        mock_serializer_instance = MockSerializer.return_value
        mock_serializer_instance.is_valid.return_value = True
        
        # Create a dummy object to return from save()
        mock_contact_message = ContactMessage(
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message']
        )
        mock_serializer_instance.save.return_value = mock_contact_message
        
        response = view(request)
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
        
        if response.status_code == 201:
            print("SUCCESS: Message created successfully.")
            if mock_send_email.called:
                print("SUCCESS: send_contact_email was called.")
                args, kwargs = mock_send_email.call_args
                print(f"Called with args: {args}")
                print(f"Called with kwargs: {kwargs}")
                
                # Verify arguments
                assert kwargs['name'] == data['name']
                assert kwargs['email'] == data['email']
                assert kwargs['subject'] == data['subject']
                assert kwargs['message'] == data['message']
                print("SUCCESS: send_contact_email called with correct arguments.")
            else:
                print("FAILURE: send_contact_email was NOT called.")
        else:
            print("FAILURE: Message creation failed.")

if __name__ == "__main__":
    test_email_sending()
