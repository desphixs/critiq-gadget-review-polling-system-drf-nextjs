from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_welcome_email(to_email: str, full_name: str = '') -> None:
    """
    Sends a beautiful custom welcome email to newly registered users.
    
    Analogy:
    Think of this like sending a handwritten welcome card to a guest who just
    checked into our premium hotel. We want to welcome them warmly, address them
    by name, and introduce them to the dashboard lobby experience!
    """
    # 1. Establish a friendly, welcoming subject line
    subject = 'Welcome to Staqed!'
    
    # 2. Package user identity into the rendering context
    context = {
        'name': full_name or 'there',
        'frontend_url': settings.FRONTEND_URL,
    }
    
    # 3. Render the HTML version of our welcome template
    html_message = render_to_string('emails/welcome.html', context)
    
    # 4. Generate a plain text fallback copy for simple email clients
    plain_message = strip_tags(html_message)

    # 5. Dispatch the email using Django's core mail dispatcher
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_magic_link_email(to_email: str, magic_link: str, full_name: str = '') -> None:
    """
    Sends a magic link email to the user.
    The link contains a secure, time-restricted token that logs them in instantly when clicked.
    """
    subject = 'Your Sign-In Link for Staqed'
    
    context = {
        'name': full_name or 'there',
        'magic_link': magic_link
    }
    
    html_message = render_to_string('emails/magic_link.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


def send_otp_email(to_email: str, otp_code: str, full_name: str = '') -> None:
    """
    Sends a beautiful custom OTP verification email containing a 6-digit passcode.
    """
    subject = 'Your Staqed One-Time Passcode'
    
    context = {
        'name': full_name or 'there',
        'otp_code': otp_code
    }
    
    html_message = render_to_string('emails/otp.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(to_email: str, reset_link: str, full_name: str = '') -> None:
    """
    Sends a beautiful custom password reset email containing a secure, time-restricted token link.
    """
    subject = 'Reset Your Password - Staqed'
    
    context = {
        'name': full_name or 'there',
        'reset_link': reset_link
    }
    
    html_message = render_to_string('emails/password_reset.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )
