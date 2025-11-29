from django.core.mail import send_mail
from django.conf import settings

def send_contact_email(name, email, subject, message):
    email_subject = f"CG-Lagbe Contact Message: {subject}"
    email_body = f"""
    You have received a new message from the contact form.

    Name: {name}
    Email: {email}
    Subject: {subject}
    
    Message:
    {message}
    """
    
    send_mail(
        email_subject,
        email_body,
        settings.EMAIL_HOST_USER,
        ['hi@reshad.dev'],
        fail_silently=False,
    )
