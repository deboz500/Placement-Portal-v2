from unittest.mock import patch

from application.tasks import status_update


def test_status_update_sends_email_to_student():
    with patch("application.tasks.send_email", return_value=True) as mock_send:
        status_update(
            "student@example.com",
            "Alice",
            "TechCorp",
            "Software Engineer",
            "shortlisted",
            "You matched the profile.",
        )

    mock_send.assert_called_once()
    recipient, subject, message = mock_send.call_args.args[:3]
    assert recipient == "student@example.com"
    assert "shortlisted" in subject
    assert "Alice" in message
    assert "TechCorp" in message
